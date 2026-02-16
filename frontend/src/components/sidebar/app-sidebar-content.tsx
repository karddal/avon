import {
  BookCheck,
  ChartLine,
  Layers,
  LayoutDashboard,
  NotepadText,
  Settings,
  SwatchBook,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SidebarLink } from "@/components/sidebar/sidebar-link";
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  {
    title: "Programmes",
    url: "/programmes",
    icon: Layers,
    bottom: false,
  },
];

const lecturerItems = [
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

export default async function AppSidebarContent() {
  const s = await requireSession();
  const type = s.user.role || "user";

  const items =
    type === "admin"
      ? adminItems
      : type === "lecturer"
        ? lecturerItems
        : studentItems;

  return (
    <SidebarContent>
      <SidebarHeader className="p-0">
        <SidebarMenu>
          <SidebarMenuItem className="md:py-0">
            <SidebarMenuButton
              className="size-25 w-full justify-center border-b"
              asChild
            >
              <Link href={type === "student" ? "/units" : "/dashboard"}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/avon-black-optimized.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  className="dark:hidden p-4 md:p-0"
                />
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/avon-white-optimized.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  className="hidden dark:block p-4 md:p-0"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarGroup className="h-full p-0">
        <SidebarMenu className="flex h-full flex-col md:justify-between">
          <div className="flex flex-col py-2">
            <div className="w-full text-center text-muted-foreground text-sm pb-2">
              Use{" "}
              <KbdGroup>
                <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
              </KbdGroup>{" "}
              to jump.
            </div>

            {items
              .filter((item) => !item.bottom)
              .map((item) => (
                <SidebarMenuItem key={item.title} className="w-full h-full p-0">
                  <SidebarMenuButton asChild className="h-full p-0">
                    <SidebarLink url={item.url}>
                      <item.icon strokeWidth={1} className="size-8! mx-2" />
                      <span className="text-accent-foreground text-lg">
                        {item.title}
                      </span>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </div>

          <div className="flex flex-col border-t">
            {items
              .filter((item) => item.bottom)
              .map((item) => (
                <SidebarMenuItem key={item.title} className="w-full h-full p-0">
                  <SidebarMenuButton asChild className="h-full p-0">
                    <SidebarLink url={item.url}>
                      <item.icon strokeWidth={1} className="size-8! mx-2" />
                      <span className="text-accent-foreground">
                        {item.title}
                      </span>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuItem key={"Account"} className="w-full">
                  <SidebarMenuButton className="h-full w-full p-0! hover:bg-accent">
                    <div className="flex flex-row items-center w-full h-full py-2 gap-2 mx-1">
                      <User strokeWidth={1} className="size-8! mx-2" />
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-accent-foreground text-sm font-medium truncate w-full">
                          {s.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs capitalize">
                          {type}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" className="w-56">
                <DropdownMenuItem className="font-normal">
                  {s.user.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
