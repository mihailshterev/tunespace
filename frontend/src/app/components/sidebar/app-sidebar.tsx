import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import {
  Home,
  LogOut,
  CalendarDays,
  Newspaper,
  MessageSquare,
  Users,
  DiscAlbum,
  User,
  AudioLines,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import useAuth from "@/shared/auth/hooks/useAuth";
import { ROUTES } from "@/shared/utils/constants";
import {
  ADMIN_ROLES,
  BAND_DASHBOARD_ROLES,
  hasRole,
} from "@/shared/auth/permissions";
import useLogout from "@/shared/auth/hooks/useLogout";
import { cn } from "@/shared/utils/cn";
import useProfileData from "@/features/profile/hooks/useProfileData";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";

type NavLinkItem = {
  id: number;
  to: string;
  text: string;
  icon: ReactNode;
};

export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { auth } = useAuth();
  const { logout } = useLogout();

  const { profile } = useProfileData(
    auth?.username || "",
    auth?.username || "",
  );

  const userInitials = auth?.username
    ? auth.username.substring(0, 2).toUpperCase()
    : "TS";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationLinks: NavLinkItem[] = [
    {
      id: 1,
      to: ROUTES.HOME,
      text: "Home",
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: 3,
      to: ROUTES.DISCOVER,
      text: "Discover",
      icon: <AudioLines className="h-4 w-4" />,
    },
  ];

  // Users without a band role can't open the dashboard, so point them at band registration instead.
  const canAccessBandDashboard = hasRole(auth?.role, BAND_DASHBOARD_ROLES);
  const bandDashboardLink: NavLinkItem = {
    id: 4,
    to: canAccessBandDashboard ? ROUTES.BAND_DASHBOARD : ROUTES.BAND_REGISTER,
    text: canAccessBandDashboard ? "Band Dashboard" : "Create Band",
    icon: <DiscAlbum className="h-4 w-4" />,
  };

  const contentLinks: NavLinkItem[] = [
    {
      id: 5,
      to: ROUTES.NEWS,
      text: "News",
      icon: <Newspaper className="h-4 w-4" />,
    },
    {
      id: 6,
      to: ROUTES.EVENTS,
      text: "Events",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      id: 7,
      to: "/forums",
      text: "Forums",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 8,
      to: "/messages",
      text: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];

  const allNavigationLinks = [...navigationLinks, bandDashboardLink];

  const adminLinks: NavLinkItem[] = hasRole(auth?.role, ADMIN_ROLES)
    ? [
        {
          id: 9,
          to: ROUTES.ADMIN_USERS,
          text: "User Management",
          icon: <ShieldCheck className="h-4 w-4" />,
        },
      ]
    : [];

  // Nested pages (e.g. a forum thread) keep their section highlighted.
  const isLinkActive = (to: string) =>
    pathname === to || pathname.startsWith(`${to}/`);

  // The Sidebar root is itself a Tailwind `group`, so these rows use a named
  // group (`group/nav`); a bare `group-hover:` would light up every row whenever
  // the pointer was anywhere over the sidebar.
  const renderNavLinks = (links: NavLinkItem[]) =>
    links.map((link) => {
      const isActive = isLinkActive(link.to);

      return (
        <SidebarMenuItem key={link.id}>
          <SidebarMenuButton
            asChild
            tooltip={link.text}
            isActive={isActive}
            className={cn(
              "group/nav relative rounded-md border border-transparent transition-all duration-300",
              "hover:border-indigo-500/20",
              isActive &&
                "border-indigo-500/20 bg-gradient-to-r from-sidebar-accent to-sidebar-accent/30",
            )}
          >
            <Link to={link.to}>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-1.5 left-0 w-1 rounded-full transition-colors duration-300",
                  isActive
                    ? "bg-indigo-500 shadow-[0_0_8px_rgba(var(--sidebar-primary-rgb),0.5)]"
                    : "bg-transparent group-hover/nav:bg-indigo-500/30",
                )}
              />
              <span
                className={cn(
                  "shrink-0 transition-colors duration-300",
                  isActive
                    ? "text-indigo-100"
                    : "text-indigo-200/80 group-hover/nav:text-indigo-300",
                )}
              >
                {link.icon}
              </span>
              <span>{link.text}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-indigo-500/20 bg-gradient-to-b from-sidebar-background via-sidebar-background/95 to-sidebar-background shadow-md"
    >
      <div
        className={cn(
          "px-4 py-3 m-2 rounded-lg transition-all duration-300 cursor-pointer",
          pathname.startsWith(`${ROUTES.PROFILE}/${auth?.username}`)
            ? "bg-gradient-to-r from-indigo-900/50 via-indigo-600/30 to-indigo-900/50 text-white shadow-md border border-indigo-500/30 animate-[gradient-shift_3s_ease_infinite]"
            : "text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-sm",
        )}
        onClick={() => navigate(`${ROUTES.PROFILE}/${auth?.username}`)}
      >
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              "h-10 w-10 border-2 shadow-md transition-all duration-300",
              pathname.startsWith(`${ROUTES.PROFILE}/${auth?.username}`)
                ? "border-indigo-500 shadow-indigo-500/20"
                : "border-sidebar-accent hover:border-indigo-400",
            )}
          >
            <AvatarImage
              src={
                profile?.profilePicture
                  ? `data:image/png;base64,${profile.profilePicture}`
                  : undefined
              }
              className="object-cover"
              alt={auth?.username || "User"}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="font-medium truncate text-sm">{auth?.username}</div>
            <div
              className={cn(
                "text-xs truncate",
                pathname.startsWith(`${ROUTES.PROFILE}/${auth?.username}`)
                  ? "text-gray-200"
                  : "text-gray-400",
              )}
            >
              {auth?.role || "User"}
            </div>
          </div>
          <User
            className={cn(
              "h-4 w-4",
              pathname.startsWith(`${ROUTES.PROFILE}/${auth?.username}`)
                ? "text-white"
                : "text-gray-400",
            )}
          />
        </div>
      </div>
      <SidebarSeparator className="bg-gradient-to-r from-indigo-500/5 via-indigo-500/20 to-indigo-500/5 h-px my-2" />
      <SidebarContent>
        <SidebarGroup className="animate-[fade-in_0.4s_ease_forwards] opacity-0">
          <SidebarGroupLabel className="text-indigo-100/70 font-semibold">
            Music & Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavLinks(allNavigationLinks)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-indigo-300/10" />
        <SidebarGroup className="animate-[fade-in_0.5s_ease_forwards] opacity-0">
          <SidebarGroupLabel className="text-indigo-100/70 font-semibold">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavLinks(contentLinks)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {adminLinks.length > 0 && (
          <>
            <SidebarSeparator className="bg-indigo-300/10" />
            <SidebarGroup className="animate-[fade-in_0.55s_ease_forwards] opacity-0">
              <SidebarGroupLabel className="text-indigo-100/70 font-semibold">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavLinks(adminLinks)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="animate-[fade-in_0.6s_ease_forwards] opacity-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Log Out"
                  className="group/nav relative rounded-md border border-transparent transition-all duration-300 text-red-400 hover:border-red-500/20 hover:text-red-300 focus-visible:text-red-300"
                  onClick={handleLogout}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-transparent transition-colors duration-300 group-hover/nav:bg-red-500/30"
                  />
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
