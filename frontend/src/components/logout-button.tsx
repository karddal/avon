"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/login";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function lo() {
    await logout();
    router.push("/login");
  }
  return <DropdownMenuItem onClick={lo}>Logout</DropdownMenuItem>;
}
