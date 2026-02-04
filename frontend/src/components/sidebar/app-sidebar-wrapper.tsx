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

export default async function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="p-0">
        <SidebarMenu>
          <SidebarMenuItem className="md:py-0">
            <SidebarMenuButton
              className="size-25 w-full justify-center md:justify-center border-b"
              asChild
            >
              <div>
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/avon-white-optimized.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  loading={"eager"}
                  className="dark:block hidden p-4 md:p-0"
                />
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/avon-black-optimized.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  className="dark:hidden p-4 md:p-0"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Suspense fallback={<SidebarLoading />}>
        <AppSideBarContent></AppSideBarContent>
      </Suspense>
      <Jump />
    </Sidebar>
  );
}
