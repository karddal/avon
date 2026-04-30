"use client";

import { Check, Eye, Loader2, Palette, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stop_impersonating } from "@/lib/actions/auth/impersonation";
import { cn } from "@/lib/utils";

type ImpersonationColour = "blue" | "red" | "green" | "amber" | "purple";

const IMPERSONATION_COLOUR_STORAGE_KEY = "impersonation-colour";

const impersonationColours: Record<
  ImpersonationColour,
  {
    label: string;
    swatch: string;
    frame: string;
    ring: string;
    ringDark: string;
    chrome: string;
    chromeDark: string;
    chromeBorder: string;
    chromeBorderDark: string;
    chromeTextDark: string;
    chromeShadow: string;
    chromeShadowDark: string;
    contentBorder: string;
    contentBorderDark: string;
    contentShadow: string;
    contentShadowDark: string;
    buttonHoverText: string;
    buttonHoverTextDark: string;
  }
> = {
  blue: {
    label: "Blue",
    swatch: "bg-sky-500",
    frame: "bg-sky-500 dark:bg-sky-950",
    ring: "ring-sky-950/25",
    ringDark: "dark:ring-sky-200/20",
    chrome: "bg-sky-500",
    chromeDark: "dark:bg-sky-950",
    chromeBorder: "border-sky-800/30",
    chromeBorderDark: "dark:border-sky-400/20",
    chromeTextDark: "dark:text-sky-50",
    chromeShadow:
      "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(2,132,199,0.24)]",
    chromeShadowDark:
      "dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]",
    contentBorder: "border-sky-500",
    contentBorderDark: "dark:border-sky-950",
    contentShadow:
      "shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(2,132,199,0.22)]",
    contentShadowDark:
      "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]",
    buttonHoverText: "hover:text-sky-700",
    buttonHoverTextDark: "dark:hover:text-sky-950",
  },
  red: {
    label: "Red",
    swatch: "bg-red-500",
    frame: "bg-red-500 dark:bg-red-950",
    ring: "ring-red-950/25",
    ringDark: "dark:ring-red-200/20",
    chrome: "bg-red-500",
    chromeDark: "dark:bg-red-950",
    chromeBorder: "border-red-800/30",
    chromeBorderDark: "dark:border-red-400/20",
    chromeTextDark: "dark:text-red-50",
    chromeShadow:
      "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(239,68,68,0.24)]",
    chromeShadowDark:
      "dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]",
    contentBorder: "border-red-500",
    contentBorderDark: "dark:border-red-950",
    contentShadow:
      "shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(239,68,68,0.22)]",
    contentShadowDark:
      "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]",
    buttonHoverText: "hover:text-red-700",
    buttonHoverTextDark: "dark:hover:text-red-950",
  },
  green: {
    label: "Green",
    swatch: "bg-green-500",
    frame: "bg-green-500 dark:bg-green-950",
    ring: "ring-green-950/25",
    ringDark: "dark:ring-green-200/20",
    chrome: "bg-green-500",
    chromeDark: "dark:bg-green-950",
    chromeBorder: "border-green-800/30",
    chromeBorderDark: "dark:border-green-400/20",
    chromeTextDark: "dark:text-green-50",
    chromeShadow:
      "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(34,197,94,0.24)]",
    chromeShadowDark:
      "dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]",
    contentBorder: "border-green-500",
    contentBorderDark: "dark:border-green-950",
    contentShadow:
      "shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(34,197,94,0.22)]",
    contentShadowDark:
      "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]",
    buttonHoverText: "hover:text-green-700",
    buttonHoverTextDark: "dark:hover:text-green-950",
  },
  amber: {
    label: "Amber / Orange",
    swatch: "bg-amber-500",
    frame: "bg-amber-500 dark:bg-amber-950",
    ring: "ring-amber-950/25",
    ringDark: "dark:ring-amber-200/20",
    chrome: "bg-amber-500",
    chromeDark: "dark:bg-amber-950",
    chromeBorder: "border-amber-800/30",
    chromeBorderDark: "dark:border-amber-400/20",
    chromeTextDark: "dark:text-amber-50",
    chromeShadow:
      "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(245,158,11,0.24)]",
    chromeShadowDark:
      "dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]",
    contentBorder: "border-amber-500",
    contentBorderDark: "dark:border-amber-950",
    contentShadow:
      "shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(245,158,11,0.22)]",
    contentShadowDark:
      "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]",
    buttonHoverText: "hover:text-amber-700",
    buttonHoverTextDark: "dark:hover:text-amber-950",
  },
  purple: {
    label: "Purple",
    swatch: "bg-purple-500",
    frame: "bg-purple-500 dark:bg-purple-950",
    ring: "ring-purple-950/25",
    ringDark: "dark:ring-purple-200/20",
    chrome: "bg-purple-500",
    chromeDark: "dark:bg-purple-950",
    chromeBorder: "border-purple-800/30",
    chromeBorderDark: "dark:border-purple-400/20",
    chromeTextDark: "dark:text-purple-50",
    chromeShadow:
      "shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_rgba(168,85,247,0.24)]",
    chromeShadowDark:
      "dark:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_20px_rgba(0,0,0,0.25)]",
    contentBorder: "border-purple-500",
    contentBorderDark: "dark:border-purple-950",
    contentShadow:
      "shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_18px_45px_rgba(168,85,247,0.22)]",
    contentShadowDark:
      "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_18px_45px_rgba(0,0,0,0.35)]",
    buttonHoverText: "hover:text-purple-700",
    buttonHoverTextDark: "dark:hover:text-purple-950",
  },
};

