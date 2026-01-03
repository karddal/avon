import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import AppSidebar from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import NotificationBar from "@/components/notifications-bar";
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
      <Suspense fallback={<Loading />}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <SidebarTrigger className="-ml-1" />
            <p className="font-normal text-xl">Units</p>
          </div>
          <NotificationBar></NotificationBar>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
