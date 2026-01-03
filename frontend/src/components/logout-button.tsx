"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/login";

export default function LogoutButton() {
  // const router = useRouter();
  async function lo() {
    await logout();
    window.location.href = "/login";
  }
  return <DropdownMenuItem onClick={lo}>Logout</DropdownMenuItem>;
}
