"use client";

import {Card, CardContent} from "@/components/ui/card";
import {addDays, format, startOfWeek} from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area"
import {cn} from "@/lib/utils";
import {RefObject, useEffect, useMemo, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useIsMobile} from "@/hooks/use-mobile";
import {useCalendarEvents} from "@/hooks/calendar/use-calendar-events";

export type CalendarEvent = {
    id: string;
    name: string;
    start: Date;
    end: Date;
    unit_id: string
    unit_name: string
    href?: string; // TODO: this not add yet, but should be few line change
    colour?: string
};

function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted
}

export function WeeklyTimeTableCard(
    {
        weekStartDate = new Date(),
        unitIds = [],
}: {
        weekStartDate?: Date;
        unitIds?: string[]
    }) {
    const weekStart = startOfWeek(weekStartDate, {weekStartsOn : 1})// 1 is monday
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const [today, setToday] = useState<string | undefined>(undefined);

    useEffect(() => {
        setToday(format(new Date(), "yyyy-MM-dd"));
    }, []);

    const isMobile = useIsMobile();
    const visibleDays = useMemo(() => {
        if (!isMobile) return days;

        const inWeek = days.find((d) => format(d, "yyyy-MM-dd") === today);
        return [inWeek ?? days[0]];
    }, [isMobile, days]);

    const form = weekStart.toISOString()
    const to = addDays(weekStart, 7).toISOString()
    const {eventsMap, isLoading, error} = useCalendarEvents(form, to, unitIds)

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <TimeGridBody days={visibleDays} events={eventsMap} today={today} />
            </CardContent>
        </Card>
    )
}

