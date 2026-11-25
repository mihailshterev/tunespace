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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import useAuth from "@/shared/auth/hooks/useAuth";
import { ROUTES } from "@/shared/utils/constants";
import { BAND_DASHBOARD_ROLES, hasRole } from "@/shared/auth/permissions";
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
  group: "navigation" | "content";
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
      group: "navigation",
    },
    {
      id: 3,
      to: ROUTES.DISCOVER,
      text: "Discover",
      icon: <AudioLines className="h-4 w-4" />,
      group: "navigation",
    },
  ];

  // Users without a band role can't open the dashboard, so point them at band registration instead.
  const canAccessBandDashboard = hasRole(auth?.role, BAND_DASHBOARD_ROLES);
  const bandDashboardLink: NavLinkItem = {
    id: 4,
    to: canAccessBandDashboard ? ROUTES.BAND_DASHBOARD : ROUTES.BAND_REGISTER,
    text: canAccessBandDashboard ? "Band Dashboard" : "Create Band",
    icon: <DiscAlbum className="h-4 w-4" />,
    group: "navigation",
  };

  const contentLinks: NavLinkItem[] = [
    {
      id: 5,
      to: ROUTES.NEWS,
      text: "News",
      icon: <Newspaper className="h-4 w-4" />,
      group: "content",
    },
    {
      id: 6,
      to: ROUTES.EVENTS,
      text: "Events",
      icon: <CalendarDays className="h-4 w-4" />,
      group: "content",
    },
    {
      id: 7,
      to: "/forums",
      text: "Forums",
      icon: <Users className="h-4 w-4" />,
      group: "content",
    },
    {
      id: 8,
      to: "/messages",
      text: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      group: "content",
    },
  ];

  const allNavigationLinks = [...navigationLinks, bandDashboardLink];

  const renderNavLinks = (group: "navigation" | "content") => {
    const links = group === "navigation" ? allNavigationLinks : contentLinks;

    return links.map((link) => {
      const isActive = pathname === link.to;

      return (
        <SidebarMenuItem key={link.id}>
          <Link to={link.to}>
            <SidebarMenuButton
              tooltip={link.text}
              isActive={isActive}
              className={cn(
                "transition-all duration-300 relative overflow-visible rounded-md",
                "group border border-transparent",
                "hover:border-indigo-500/20 hover:animate-[border-pulse-subtle_1.5s_ease_infinite]",
                isActive &&
                  "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/30 font-medium",
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 w-1 left-0 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-indigo-500 shadow-[0_0_8px_rgba(var(--sidebar-primary-rgb),0.5)]"
                    : "bg-transparent group-hover:bg-indigo-500/30",
                )}
              />
              <div
                className={cn(
                  "relative z-10 flex items-center gap-2",
                  "transition-colors duration-300",
                )}
              >
                <span
                  className={cn(
                    "text-indigo-200/80 transition-colors duration-300",
                    isActive
                      ? "text-indigo-100"
                      : "group-hover:text-indigo-300",
                  )}
                >
                  {link.icon}
                </span>
                <span>{link.text}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };

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
      <SidebarSeparator className="bg-gradient-to-r from-indigo-500/5 via-indigo-500/20 to-indigo-500/5 h-px my-2" />{" "}
      <SidebarContent>
        <SidebarGroup className="animate-[fade-in_0.4s_ease_forwards] opacity-0">
          <SidebarGroupLabel className="text-indigo-100/70 font-semibold">
            Music & Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavLinks("navigation")}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-indigo-300/10" />
        <SidebarGroup className="animate-[fade-in_0.5s_ease_forwards] opacity-0">
          <SidebarGroupLabel className="text-indigo-100/70 font-semibold">
            Content
          </SidebarGroupLabel>{" "}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavLinks("content")}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="animate-[fade-in_0.6s_ease_forwards] opacity-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Log Out"
                  className="transition-all duration-300 relative overflow-visible rounded-md group border border-transparent hover:border-red-500/20 hover:animate-[border-pulse-subtle_1.5s_ease_infinite] text-red-400 hover:text-red-300 focus:text-red-300"
                  onClick={handleLogout}
                >
                  <div className="absolute inset-y-0 w-1 left-0 rounded-full transition-all duration-300 bg-transparent group-hover:bg-red-500/30" />
                  <div className="relative z-10 flex items-center gap-2 transition-colors duration-300">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
