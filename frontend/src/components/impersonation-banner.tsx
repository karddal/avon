"use client";

import { Eye, Loader2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { stop_impersonating } from "@/lib/actions/auth/impersonation";

export default function ImpersonationBanner({
  children,
  initialIsImpersonating,
  initialImpersonatedUserName,
}: {
  children: React.ReactNode;
  initialIsImpersonating: boolean;
  initialImpersonatedUserName?: string;
}) {
  const router = useRouter();
  const isBetterAuthImpersonating = initialIsImpersonating;
  const [isStoredImpersonating, setIsStoredImpersonating] = useState(
    initialIsImpersonating,
  );
  const [storedImpersonatedUserName, setStoredImpersonatedUserName] = useState(
    initialImpersonatedUserName ?? null,
  );
  const isImpersonating = isBetterAuthImpersonating || isStoredImpersonating;
  const [isReturningToAdmin, setIsReturningToAdmin] = useState(false);
  const [transition, setTransition] = useState<
    "impersonating" | "returning" | null
  >(null);

  useEffect(() => {
    setTransition(getStoredImpersonationTransition());
    setIsStoredImpersonating(
      initialIsImpersonating || getStoredImpersonationActive(),
    );
    setStoredImpersonatedUserName(
      initialImpersonatedUserName ?? getStoredImpersonatedUserName(),
    );
  }, [initialImpersonatedUserName, initialIsImpersonating]);

  useEffect(() => {
    function handleTransitionChange() {
      const nextTransition = getStoredImpersonationTransition();
      setTransition(nextTransition);
      setIsStoredImpersonating(getStoredImpersonationActive());
      setStoredImpersonatedUserName(getStoredImpersonatedUserName());

      if (nextTransition !== "returning") {
        setIsReturningToAdmin(false);
      }
    }

    window.addEventListener(
      "impersonation-transition-change",
      handleTransitionChange,
    );
    window.addEventListener("storage", handleTransitionChange);

    return () => {
      window.removeEventListener(
        "impersonation-transition-change",
        handleTransitionChange,
      );
      window.removeEventListener("storage", handleTransitionChange);
    };
  }, []);

  useEffect(() => {
    if (!transition) return;

    if (transition === "impersonating" && isImpersonating) {
      const timeout = window.setTimeout(() => {
        clearStoredImpersonationTransition();
        setTransition(null);
      }, 350);

      return () => window.clearTimeout(timeout);
    }

    if (transition === "returning" && !isBetterAuthImpersonating) {
      const timeout = window.setTimeout(() => {
        clearStoredImpersonationActive();
        clearStoredImpersonationTransition();
        setIsStoredImpersonating(false);
        setIsReturningToAdmin(false);
        setTransition(null);
      }, 350);

      return () => window.clearTimeout(timeout);
    }
  }, [isBetterAuthImpersonating, isImpersonating, transition]);

  useEffect(() => {
    if (!isImpersonating) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isImpersonating]);

  async function stopImpersonating() {
    setIsReturningToAdmin(true);
    setTransition("returning");
    setStoredImpersonationTransition("returning");
    const result = await stop_impersonating();

    if (result?.success === false) {
      toast.error(result.error);
      clearStoredImpersonationTransition();
      setIsReturningToAdmin(false);
      return;
    }

    clearStoredImpersonationActive();
    clearStoredImpersonationTransition();
    setIsStoredImpersonating(false);
    setIsReturningToAdmin(false);
    setTransition(null);
    router.replace("/management");
    router.refresh();
  }

  if (transition) {
    return (
      <ImpersonationTransitionOverlay
        title={
          transition === "impersonating"
            ? "Loading impersonation view..."
            : "Returning to admin..."
        }
        description={
          transition === "impersonating"
            ? "Preparing the impersonated session"
            : "Restoring your session"
        }
      />
    );
  }

  if (!isImpersonating) {
    return <>{children}</>;
  }
  const impersonatedUserName =
    isBetterAuthImpersonating && initialImpersonatedUserName
      ? initialImpersonatedUserName
      : (storedImpersonatedUserName ?? "selected user");

  return (
    <div className="fixed inset-0 overflow-hidden bg-sky-500 p-2 dark:bg-sky-950 sm:p-3">
      {isReturningToAdmin ? (
        <ImpersonationTransitionOverlay
          title="Returning to admin..."
          description="Restoring your session"
          contained
        />
      ) : null}
      <div className="mx-auto flex h-full max-w-[1800px] flex-col overflow-hidden rounded-xl ring-1 ring-sky-950/25 shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.25)_inset] dark:ring-sky-200/20 dark:shadow-[0_22px_70px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)_inset]">
        <div className="shrink-0 rounded-t-xl border-b border-sky-800/30 bg-sky-500 px-4 py-2 text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(2,132,199,0.24)] dark:border-sky-400/20 dark:bg-sky-950 dark:text-sky-50 dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col items-center justify-center gap-2 text-sm font-medium sm:flex-row">
            <div className="flex items-center gap-2">
              <Eye className="size-4" />
              <span>Viewing as {impersonatedUserName}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-white/65 bg-white/10 text-white hover:border-white hover:bg-white hover:text-sky-700 dark:border-sky-300/60 dark:text-sky-50 dark:hover:border-sky-100 dark:hover:bg-sky-100 dark:hover:text-sky-950"
              onClick={stopImpersonating}
            >
              <Undo2 />
              Return to admin
            </Button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 transform-gpu overflow-auto overscroll-contain rounded-b-xl border-x-2 border-b-2 border-sky-500 bg-background shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(2,132,199,0.22)] dark:border-sky-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function ImpersonationTransitionOverlay({
  title,
  description,
  contained = false,
}: {
  title: string;
  description: string;
  contained?: boolean;
}) {
  return (
    <div
      className={`${contained ? "absolute" : "fixed"} inset-0 z-[100] flex items-center justify-center overflow-hidden bg-sky-500 p-3 text-white dark:bg-sky-950`}
    >
      <div className="absolute inset-3 rounded-xl border border-white/30 shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.25)_inset] animate-in fade-in-0 zoom-in-95 duration-300" />
      <div className="absolute inset-x-3 top-3 h-12 rounded-t-xl border-b border-white/30 bg-white/10 animate-in slide-in-from-top-2 fade-in-0 duration-300" />
      <div className="relative flex flex-col items-center gap-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex size-14 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </div>
    </div>
  );
}

function getStoredImpersonationTransition() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTransition = window.sessionStorage.getItem(
    "impersonation-transition",
  );

  return storedTransition === "impersonating" ||
    storedTransition === "returning"
    ? storedTransition
    : null;
}

export function setStoredImpersonationTransition(
  transition: "impersonating" | "returning",
) {
  window.sessionStorage.setItem("impersonation-transition", transition);
  window.dispatchEvent(new Event("impersonation-transition-change"));
}

export function clearStoredImpersonationTransition() {
  window.sessionStorage.removeItem("impersonation-transition");
  window.dispatchEvent(new Event("impersonation-transition-change"));
}

export function clearStoredReturnTransition() {
  if (
    window.sessionStorage.getItem("impersonation-transition") === "returning"
  ) {
    clearStoredImpersonationTransition();
  }
}

function getStoredImpersonationActive() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem("impersonation-active") === "true";
}

function getStoredImpersonatedUserName() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem("impersonation-user-name");
}

export function setStoredImpersonationActive(userName?: string) {
  window.sessionStorage.setItem("impersonation-active", "true");

  if (userName) {
    window.sessionStorage.setItem("impersonation-user-name", userName);
  }

  window.dispatchEvent(new Event("impersonation-transition-change"));
}

export function clearStoredImpersonationActive() {
  window.sessionStorage.removeItem("impersonation-active");
  window.sessionStorage.removeItem("impersonation-user-name");
  window.dispatchEvent(new Event("impersonation-transition-change"));
}
