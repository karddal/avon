"use server";
import Image from "next/image";
import { Suspense } from "react";
import Jump from "@/components/navi/jump-wrapper";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AppSideBarContent from "./app-sidebar-content";
import SidebarLoading from "./sidebar-loading";
import Link from "next/link";

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
function requireSession() {
  throw new Error("Function not implemented.");
}
