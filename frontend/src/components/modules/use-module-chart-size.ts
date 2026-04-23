"use client";

import { useEffect, useRef, useState } from "react";

export function useModuleChartSize(
  minWidth = 280,
  minHeight = 220,
  fallbackWidth = 420,
  fallbackHeight = 260,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({
    width: fallbackWidth,
    height: fallbackHeight,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.max(Math.floor(rect.width), minWidth),
        height: Math.max(Math.floor(rect.height), minHeight),
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [minHeight, minWidth]);

  return {
    containerRef,
    width: size.width,
    height: size.height,
  };
}
