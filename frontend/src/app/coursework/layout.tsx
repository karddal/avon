import AppSidebar from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import NotificationBar from "@/components/notifications-bar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await auth.api.getSession({
    headers: await headers(),
  });

  if (!state) {
    throw new Error("Not signed in");
  }

  const user = state.user;
  let role = user.role;

  if (!role) {
    role = "user";
  }

  return (
    <SidebarProvider>
      {/*<AppSidebar type={role} userName={user.name}/>*/}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <SidebarTrigger className="-ml-1" />
            <p className="font-normal text-xl">Courseworks</p>
          </div>
          <NotificationBar></NotificationBar>
        </header>
        <div className="flex min-h-0 flex-col gap-4 px-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
