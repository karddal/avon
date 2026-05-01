"use client";

import { Eye, Info, Loader2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { stopImpersonatingInBrowser } from "@/lib/client-impersonation";
import { cn } from "@/lib/utils";

const IMPERSONATION_FRAME_CLASS = "bg-red-300 dark:bg-red-950";
const IMPERSONATION_BANNER_CLASS =
  "border-red-800/30 bg-red-300 text-red-950 dark:border-red-400/20 dark:bg-red-950 dark:text-red-50";
const IMPERSONATION_BUTTON_CLASS = "hover:text-red-700 dark:hover:text-red-950";

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
  const [isTransitionExiting, setIsTransitionExiting] = useState(false);
  // retract behaviour states
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const retractTimerRef = useRef<number | null>(null);
  const [isPointerOverBanner, setIsPointerOverBanner] = useState(false);
  const [isPointerOverButton, setIsPointerOverButton] = useState(false);
  const [isRetracted, setIsRetracted] = useState(false);
  const [_bannerHeight, setBannerHeight] = useState<number | null>(null);
  const RETRACT_DELAY_MS = 100;
  const VISIBLE_STRIP_PX = 2; // visible area when retracted (enough for users to know it's there)

  useEffect(() => {
    setTransition(getStoredImpersonationTransition());
    setIsStoredImpersonating(
      initialIsImpersonating || getStoredImpersonationActive(),
    );
    setStoredImpersonatedUserName(
      initialImpersonatedUserName ?? getStoredImpersonatedUserName(),
    );
  }, [initialImpersonatedUserName, initialIsImpersonating]);

  // measure banner height and keep updated
  useEffect(() => {
    function measure() {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight || null);
      }
    }

    measure();
    if (typeof window !== "undefined" && window.ResizeObserver) {
      const ro = new window.ResizeObserver(measure);
      if (bannerRef.current) ro.observe(bannerRef.current);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const EXPAND_BACKOFF_MS = 1000;

  useEffect(() => {
    function clearRetractTimer() {
      if (retractTimerRef.current) {
        window.clearTimeout(retractTimerRef.current);
        retractTimerRef.current = null;
      }
    }

    // Expanding manually if mouse hits top of screen
    function onDocumentMouseMove(e: MouseEvent) {
      if (isRetracted && e.clientY < 30) {
        setIsRetracted(false);
      }
    }

    document.addEventListener("mousemove", onDocumentMouseMove);

    if (isPointerOverBanner && !isPointerOverButton) {
      // Hovering banner body: schedule it to retract out of the way
      clearRetractTimer();
      retractTimerRef.current = window.setTimeout(() => {
        setIsRetracted(true);
      }, RETRACT_DELAY_MS);
    } else if (!isPointerOverBanner) {
      // Left the banner: start a backoff period before expanding,
      // giving the user completely free access to content beneath it
      clearRetractTimer();
      if (isRetracted) {
        retractTimerRef.current = window.setTimeout(() => {
          setIsRetracted(false);
        }, EXPAND_BACKOFF_MS);
      }
    } else if (isPointerOverButton) {
      // Hovering buttons: forcefully keep it open
      clearRetractTimer();
      setIsRetracted(false);
    }

    return () => {
      clearRetractTimer();
      document.removeEventListener("mousemove", onDocumentMouseMove);
    };
  }, [isPointerOverBanner, isPointerOverButton, isRetracted]);
  useEffect(() => {
    function handleTransitionChange() {
      const nextTransition = getStoredImpersonationTransition();
      setTransition(nextTransition);
      setIsTransitionExiting(false);
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
    if (!transition) {
      setIsTransitionExiting(false);
      return;
    }

    if (transition === "impersonating" && isImpersonating) {
      const timeout = window.setTimeout(() => {
        clearStoredImpersonationTransition();
        setTransition(null);
      }, 200);

      return () => window.clearTimeout(timeout);
    }

    if (transition === "returning" && !isBetterAuthImpersonating) {
      setIsTransitionExiting(true);
      const timeout = window.setTimeout(() => {
        clearStoredImpersonationActive();
        clearStoredImpersonationTransition();
        setIsStoredImpersonating(false);
        setIsReturningToAdmin(false);
        setIsTransitionExiting(false);
        setTransition(null);
      }, 220);

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
    const result = await stopImpersonatingInBrowser();

    if (result?.success === false) {
      toast.error(result.error);
      clearStoredImpersonationTransition();
      setIsReturningToAdmin(false);
      return;
    }

    router.replace("/management");
    router.refresh();
  }

  if (transition) {
    return (
      <ImpersonationTransitionOverlay
        isEntering={transition === "impersonating"}
        isExiting={isTransitionExiting}
        title={
          transition === "impersonating"
            ? "Loading impersonation view..."
            : "Returning to your session..."
        }
        description={
          transition === "impersonating"
            ? "Preparing the impersonated session..."
            : "See you soon!"
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
    <div className="fixed inset-0 overflow-hidden bg-background">
      {isReturningToAdmin ? (
        <ImpersonationTransitionOverlay
          isEntering={false}
          isExiting={false}
          title="Returning to your session..."
          description="Restoring your session"
          contained
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center px-3">
        <section
          ref={bannerRef}
          aria-label="Impersonation banner"
          onMouseEnter={() => setIsPointerOverBanner(true)}
          onMouseLeave={() => setIsPointerOverBanner(false)}
          onMouseMove={(e) => {
            const target = e.target as HTMLElement | null;
            const overBtn = !!target?.closest?.("[data-no-retract]");
            setIsPointerOverButton(overBtn);
          }}
          style={{
            transform: isRetracted
              ? `translateY(calc(-100% + ${VISIBLE_STRIP_PX}px))`
              : "translateY(0)",
          }}
          className={cn(
            "pointer-events-auto flex max-w-[calc(100vw-1.5rem)] flex-col items-center justify-center gap-2 border px-4 py-2 text-sm font-medium shadow-[0_10px_24px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.35)_inset] sm:flex-row dark:shadow-[0_10px_28px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.12)_inset] transition-transform duration-300 ease-in-out",
            IMPERSONATION_BANNER_CLASS,
          )}
        >
          <div className="flex items-center gap-2">
            <Eye className="size-4" />
            <span>Viewing as {impersonatedUserName}</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-no-retract
              className={cn(
                "h-10 px-4 text-base sm:h-7 sm:px-3 sm:text-sm border-current/45 bg-white/30 text-current hover:border-current/60 hover:bg-white/70 dark:border-white/60 dark:bg-white/10 dark:text-white dark:hover:border-white dark:hover:bg-white",
                IMPERSONATION_BUTTON_CLASS,
              )}
              onClick={stopImpersonating}
            >
              <Undo2 />
              Exit Impersonation
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  data-no-retract
                  className="h-10 w-10 border-current/45 bg-white/30 text-current hover:border-current/60 hover:bg-white/70 hover:text-red-700 sm:h-7 sm:w-7 dark:border-white/60 dark:bg-white/10 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-red-950"
                  aria-label="What is impersonation?"
                >
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                showArrow={false}
                className={cn(
                  "z-[120] max-w-80 border p-3 text-left text-xs shadow-[0_10px_24px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.35)_inset] dark:shadow-[0_10px_28px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.12)_inset]",
                  IMPERSONATION_BANNER_CLASS,
                )}
              >
                <p className="mb-1 text-lg font-semibold">What is this?</p>
                <p>
                  You are currently <strong>impersonating</strong> this user.
                  <br /> This means that you see the Avon interface as they
                  would, and any actions you take will be handled as if they had
                  taken that action. <strong>Exercise caution!</strong>
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>
      </div>
      <div
        data-impersonation-content
        className="relative h-full min-h-0 transform-gpu overflow-auto overscroll-contain bg-background"
      >
        {children}
      </div>
    </div>
  );
}

function ImpersonationTransitionOverlay({
  title,
  description,
  isEntering,
  isExiting,
  contained = false,
}: {
  title: string;
  description: string;
  isEntering: boolean;
  isExiting: boolean;
  contained?: boolean;
}) {
  return (
    <div
      className={cn(
        contained ? "absolute" : "fixed",
        "inset-0 z-[100] flex items-center justify-center overflow-hidden p-3 text-red-950 opacity-100 transition-opacity duration-200 ease-out dark:text-white",
        isEntering && "animate-in fade-in-0",
        isExiting && "opacity-0",
        IMPERSONATION_FRAME_CLASS,
      )}
    >
      <div className="absolute inset-3 rounded-xl border border-white/30 shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.25)_inset] animate-in fade-in-0 zoom-in-95 duration-300" />
      <div className="absolute inset-x-3 top-3 h-12 rounded-t-xl border-b border-white/30 bg-white/10 animate-in slide-in-from-top-2 fade-in-0 duration-300" />
      <div className="relative flex flex-col items-center gap-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex size-14 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-red-950/75 dark:text-white/80">
            {description}
          </p>
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
