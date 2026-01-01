"use server"

import {
  BookCheck,
  BookText,
  ChartLine,
  LayoutDashboard,
  Settings,
  SwatchBook,
  User,
} from "lucide-react";
import {cookies, headers} from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { Suspense } from "react";
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
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";

const adminItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    bottom: false,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartLine,
    bottom: false,
  },
  {
    title: "Markbook",
    url: "/markbook",
    icon: BookCheck,
    bottom: false,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    bottom: true,
  },
  {
    title: "Units",
    url: "/units",
    icon: SwatchBook,
    bottom: false,
  },
  {
    title: "Coursework",
    url: "/coursework",
    icon: BookText,
    bottom: false,
  },
];

const studentItems = [
  {
    title: "Units",
    url: "/units",
    icon: SwatchBook,
    bottom: false,
  },
  {
    title: "Coursework",
    url: "/coursework",
    icon: BookText,
    bottom: false,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    bottom: true,
  },
];

async function AppSidebarContent({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const state = await auth.api.getSession({
    headers: await headers(),
  });

  if (!state) {
    redirect("/login")
  }

  const user = state.user;
  let role = user.role;

  if (!role) {
    role = "user";
  }
  const items = (role === "lecturer") ? adminItems : studentItems;

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="py-4 md:py-0">
            <SidebarMenuButton
              className="size-20 w-full justify-center md:justify-center md:aspect-square"
              asChild
            >
              <div>
                <Image
                  src={`/images/avon-white-optimized.svg`}
                  alt="logo"
                  width={200}
                  height={200}
                  className="dark:block hidden p-4 md:p-0"
                />
                <Image
                  src={`/images/avon-black-optimized.svg`}
                  alt="logo"
                  width={200}
                  height={200}
                  className="dark:hidden p-4 md:p-0"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarMenu className="flex flex-col justify-center md:justify-between h-full">
            <div className="flex flex-row flex-wrap justify-center items-center md:flex-col ">
              {items
                .filter((item) => !item.bottom)
                .map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="aspect-square md:flex-1 md:!h-full md:!w-full"
                  >
                    <SidebarMenuButton className="h-full" asChild>
                      <Link
                        href={item.url}
                        className="flex flex-col justify-center items-center !h-32 !w-32 md:!h-full md:!w-full aspect-square"
                      >
                        <item.icon strokeWidth={1} className="!size-8" />
                        <span className="text-accent-foreground">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </div>

            {/* bottom part of sidebar */}
            <div className="flex flex-row flex-wrap justify-center items-center md:flex-col">
              {items
                .filter((item) => item.bottom)
                .map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="aspect-square md:flex-1 md:!h-full md:!w-full"
                  >
                    <SidebarMenuButton className="h-full" asChild>
                      <Link
                        href={item.url}
                        className="flex flex-col justify-center items-center !h-32 !w-32 md:!h-full md:!w-full aspect-square"
                      >
                        <item.icon strokeWidth={1} className="!size-8" />
                        <span className="text-accent-foreground">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              <SidebarMenuItem
                key={"Account"}
                className="aspect-square hidden md:flex md:flex-1 md:!h-full md:!w-full"
              >
                <SidebarMenuButton
                  className="flex aspect-square justify-center align-center !h-full"
                  asChild
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="!h-full hover:bg-accent-foreground/10">
                      <Link
                        href="#"
                        className="flex flex-col justify-center items-center !h-32 !w-32 md:!h-full md:!w-full aspect-square"
                      >
                        <User strokeWidth={1} className="!size-8" />
                        <span className="text-accent-foreground text-sm">
                          Account
                        </span>
                      </Link>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right">
                      <DropdownMenuItem>{user.name}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default async function AppSidebar() {
  return (
    <Suspense>
      <AppSidebarContent />
    </Suspense>
  );
}
