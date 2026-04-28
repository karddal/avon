"use client";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Lock,
  PlayCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SetupProgressArea = {
  title: string;
  description: string;
  detail: string;
  status: "complete" | "action" | "ready" | "blocked";
};

function getStatusMeta(status: SetupProgressArea["status"]) {
  if (status === "complete") {
    return {
      label: "Complete",
      icon: CheckCircle,
      badgeClass:
        "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400",
      panelClass: "border-green-500/30 bg-green-500/5",
      iconWrapClass: "bg-green-500/10",
      iconClass: "text-green-600",
      dotClass: "bg-green-300 dark:bg-green-900",
      activeDotClass: "bg-green-600 dark:bg-green-400",
    };
  }

  if (status === "action") {
    return {
      label: "Action Needed",
      icon: CircleDashed,
      badgeClass:
        "border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
      panelClass: "border-orange-500/30 bg-orange-500/5",
      iconWrapClass: "bg-orange-500/10",
      iconClass: "text-orange-600",
      dotClass: "bg-orange-300 dark:bg-orange-900",
      activeDotClass: "bg-orange-600 dark:bg-orange-400",
    };
  }

  if (status === "ready") {
    return {
      label: "Ready",
      icon: PlayCircle,
      badgeClass:
        "border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
      panelClass: "border-blue-500/30 bg-blue-500/5",
      iconWrapClass: "bg-blue-500/10",
      iconClass: "text-blue-600",
      dotClass: "bg-blue-300 dark:bg-blue-900",
      activeDotClass: "bg-blue-600 dark:bg-blue-400",
    };
  }

  return {
    label: "Blocked",
    icon: Lock,
    badgeClass:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    panelClass: "border-border bg-card",
    iconWrapClass: "bg-muted",
    iconClass: "text-muted-foreground",
    dotClass: "bg-zinc-300 dark:bg-zinc-700",
    activeDotClass: "bg-zinc-600 dark:bg-zinc-300",
  };
}

export default function SetupProgressCarousel({
  areas,
  defaultIndex,
}: {
  areas: SetupProgressArea[];
  defaultIndex: number;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const pointerStartXRef = useRef<number | null>(null);
  const wheelDeltaXRef = useRef(0);

  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  const activeArea = areas[activeIndex];
  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < areas.length - 1;
  const statusMeta = activeArea ? getStatusMeta(activeArea.status) : null;

  function goLeft() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function goRight() {
    setActiveIndex((current) => Math.min(current + 1, areas.length - 1));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStartXRef.current = event.clientX;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerStartXRef.current == null) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    const swipeThreshold = 40;

    if (deltaX >= swipeThreshold) {
      goLeft();
    } else if (deltaX <= -swipeThreshold) {
      goRight();
    }

    pointerStartXRef.current = null;
  }

  function handlePointerCancel() {
    pointerStartXRef.current = null;
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    const horizontalIntent =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : Math.abs(event.deltaY) < 4
          ? 0
          : 0;

    if (horizontalIntent === 0) {
      return;
    }

    wheelDeltaXRef.current += horizontalIntent;

    const swipeThreshold = 45;
    if (wheelDeltaXRef.current >= swipeThreshold) {
      goRight();
      wheelDeltaXRef.current = 0;
    } else if (wheelDeltaXRef.current <= -swipeThreshold) {
      goLeft();
      wheelDeltaXRef.current = 0;
    }
  }

  return (
    <Card
      className="h-full min-h-0 overflow-hidden"
      data-cy="coursework-setup-progress"
    >
      <CardHeader className="shrink-0">
        <CardTitle>
          <div className="flex flex-row items-center gap-2 text-2xl">
            <CircleDashed />
            Setup Progress
          </div>
          <div className="font-light">
            Browse the key coursework setup areas. Some depend on earlier setup,
            but others can be handled independently.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-auto min-h-0 flex-1 flex-col justify-center gap-4 overflow-auto">
        {activeArea && statusMeta ? (
          <>
            <div className="flex min-w-80 items-stretch gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-auto min-h-32 w-10 shrink-0 rounded-md hover:rounded-md focus-visible:rounded-md"
                onClick={goLeft}
                disabled={!canGoLeft}
                aria-label="Previous setup area"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div
                className={cn(
                  "touch-pan-y flex min-h-32 min-w-0 flex-1 flex-col justify-between rounded-xl border p-5 shadow-sm transition-all",
                  statusMeta.panelClass,
                )}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onWheel={handleWheel}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-tight">
                      {activeArea.title}
                    </h3>
                  </div>

                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      statusMeta.iconWrapClass,
                    )}
                  >
                    <statusMeta.icon
                      className={cn("h-5 w-5", statusMeta.iconClass)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Badge className={statusMeta.badgeClass}>
                    {statusMeta.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {activeArea.description}
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    {activeArea.detail}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-auto min-h-32 w-10 shrink-0 rounded-md hover:rounded-md focus-visible:rounded-md"
                onClick={goRight}
                disabled={!canGoRight}
                aria-label="Next setup area"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
              {areas.map((area, index) => {
                const dotMeta = getStatusMeta(area.status);

                return (
                  <button
                    type="button"
                    key={`${area.title}-${index}`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View ${area.title}`}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      index === activeIndex
                        ? dotMeta.activeDotClass
                        : dotMeta.dotClass,
                    )}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No setup areas found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
