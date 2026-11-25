import { Suspense } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/app/components/sidebar/app-sidebar";
import Header from "@/app/components/header/header";
import LogoutOverlay from "@/app/components/logout-overlay";
import Loading from "@/shared/ui/loading";
import { SidebarProvider } from "@/shared/ui/sidebar";
import useAuth from "@/shared/auth/hooks/useAuth";
import useAuthSync from "@/shared/auth/hooks/useAuthSync";

export function AppLayout() {
  const { isLoggingOut } = useAuth();
  useAuthSync();

  return (
    <>
      <LogoutOverlay isVisible={isLoggingOut} />
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
          <Header />
          <div>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
