"use client";

import { DoorOpen, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  clearStoredImpersonationTransition,
  setStoredImpersonationTransition,
} from "@/components/impersonation-banner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { stop_impersonating } from "@/lib/actions/auth/impersonation";
import { logout } from "@/lib/actions/auth/login";

export default function LogoutButton() {
  const router = useRouter();
  const isImpersonating = Boolean(
    sessionStorage.getItem("impersonation-active"),
  );
  // const router = useRouter();

  async function stopImpersonating() {
    setStoredImpersonationTransition("returning");
    const result = await stop_impersonating();

    if (result?.success === false) {
      toast.error(result.error);
      clearStoredImpersonationTransition();
      return;
    }

    router.replace("/management");
    router.refresh();
  }

  async function lo() {
    await logout();
    window.location.href = "/login";
  }
  return (
    <>
      {isImpersonating ? (
        <DropdownMenuItem onClick={stopImpersonating}>
          <Undo2 />
          Exit Impersonation
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={lo}>
          <DoorOpen />
          Logout
        </DropdownMenuItem>
      )}
    </>
  );
}
