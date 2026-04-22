"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReavizModuleFrameProps = {
  title: string;
  description: string;
  eyebrow?: string;
  stat?: string;
  children: (size: { width: number; height: number }) => React.ReactNode;
};

export default function ReavizModuleFrame({
  title,
  description,
  eyebrow = "Analytics",
  stat,
  children,
}: ReavizModuleFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 420, height: 280 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const nextWidth = Math.max(Math.floor(entry.contentRect.width), 280);
      const nextHeight = Math.max(Math.floor(entry.contentRect.height), 220);

      setSize({
        width: nextWidth,
        height: nextHeight,
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Card className="flex h-full min-h-0 flex-col rounded-none border-2 bg-background shadow-none">
      <CardHeader className="gap-0 border-b-2 px-4 py-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </div>
          {stat ? (
            <div className="border border-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
              {stat}
            </div>
          ) : null}
        </div>
        <CardTitle className="space-y-1">
          <div className="text-xl font-semibold tracking-tight">{title}</div>
          <div className="max-w-[52ch] text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {description}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b bg-muted/25 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Live module preview
        </div>
        <div ref={containerRef} className="min-h-0 flex-1 px-3 py-3">
          {children(size)}
        </div>
      </CardContent>
    </Card>
  );
}
