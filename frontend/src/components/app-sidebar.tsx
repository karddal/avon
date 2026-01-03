"use server";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  BookCheck,
  BookText,
  ChartLine,
  LayoutDashboard,
  NotepadText,
  Settings,
  SwatchBook,
  User,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";
import { requireSession } from "@/lib/auth-utils";

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
    icon: NotepadText,
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
    icon: NotepadText,
    bottom: false,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    bottom: true,
  },
];

export default async function AppSidebar() {
  const s = await requireSession();
  let type = s.user.role;
  if (!type) {
    type = "user";
  }
  const items = type === "lecturer" ? adminItems : studentItems;

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
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarMenu className="flex h-full flex-col md:justify-between">
            <div className="flex flex-col gap-4">
              {items
                .filter((item) => !item.bottom)
                .map((item) => (
                  <SidebarMenuItem key={item.title} className="w-full">
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex flex-row">
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
            <div className="flex flex-col gap-4 items-start">
              {items
                .filter((item) => item.bottom)
                .map((item) => (
                  <SidebarMenuItem key={item.title} className="w-full">
                    <SidebarMenuButton className="h-full" asChild>
                      <Link
                        href={item.url}
                        className="flex flex-row items-center"
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
                className="flex flex-col gap-4 items-start w-full"
              >
                <SidebarMenuButton className="h-full w-full" asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full hover:bg-accent-foreground/10">
                      <Link
                        href="#"
                        className="flex flex-row w-full items-start h-full"
                      >
                        <User strokeWidth={1} className="!size-10" />
                        <div className={"flex flex-col w-full items-start"}>
                          <span className="text-accent-foreground text-sm">
                            {s.user.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </div>
                        <ArrowUpDown
                          strokeWidth={2}
                          className={"self-center"}
                        />
                      </Link>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right">
                      <DropdownMenuItem>{s.user.name}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <LogoutButton />
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
