import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import type { CalendarEvent } from "@/components/calendar/calendar-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EventsListingCard({
  eventsMap,
  minItemWidthPx = 360,
}: {
  eventsMap: Map<string, CalendarEvent[]>;
  minItemWidthPx?: number;
}) {
  const days = useMemo(() => {
    const entries = Array.from(eventsMap.entries())
      .filter(([, list]) => (list?.length ?? 0) > 0)
      .sort(([a], [b]) => a.localeCompare(b));

    return entries.map(
      ([key, list]) =>
        [
          key,
          [...list].sort((a, b) => a.end.getTime() - b.end.getTime()),
        ] as const,
    );
  }, [eventsMap]);

  // not use
  const _total = useMemo(
    () =>
      Array.from(eventsMap.values()).reduce(
        (acc, v) => acc + (v?.length ?? 0),
        0,
      ),
    [eventsMap],
  );

  return (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-4">
        {days.length === 0 ? (
          <div className="text-center text-sm">empty</div>
        ) : (
          <div className="space-y-4">
            {days.map(([key, list]) => {
              const dayDate = parseISO(key);

              return (
                <div key={key} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(dayDate, "EEEE - d MMMM yyyy")}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {list.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        minWidth={minItemWidthPx}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EventItem({
  event,
  minWidth,
}: {
  event: CalendarEvent;
  minWidth: number;
}) {
  const inner = (
    <div
      className={cn("rounded-md border bg-background px-3 py-2", "min-w-0")}
      style={{ flex: `1 1 ${minWidth}px` }}
    >
      <div className="truncate text-sm font-medium">{event.name}</div>
      <div className="truncate text-sm font-medium">
        Unit: {event.unit_name}
      </div>
      <div className="flex flex-wrap gap-2">
        Due Date: {format(event.end, "dd/MM/yyyy, HH:mm")}
      </div>
    </div>
  );

  return event.href ? (
    <Link
      href={event.href}
      className="block min-w-0"
      style={{ flex: `1 1 ${minWidth}px` }}
    >
      {inner}
    </Link>
  ) : (
    <div className="min-w-0" style={{ flex: `1 1 ${minWidth}px` }}>
      {inner}
    </div>
  );
}
