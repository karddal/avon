import {
  BookCheck,
  ChartLine,
  Layers,
  LayoutDashboard,
  NotepadText,
  Settings, SettingsIcon,
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import SettingsContents from "@/components/settings/settings-contents";

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

          {/* bottom part of sidebar */}
          <Dialog>
            <div className="flex flex-col border-t">
              <SidebarMenuButton asChild key={"Settings"} className={"w-full"}>
                  <DialogTrigger
                      className="h-full flex flex-row items-center"
                  >
                    <SettingsIcon strokeWidth={1} className="size-8!" />
                    <span className="text-accent-foreground">
                  {"Settings"}
                </span>
                </DialogTrigger>
              </SidebarMenuButton>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                  <SettingsContents/>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"outline"}>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
                </div>
          </Dialog>

        </SidebarMenu>
        <SidebarMenuItem key={"Account"} className="w-full">
          <SidebarMenuButton className="h-full" asChild>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <Link
                  href="#"
                  className="flex flex-row w-full items-start gap-2 h-full hover:bg-accent-foreground/10 p-2"
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
                  {/* <ArrowUpDown strokeWidth={2} className={"self-center"} /> */}
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
      </SidebarGroup>
    </SidebarContent>
  );
}
