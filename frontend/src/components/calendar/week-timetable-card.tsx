"use client";

import {Card, CardContent} from "@/components/ui/card";
import {addDays, format, startOfWeek} from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area"
import {cn} from "@/lib/utils";
import {RefObject, useEffect, useMemo, useRef, useState} from "react";

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
};

function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted
}

export function WeeklyTimeTableCard(
    {
        weekStartDate = new Date(),
        events,
}: {
    weekStartDate?: Date;
    events: Map<string, CalendarEvent[]>;
}) {
    const weekStart = startOfWeek(weekStartDate, {weekStartsOn : 1})// 1 is monday
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const [today, setToday] = useState<string | undefined>(undefined);

    useEffect(() => {
        setToday(format(new Date(), "yyyy-MM-dd"));
    }, []);

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                <TimeGridBody days={days} events={events} today={today} />
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
    useScrollToNowCenter(scrollRef, nowTop, dayHeight, mounted && showNow && nowTop >= 0 && nowTop <= dayHeight)

    return (
        <ScrollArea ref={scrollRef} className={cn("h-[70vh]")}>
            <WeekHeader days={days} today={today} gutterWidth={gutterWidth} />
            <div className="relative">
                <div className="grid" style={{gridTemplateColumns}}>
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

                        return (
                            <div key={key}
                                 className = {cn("relative border-r last:border-r-0", isToday && "bg-muted/10")}
                                 style={{height: dayHeight}}
                            >
                                <div className="absolute inset-0" style={gridBackgroundStyle}/>
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
    }, [ref, y, enabled])
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
        const id = window.setInterval(() => setNow(new Date()), 30_000)
        return () => window.clearInterval(id)
    }, [])

    const top = useMemo(() => {
        const minutes = minutesSinceMidnight(now)
        return Math.round(minutes * pxPerMinute);
    }, [now, pxPerMinute])

    return { now, top };
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