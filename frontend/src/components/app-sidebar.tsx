import {
  BookText,
  ChartLine,
  LayoutDashboard,
  LogOut,
  Settings,
  SwatchBook,
  BookCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    admin: true,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartLine,
    admin: true,
  },
  {
    title: "Markbook",
    url: "/markbook",
    icon: BookCheck,
    admin: true,
    bottom: false,
  },
  {
    title: "Units",
    url: "#",
    icon: SwatchBook,
    admin: false,
  },
  {
    title: "Coursework",
    url: "/courseworks",
    icon: BookText,
    admin: false,
  },

  {
    title: "Settings",
    url: "#",
    icon: Settings,
    admin: false,
    bottom: true,
  },
  {
    title: "Log Out",
    url: "/logout",
    icon: LogOut,
    admin: false,
    bottom: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  src="/avon.png"
                  alt="logo"
                  width={200}
                  height={200}
                  className="dark:block hidden p-4 md:p-0"
                />
                <Image
                  src="/avonlight.png"
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
                        <item.icon className="!size-10" />
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
                        <item.icon className="!size-10" />
                        <span className="text-accent-foreground">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
