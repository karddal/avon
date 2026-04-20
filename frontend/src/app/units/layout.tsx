import { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import NotificationBar from "@/components/notifications/notifications-bar";
import AppSidebar from "@/components/sidebar/app-sidebar-wrapper";
import { SidebarCloser } from "@/components/sidebar/sidebar-closer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Suspense>
        <SidebarCloser></SidebarCloser>
      </Suspense>
      <SidebarInset className="min-h-screen lg:h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 bg-sidebar md:bg-transparent border-b md:border-0">
          <div className="flex flex-row gap-2 items-center">
            <SidebarTrigger className="-ml-1" />
            <p className="font-normal text-xl">Units</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <NotificationBar></NotificationBar>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 min-h-0 px-4 mt-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