const impersonationColourOptions = Object.entries(impersonationColours) as [
  ImpersonationColour,
  (typeof impersonationColours)[ImpersonationColour],
][];

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
  const [impersonationColour, setImpersonationColour] =
    useState<ImpersonationColour>("blue");
  const [transition, setTransition] = useState<
    "impersonating" | "returning" | null
  >(null);
  const [isTransitionExiting, setIsTransitionExiting] = useState(false);
  const colourTheme = impersonationColours[impersonationColour];

  useEffect(() => {
    setTransition(getStoredImpersonationTransition());
    setImpersonationColour(getStoredImpersonationColour());
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
      setIsTransitionExiting(false);
      setImpersonationColour(getStoredImpersonationColour());
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
      setIsTransitionExiting(true);
      const timeout = window.setTimeout(() => {
        clearStoredImpersonationTransition();
        setIsTransitionExiting(false);
        setTransition(null);
      }, 220);

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
    const result = await stop_impersonating();

    if (result?.success === false) {
      toast.error(result.error);
      clearStoredImpersonationTransition();
      setIsReturningToAdmin(false);
      return;
    }

    router.replace("/management");
    router.refresh();
  }

  function updateImpersonationColour(colour: ImpersonationColour) {
    setImpersonationColour(colour);
    setStoredImpersonationColour(colour);
  }

  if (transition) {
    return (
      <ImpersonationTransitionOverlay
        colourTheme={colourTheme}
        isExiting={isTransitionExiting}
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
    <div
      className={cn(
        "fixed inset-0 overflow-hidden p-2 sm:p-3",
        colourTheme.frame,
      )}
    >
      {isReturningToAdmin ? (
        <ImpersonationTransitionOverlay
          colourTheme={colourTheme}
          isExiting={false}
          title="Returning to admin..."
          description="Restoring your session"
          contained
        />
      ) : null}
      <div
        className={cn(
          "mx-auto flex h-full max-w-[1800px] flex-col overflow-hidden rounded-xl ring-1 shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.25)_inset] dark:shadow-[0_22px_70px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)_inset]",
          colourTheme.ring,
          colourTheme.ringDark,
        )}
      >
        <div
          className={cn(
            "shrink-0 rounded-t-xl border-b px-4 py-2 text-white",
            colourTheme.chrome,
            colourTheme.chromeDark,
            colourTheme.chromeBorder,
            colourTheme.chromeBorderDark,
            colourTheme.chromeTextDark,
            colourTheme.chromeShadow,
            colourTheme.chromeShadowDark,
          )}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-sm font-medium sm:flex-row">
            <div className="flex items-center gap-2">
              <Eye className="size-4" />
              <span>Viewing as {impersonatedUserName}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 border-white/65 bg-white/10 text-white hover:border-white hover:bg-white dark:border-white/60 dark:text-white dark:hover:border-white dark:hover:bg-white",
                  colourTheme.buttonHoverText,
                  colourTheme.buttonHoverTextDark,
                )}
                onClick={stopImpersonating}
              >
                <Undo2 />
                Return to admin
              </Button>
              <ImpersonationColourPicker
                selectedColour={impersonationColour}
                onSelectColour={updateImpersonationColour}
              />
            </div>
          </div>
        </div>
        <div
          data-impersonation-content
          className={cn(
            "relative min-h-0 flex-1 transform-gpu overflow-auto overscroll-contain rounded-b-xl border-x-2 border-b-2 bg-background",
            colourTheme.contentBorder,
            colourTheme.contentBorderDark,
            colourTheme.contentShadow,
            colourTheme.contentShadowDark,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ImpersonationTransitionOverlay({
  title,
  description,
  colourTheme,
  isExiting,
  contained = false,
}: {
  title: string;
  description: string;
  colourTheme: (typeof impersonationColours)[ImpersonationColour];
  isExiting: boolean;
  contained?: boolean;
}) {
  return (
    <div
      className={cn(
        contained ? "absolute" : "fixed",
        "inset-0 z-[100] flex items-center justify-center overflow-hidden p-3 text-white opacity-100 transition-opacity duration-200 ease-out",
        isExiting && "opacity-0",
        colourTheme.frame,
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
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ImpersonationColourPicker({
  selectedColour,
  onSelectColour,
}: {
  selectedColour: ImpersonationColour;
  onSelectColour: (colour: ImpersonationColour) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-7 w-7 border-white/65 bg-white/10 text-white hover:border-white hover:bg-white hover:text-foreground dark:border-white/60 dark:text-white dark:hover:border-white dark:hover:bg-white"
          aria-label="Choose impersonation colour"
          title="Choose impersonation colour"
        >
          <Palette className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {impersonationColourOptions.map(([colour, option]) => (
          <DropdownMenuItem
            key={colour}
            className="cursor-pointer"
            onClick={() => onSelectColour(colour)}
          >
            <span
              className={cn(
                "size-3 rounded-full ring-1 ring-black/10",
                option.swatch,
              )}
            />
            <span>{option.label}</span>
            {selectedColour === colour ? (
              <Check className="ml-auto size-4" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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

function getStoredImpersonationColour(): ImpersonationColour {
  if (typeof window === "undefined") {
    return "blue";
  }

  const storedColour = window.sessionStorage.getItem(
    IMPERSONATION_COLOUR_STORAGE_KEY,
  );

  return isImpersonationColour(storedColour) ? storedColour : "blue";
}

function setStoredImpersonationColour(colour: ImpersonationColour) {
  window.sessionStorage.setItem(IMPERSONATION_COLOUR_STORAGE_KEY, colour);
  window.dispatchEvent(new Event("impersonation-transition-change"));
}

function isImpersonationColour(
  colour: string | null,
): colour is ImpersonationColour {
  return (
    colour === "blue" ||
    colour === "red" ||
    colour === "green" ||
    colour === "amber" ||
    colour === "purple"
  );
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
