"use client";

import type { User as BetterAuthUser } from "better-auth";
import { SettingsIcon, User } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import SettingsContents from "@/components/settings/settings-contents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export default function SidebarBottomActions({
  user,
  userName,
  role,
}: {
  user: BetterAuthUser;
  userName: string;
  role: string;
}) {
  return (
    <div className="flex flex-col border-t">
      <Dialog>
        <div className="flex flex-col border-t">
          <SidebarMenuButton
            asChild
            key="Settings"
            className="h-full w-full hover:bg-accent"
          >
            <DialogTrigger className="">
              <SidebarMenuItem className="flex h-full w-full flex-row items-center p-0!">
                <div className="mx-1 flex h-full w-full flex-row items-center gap-2 py-2">
                  <SettingsIcon strokeWidth={1} className="size-8!" />
                  <span className="p-2 text-accent-foreground">Settings</span>
                </div>
              </SidebarMenuItem>
            </DialogTrigger>
          </SidebarMenuButton>

          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <SettingsContents user={user} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </div>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton className="h-full w-full p-0! hover:bg-accent">
              <div className="mx-1 flex h-full w-full flex-row items-center gap-2 py-2">
                <User strokeWidth={1} className="mx-2 size-8!" />
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="w-full truncate text-sm font-medium text-accent-foreground">
                    {userName}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {role}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="center" className="w-56">
          <DropdownMenuItem className="font-normal">
            {userName}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
