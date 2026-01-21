import { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import NotificationBar from "@/components/notifications-bar";
import AppSidebar from "@/components/sidebar/app-sidebar-wrapper";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <SidebarTrigger className="-ml-1" />
            <p className="font-normal text-xl">Units</p>
          </div>
          <NotificationBar />
        </header>

        <div className="flex flex-col gap-4 px-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
