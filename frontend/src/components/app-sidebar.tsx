import {
  BookText,
  ChartLine,
  LayoutDashboard,
  Settings,
  SwatchBook,
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
        <SidebarGroup>
          <SidebarMenu className="flex flex-row flex-wrap justify-center items-center md:flex-col md:flex-wrap md:justify md:items-center">
            {items.map((item) => (
              <SidebarMenuItem
                className=" aspect-square
                md:flex-1 md:!h-full md:!w-full"
                key={item.title}
              >
                <SidebarMenuButton className="h-full" asChild>
                  <Link
                    className="flex flex-col justify-center items-center
                    !h-32 !w-32 md:!h-full md:!w-full aspect-square"
                    href={item.url}
                  >
                    <item.icon size={100} className="!size-12" />
                    <span className="text-accent-foreground">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
