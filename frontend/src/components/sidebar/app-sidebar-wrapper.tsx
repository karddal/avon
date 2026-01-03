"use server";
import {
  ArrowUpDown,
  BookCheck,
  ChartLine,
  LayoutDashboard,
  NotepadText,
  Settings,
  SwatchBook,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="md:py-0">
            <SidebarMenuButton
              className="size-25 w-full justify-center md:justify-center"
              asChild
            >
              <div>
                <Image
                  src={`/images/avon-white-optimized.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  loading={"eager"}
                  className="dark:block hidden p-4 md:p-0"
                />
                <Image
                  src={`/images/avon-black-optimized.svg`}
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
    </Sidebar>
  );
}
