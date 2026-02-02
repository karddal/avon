import Jump from "@/components/navi/jump-wrapper";
import AppSidebarContent from "@/components/sidebar/app-sidebar-content";
import { Sidebar } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <Suspense>
        <AppSidebarContent></AppSidebarContent>
      </Suspense>
      <Jump />
    </Sidebar>
  );
}
