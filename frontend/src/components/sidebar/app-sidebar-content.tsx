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
import Link from "next/link";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { requireSession } from "@/lib/auth-utils";
import LogoutButton from "../logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

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

export default async function AppSideBarContent() {
  const s = await requireSession();
  let type = s.user.role;
  if (!type) {
    type = "user";
  }
  const items = type === "lecturer" ? adminItems : studentItems;
  return (
    <SidebarContent>
      <SidebarGroup className="h-full">
        <SidebarMenu className="flex h-full flex-col md:justify-between">
          <div className="flex flex-col gap-4">
            <p
              className={
                "sr-only md:not-sr-only text-muted-foreground self-center text-sm"
              }
            >
              Use{" "}
              <KbdGroup>
                <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
              </KbdGroup>{" "}
              to jump.
            </p>
            {items
              .filter((item) => !item.bottom)
              .map((item) => (
                <SidebarMenuItem key={item.title} className="w-full">
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex flex-row">
                      <item.icon strokeWidth={1} className="size-8!" />
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
                      <item.icon strokeWidth={1} className="size-8!" />
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
                      <User strokeWidth={1} className="size-10!" />
                      <div className={"flex flex-col w-full items-start"}>
                        <span className="text-accent-foreground text-sm">
                          {s.user.name}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </div>
                      <ArrowUpDown strokeWidth={2} className={"self-center"} />
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="start">
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
  );
}
