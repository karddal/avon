"use client";

import { DoorOpen, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  clearStoredImpersonationActive,
  clearStoredImpersonationTransition,
  setStoredImpersonationTransition,
} from "@/components/impersonation-banner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth/login";
import { stopImpersonatingInBrowser } from "@/lib/client-impersonation";

export default function LogoutButton() {
  const router = useRouter();
  const [hasStoredImpersonation, setHasStoredImpersonation] = useState(false);

  useEffect(() => {
    function syncStoredImpersonation() {
      setHasStoredImpersonation(
        window.sessionStorage.getItem("impersonation-active") === "true",
      );
    }

    syncStoredImpersonation();
    window.addEventListener(
      "impersonation-transition-change",
      syncStoredImpersonation,
    );
    window.addEventListener("storage", syncStoredImpersonation);

    return () => {
      window.removeEventListener(
        "impersonation-transition-change",
        syncStoredImpersonation,
      );
      window.removeEventListener("storage", syncStoredImpersonation);
    };
  }, []);

  async function stopImpersonating() {
    setStoredImpersonationTransition("returning");
    const result = await stopImpersonatingInBrowser();

    if (result?.success === false) {
      toast.error(result.error);
      clearStoredImpersonationTransition();
      return;
    }

    clearStoredImpersonationActive();
    router.replace("/management");
    router.refresh();
  }

  async function lo() {
    await logout();
    window.location.href = "/login";
  }
  return (
    <>
      {hasStoredImpersonation ? (
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
