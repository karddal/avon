"use client";

import { useEffect, useState } from "react";
import { unitModuleRegistry } from "@/components/modules/unit-module-registry";
import type { GridItem } from "@/components/modules/unit-types";
import { cn } from "@/lib/utils";

type Lecturer = {
  id: string;
  name: string;
  image: string;
};

type UnitRendererProps = {
  layout: GridItem[];
  unit: UnitDataProps;
  role: string;
  lecturers: Lecturer[];
  courseworks: courseworkResponse;
};

type UnitDataProps = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

type courseworkData = {
  id: string;
  name: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type courseworkResponse = {
  courseworks: courseworkData[];
};

const GRID_ROWS = 3;
const MD_COLUMNS = 2;

function getMdSpans(item: GridItem) {
  return {
    colSpan: Math.min(Math.max(item.w, 1), MD_COLUMNS),
    rowSpan: Math.min(Math.max(item.h, 1), 2),
  };
}

function canPlaceMdItem(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
) {
  if (col + colSpan > MD_COLUMNS) return false;

  for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex += 1) {
    const occupiedRow =
      occupied[rowIndex] ?? Array.from({ length: MD_COLUMNS }, () => false);

    for (let colIndex = col; colIndex < col + colSpan; colIndex += 1) {
      if (occupiedRow[colIndex]) {
        return false;
      }
    }
  }

  return true;
}

function markMdItem(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
) {
  for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex += 1) {
    occupied[rowIndex] ??= Array.from({ length: MD_COLUMNS }, () => false);

    for (let colIndex = col; colIndex < col + colSpan; colIndex += 1) {
      occupied[rowIndex][colIndex] = true;
    }
  }
}

function getResponsiveMdLayout(layout: GridItem[]) {
  const occupied: boolean[][] = [];

  return layout.map((item, index) => {
    const preferred = getMdSpans(item);
    let row = 0;

    while (true) {
      for (let candidateCol = 0; candidateCol < MD_COLUMNS; candidateCol += 1) {
        if (
          canPlaceMdItem(
            occupied,
            row,
            candidateCol,
            preferred.colSpan,
            preferred.rowSpan,
          )
        ) {
          let colSpan = preferred.colSpan;

          if (
            candidateCol === 0 &&
            preferred.colSpan === 1 &&
            canPlaceMdItem(occupied, row, 0, MD_COLUMNS, preferred.rowSpan)
          ) {
            const nextItem = layout[index + 1];
            const nextColSpan = nextItem ? getMdSpans(nextItem).colSpan : null;

            if (!nextItem || nextColSpan === MD_COLUMNS) {
              colSpan = MD_COLUMNS;
            }
          }

          markMdItem(occupied, row, candidateCol, colSpan, preferred.rowSpan);

          return {
            ...item,
            colSpan,
            rowSpan: preferred.rowSpan,
          };
        }
      }

      row += 1;
    }

    throw new Error("Failed to place dashboard module in medium layout");
  });
}

export default function UnitRenderer({ layout, unit, role, lecturers, courseworks }: UnitRendererProps) {
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateLayoutMode = () => {
      setIsDesktopLayout(mediaQuery.matches);
    };

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);

    return () => {
      mediaQuery.removeEventListener("change", updateLayoutMode);
    };
  }, []);

  const orderedLayout = [...layout].sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y;
    }

    return left.x - right.x;
  });

  const mdLayout = getResponsiveMdLayout(orderedLayout);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="grid w-full grid-cols-1 auto-rows-[minmax(140px,auto)] gap-3 border bg-background p-3 sm:gap-4 sm:p-4 md:grid-flow-dense md:grid-cols-2 lg:h-full lg:flex-1 lg:grid-cols-3 lg:auto-rows-auto"
        style={
          isDesktopLayout
            ? {
                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
        {orderedLayout.length === 0 ? (
          <div className="col-span-full flex min-h-55 items-center justify-center border border-dashed bg-background px-4 text-center text-sm text-muted-foreground lg:row-span-3">
            No modules placed yet.
          </div>
        ) : null}

        {orderedLayout.map((item) => {
          const moduleDef = unitModuleRegistry[item.moduleKey];
          const mdItem = mdLayout.find((entry) => entry.id === item.id);

          if (!moduleDef) return null;

          const Component = moduleDef.component;

          return (
            <div
              key={item.id}
              className={cn(
                "min-h-35 overflow-hidden border bg-background md:min-h-45 lg:min-h-0",
                mdItem?.colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
                mdItem?.rowSpan === 2 ? "md:row-span-2" : "md:row-span-1",
              )}
              style={
                isDesktopLayout
                  ? {
                      gridColumn: `${item.x + 1} / span ${item.w}`,
                      gridRow: `${item.y + 1} / span ${item.h}`,
                    }
                  : undefined
              }
            >
              <div className="h-full min-h-0 overflow-visible lg:overflow-auto">
                <Component unit={unit} lecturers={lecturers} role={role} courseworks={courseworks} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