function TimeGridBody(
    {
        gutterWidth = 64,
        days,
        pxPerMinute = 1,
        events,
        today,
        slotMinutes = 30,
    }:{
        gutterWidth?: number;
        days: Date[];
        pxPerMinute?: number;
        events: Map<string, CalendarEvent[]>;
        today?: string;
        slotMinutes?: 15 | 30 | 60;
    }
) {
    const {
        dayHeight,
        hourStepPx,
        gridTemplateColumns,
        gridBackgroundStyle,
    } = useTimeGrid({
        daysCount: days.length,
        gutterWidth,
        pxPerMinute,
        slotMinutes,
        minorStrength: 80,
        majorStrength: 100,
    })
    const mounted = useMounted();
    const {now, top: nowTop} = useNowIndicator(pxPerMinute);
    const showNow = !!today && days.some((d) => format(d, "yyyy-MM-dd") === today);
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useScrollToNowCenter(scrollRef, nowTop, dayHeight, mounted && showNow && nowTop >= 0 && nowTop <= dayHeight)
    const maxCols = useMaxCols({
        gridRef,
        gutterWidth,
        daysCount: days.length,
        minColPx: 120, // minim length for one event in a column
        maxColsCap: 3,
    });
    const { getEventsForKey } = useWeeklyEvents({
        days,
        eventsByDay: events,
        pxPerMinute,
        minEventHeightPx: 44,
        sort: true,
        maxCols
    })

    return (
        <ScrollArea ref={scrollRef} className={cn("h-[70vh]")}>
            <WeekHeader days={days} today={today} gutterWidth={gutterWidth} />
            <div className="relative">
                <div ref={gridRef} className="grid" style={{gridTemplateColumns}}>
                    <div className="relative border-r bg-background">
                        <div style={{height : dayHeight}}>
                            {Array.from({length: 24}, (_, h) => (
                                <div key={h}
                                     className="absolute left-0 w-full pr-2 text-right text-xs text-muted-foreground flex items-center justify-end"
                                     style={{
                                         top: h * hourStepPx,
                                         height: hourStepPx,
                                     }}
                                >
                                    {String(h).padStart(2, "0")}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {days.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const dayEvents = getEventsForKey(key);
                        const isToday = today && format(day, "yyyy-MM-dd") === today;

                        const groups = new Map<string, {visible: LayoutedEvent[]; hidden: LayoutedEvent[]}>();

                        for (const event of dayEvents) {
                            const group = groups.get(event.groupId) ?? { visible: [], hidden: [] };
                            (event.hidden ? group.hidden : group.visible).push(event);
                            groups.set(event.groupId, group);
                        }

                        const visibleEvents = Array.from(groups.values().flatMap((group) => group.visible))

                        const badgeLeftPct = (maxCols - 1) * (100 / maxCols)
                        const badgeWidthPct = 100 / maxCols
                        const badgeH = 18

                        return (
                            <div key={key}
                                 className = {cn("relative border-r last:border-r-0", isToday && "bg-muted/10")}
                                 style={{height: dayHeight}}
                            >
                                <div className="absolute inset-0" style={gridBackgroundStyle}/>

                                {/* event */}
                                {visibleEvents.map(({event, top, height, leftPct, widthPct}) => {
                                    return (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "absolute rounded-md border bg-card shadow-sm min-w-0 overflow-hidden",
                                                "px-2 py-1 text-xs",
                                                "max-sm:px-1.5 max-sm:py-1 max-sm:text-[11px]",
                                            )}
                                            style={{
                                                top, height,
                                                left: `calc(${leftPct}% + 4px)`,
                                                width: `calc(${widthPct}% - 8px)`
                                            }}
                                            title={`${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`}
                                        >
                                            <div className="font-medium truncate leading-4">{event.name}</div>
                                            <div className="text-muted-foreground truncate leading-4">
                                                {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* + more popover */}
                                {Array.from(groups.entries()).map(([groupId, group]) => {
                                    if (group.hidden.length === 0) return null

                                    const groupBottom = Math.max(...[...group.visible, ...group.hidden].map((event) => event.top + event.height))
                                    const badgeTop = Math.max(0, groupBottom - badgeH - 2)

                                    return (
                                        <Popover key={`more-${key}-${groupId}`}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="absolute z-20 rounded-md border bg-background/90 px-2 py-0.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur hover:bg-muted"
                                                    style={{
                                                        top: badgeTop,
                                                        left: `calc(${badgeLeftPct}% + 4px)`,
                                                        width: `calc(${badgeWidthPct}% - 8px)`,
                                                    }}
                                                >
                                                    +{group.hidden.length} more
                                                </button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 p-2" align="start">
                                                <div className="mb-2 text-xs font-medium">
                                                    Hidden events ({group.hidden.length})
                                                </div>

                                                <div className="space-y-1">
                                                    {group.hidden.map(({event}) => (
                                                        <div
                                                            key={event.id}
                                                            className="rounded-md border bg-card px-2 py-1 text-xs"
                                                            title={`${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`}
                                                        >
                                                            <div className="font-medium truncate">{event.name}</div>
                                                            <div className="text-muted-foreground">
                                                                {format(event.start, "HH:mm")}–{format(event.end, "HH:mm")}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
                {/* current time */}
                {mounted && showNow && nowTop >= 0 && nowTop <= dayHeight && (
                    <NowLine top={nowTop} now={now} dayHeight={dayHeight} gutterWidth={gutterWidth} />
                )}
            </div>
        </ScrollArea>
    )
}


function WeekHeader(
    {
        days,
        gutterWidth = 64,
        today,
    }: {
        days: Date[];
        gutterWidth?: number;
        today?: string;
    }) {

    return (
        <div
            className="sticky top-0 z-20 grid border-b bg-background"
            style={{gridTemplateColumns: `${gutterWidth}px repeat(${days.length}, minmax(0, 1fr))`}}
        >
            <div className="border-r" />
            {days.map((day) => {
                const isToday = today && format(day, "yyyy-MM-dd") === today;
                return (
                    <div
                        key={day.toISOString()}
                        className={cn(
                            "px-3 py-2 border-r last:border-r-0",
                            isToday && "bg-muted/40"
                        )}
                    >
                        <div className="text-sm font-medium">{format(day, "EEE")}</div>
                        <div className="text-xs text-muted-foreground">
                            {format(day, "MMM d")}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function useMaxCols(opts: {
    gridRef: RefObject<HTMLDivElement | null>;
    gutterWidth: number;
    daysCount: number;
    minColPx?: number;
    maxColsCap?: number;
}) {
    const { gridRef, gutterWidth, daysCount, minColPx = 160, maxColsCap = 3 } = opts;
    const [dayColPx, setDayColPx] = useState<number | null>(null);

    useEffect(() => {
        const element = gridRef.current;
        if (!element) return;

        const update = () => {
            const width = element.getBoundingClientRect().width;
            const px = Math.max(1, (width - gutterWidth) / Math.max(1, daysCount));
            setDayColPx(px);
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, [gridRef, gutterWidth, daysCount]);

    return useMemo(() => {
        // dayColPx / minColPx: how many readable columns can fit
        const byWidth = dayColPx ? Math.floor(dayColPx / minColPx) : maxColsCap;
        return Math.min(maxColsCap, Math.max(1, byWidth));
    }, [dayColPx, minColPx, maxColsCap]);
}

function useScrollToNowCenter<T extends HTMLElement>(ref: RefObject<T | null>, y: number, dayHeight: number, enabled: boolean) {
    const done = useRef(false)
    useEffect(() => {
        if (!enabled || done.current || !ref.current) return;
        const viewport = ref.current.querySelector<T>("[data-radix-scroll-area-viewport]")
        if (!viewport) return;
        const target = Math.max(0, y - viewport.clientHeight / 2)
        const max = Math.max(0, dayHeight - viewport.clientHeight)
        viewport.scrollTop = Math.min(target, max)
        done.current = true;
    }, [ref, y, dayHeight, enabled])
}

function minutesSinceMidnight(date: Date) {
    return minutesSinceMidnightNoSeconds(date) + date.getSeconds() / 60;
}
function minutesSinceMidnightNoSeconds(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
}

function formatHHmm(date: Date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function NowLine(
    {
        top,
        now,
        dayHeight,
        gutterWidth,
    }: {
        top: number
        now: Date;
        dayHeight: number;
        gutterWidth: number;
    }) {
    const clampedY = Math.max(0, Math.min(top, dayHeight));
    const labelY = Math.max(10, Math.min(top, dayHeight - 10));

    return (
        <div
            className="pointer-events-none absolute left-0 right-0 z-10"
            style={{top}}
        >
            <div className="absolute right-0 h-[2px] bg-red-500 dark:bg-red-400" style={{ left: gutterWidth }} />

            <div className="absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full bg-red-500 dark:bg-red-400" style={{ left: gutterWidth - 5 }} />

            <div
                className="absolute -left-2 -translate-y-1/2"
                style={{ top: labelY - clampedY, left: 6, width: gutterWidth - 12 }}
            >
                <div className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm dark:bg-red-400 dark:text-black">
                    {formatHHmm(now)}
                </div>
            </div>
        </div>
    )
}

export function useNowIndicator(pxPerMinute: number) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 30 * 1000)
        return () => window.clearInterval(id)
    }, [])

    const top = useMemo(() => {
        const minutes = minutesSinceMidnight(now)
        return Math.round(minutes * pxPerMinute);
    }, [now, pxPerMinute])

    return { now, top };
}

type LayoutedEvent = {
    event: CalendarEvent;
    top: number; // Y position in pixels from top of the day column
    height: number; // Event block height in pixels
    colIndex: number; // Column index inside its overlap group
    colCount: number; // Total columns in this overlap group
    leftPct: number; // Left offset in % (0–100)
    widthPct: number; // Width in % (0–100)

    hidden?: boolean;
    groupId: string;
};

function useWeeklyEvents(
    {
        days,
        eventsByDay,
        pxPerMinute,
        minEventHeightPx = 44,
        sort = true,
        maxCols,
    } : {
        days: Date[];
        eventsByDay: Map<string, CalendarEvent[]> | null;
        pxPerMinute: number;
        minEventHeightPx?: number;
        sort?: boolean;
        maxCols: number;
    }): { getEventsForKey: (key: string) => (LayoutedEvent[]) } {
    return useMemo(() => {
        const events = eventsByDay ?? new Map<string, CalendarEvent[]>()
        const dayKeys = new Set(days.map((date) => format(date, "yyyy-MM-dd")))

        // convert an event into pixel-based layout data
        const getEventBox = (event: CalendarEvent) => {
            const startM = minutesSinceMidnightNoSeconds(event.start);
            const endM = minutesSinceMidnightNoSeconds(event.end);
            const top = startM * pxPerMinute;
            const height = Math.max(minEventHeightPx, (endM-startM) * pxPerMinute);
            return { startM, endM, top, height };
        }

        // layout all events for a day
        const layoutDay = (list: CalendarEvent[]): LayoutedEvent[] => {
            if (!list.length) return [];

            const base = sort
                ? [...list].sort((a, b) => a.start.getTime() - b.start.getTime())
                : [...list];

            const items = base.map(
                (event) => {
                    const box = getEventBox(event);
                    return {event, ...box}
            })

            // final output data
            const layoutMap = new Map<string, LayoutedEvent>()

            // currently active(possible overlapping) events
            let active: Array<{event: CalendarEvent; endM: number; colIndex: number}> = []

            let groupIds: string[] = []
            let groupMaxCols = 0
            let groupSeq = 0

            // assign width or left percentage based on how many columns needed
            const flushGroup = () => {
                if (!groupIds.length) return

                const groupId = `g${groupSeq++}`

                const realCols = Math.max(1, groupMaxCols)
                const visibleCols = Math.min(realCols, maxCols)
                const widthPct = 100 / visibleCols

                for (const id of groupIds) {
                    const layout = layoutMap.get(id)
                    if (!layout) continue

                    const hidden = layout.colIndex >= maxCols
                    const cappedIndex = Math.min(layout.colIndex, maxCols - 1)
                    layoutMap.set(id, {...layout, groupId, hidden, colCount: visibleCols, widthPct, leftPct: cappedIndex * widthPct})
                }
                groupIds = []
                groupMaxCols = 0
            }

            // remove events that no longer overlap in the current start time
            const removeEnded = (startM: number) => {
                active = active.filter(
                    (activeEvent) => activeEvent.endM > startM
                )
            }

            const getUsedCols = () => new Set(active.map(
                (activeEvent) => activeEvent.colIndex)
            )

            for (const item of items) {
                if (active.length > 0) {
                    const earliestEnd = Math.min(...active.map((activeEvent) => activeEvent.endM))
                    if (item.startM >= earliestEnd) {
                        removeEnded(item.startM)
                        if (active.length === 0) flushGroup()
                    }
                }
                removeEnded(item.startM)

                const used = getUsedCols()
                let colIndex = 0
                while (used.has(colIndex)) colIndex++

                if (active.length === 0) {
                    groupIds = []
                    groupMaxCols = 0
                }

                const base: LayoutedEvent = {
                    event: item.event,
                    top: item.top,
                    height: item.height,
                    colIndex,
                    colCount: 1,
                    leftPct: 0,
                    widthPct: 100,
                    groupId: "",
                }

                layoutMap.set(item.event.id, base)
                active.push({event: item.event, endM: item.endM, colIndex})
                groupIds.push(item.event.id)

                groupMaxCols = Math.max(groupMaxCols, active.length)
            }

            flushGroup()

            return items.map((candidate) => layoutMap.get(candidate.event.id)!).filter(Boolean)
        }

        const getEventsForKey = (key: string) => {
            if (!dayKeys.has(key)) return [] as LayoutedEvent[];
            const list = events.get(key) ?? []
            return layoutDay(list)
        }


        return {getEventsForKey}
    }, [days, eventsByDay, pxPerMinute, minEventHeightPx, sort, maxCols]);
}

type TimeGridOptions = {
    daysCount: number;          // week = 7
    gutterWidth?: number;       // width of time column
    pxPerMinute?: number;       // pixel per minute
    slotMinutes?: 15 | 30 | 60; // line gap (minute)
    majorStrength?: number;     // exact hour line intensity(0-100)
    minorStrength?: number;     // slot line intensity (0-100)
};

function useTimeGrid(
    {
        daysCount,
        gutterWidth = 64,
        pxPerMinute = 1,
        slotMinutes = 30,
        majorStrength = 100,
        minorStrength = 80,
    } : TimeGridOptions)
{
    return useMemo(() => {
        const dayHeight = 24 * 60 * pxPerMinute;
        const hourStepPx = 60 * pxPerMinute;
        const slotStepPx = slotMinutes * pxPerMinute;
        const lineWidth = 3;

        const gridTemplateColumns = `${gutterWidth}px repeat(${daysCount}, minmax(0, 1fr))`;

        const gridBackgroundStyle: React.CSSProperties = {
            backgroundImage: `
        linear-gradient(
          to bottom,
          color-mix(in oklab, var(--border) ${minorStrength}%, transparent) ${lineWidth}px,
          transparent ${lineWidth}px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklab, var(--border) ${majorStrength}%, transparent) ${lineWidth}px,
          transparent ${lineWidth}px
        )
      `,
            backgroundSize: `
        100% ${slotStepPx}px,
        100% ${hourStepPx}px
      `,
            backgroundRepeat: "repeat",
        };

        return {
            dayHeight,
            hourStepPx,
            slotStepPx,
            gutterWidth,
            pxPerMinute,
            slotMinutes,
            gridTemplateColumns,
            gridBackgroundStyle,
        };
    }, [
        daysCount,
        gutterWidth,
        pxPerMinute,
        slotMinutes,
        majorStrength,
        minorStrength,
    ]);
}