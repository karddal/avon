"use client";

import { DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";

type AnalyticsLoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function AnalyticsLoadingState({
  title = "Crunching the data",
  description = "Pulling together the latest activity, just like GitHub Insights.",
  className,
}: AnalyticsLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center rounded-sm border border-dashed border-border/70 bg-muted/15 p-5",
        className,
      )}
    >
      <div className="flex max-w-xs flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/60">
          <DatabaseZap className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          {title}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
        <div className="mt-4 flex items-end gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#4a8e58]" />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[#356d97]"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[#917306]"
            style={{ animationDelay: "240ms" }}
          />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[#8e2024]"
            style={{ animationDelay: "360ms" }}
          />
        </div>
      </div>
    </div>
  );
}
