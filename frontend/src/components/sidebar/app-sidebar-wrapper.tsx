"use server";
import { Suspense } from "react";
import Jump from "@/components/navi/jump-wrapper";
import { Sidebar } from "@/components/ui/sidebar";
import AppSideBarContent from "./app-sidebar-content";
import SidebarLoading from "./sidebar-loading";

export default async function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <Suspense fallback={<SidebarLoading />}>
        <AppSideBarContent></AppSideBarContent>
      </Suspense>
      <Jump />
    </Sidebar>
  );
}
function _requireSession() {
  throw new Error("Function not implemented.");
}
