"use client";

import { DoorOpen } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth/login";

export default function LogoutButton() {
  // const router = useRouter();
  async function lo() {
    await logout();
    window.location.href = "/login";
  }
  return (
    <DropdownMenuItem onClick={lo}>
      <DoorOpen />
      Logout
    </DropdownMenuItem>
  );
}
