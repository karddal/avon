import { ModeToggle } from "@/components/mode-toggle";
import NotificationBar from "@/components/notifications/notifications-bar";
import AppSidebar from "@/components/sidebar/app-sidebar-wrapper";
import { SidebarCloser } from "@/components/sidebar/sidebar-closer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarCloser></SidebarCloser>
      <SidebarInset className="min-h-screen lg:h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 bg-sidebar md:bg-transparent border-b md:border-0">
          <div className="flex flex-row gap-2 items-center">
            <SidebarTrigger className="-ml-1" />
            <p className="font-normal text-xl">Analytics</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <NotificationBar></NotificationBar>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3 sm:px-4 md:gap-5 lg:px-6 lg:pb-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
