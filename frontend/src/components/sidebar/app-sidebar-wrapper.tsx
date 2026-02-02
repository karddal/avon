import Jump from "@/components/navi/jump-wrapper";
import AppSidebarContent from "@/components/sidebar/app-sidebar-content";
import { Sidebar } from "@/components/ui/sidebar";

export default async function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <AppSidebarContent></AppSidebarContent>
      <Jump />
    </Sidebar>
  );
}
