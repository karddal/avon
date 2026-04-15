"use client";

import {
  ChevronDown,
  ChevronRight,
  Edit,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { courseworkModuleRegistry } from "@/components/modules/coursework_layout/coursework-module-registry";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CourseworkModuleKey } from "@/components/modules/coursework_layout/coursework-module-registry";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CourseworkLayoutTarget } from "@/lib/coursework-layout";



type CourseworkLayoutEditorProps = {
  availableModules: CourseworkModuleKey[];
  layout: GridItem[];
  onChange: Dispatch<SetStateAction<GridItem[]>>;
  activeTarget: CourseworkLayoutTarget;
  onTargetChange: (target: CourseworkLayoutTarget) => void;
  canEditStaffView: boolean;
};

const GRID_COLUMNS = 10;
const GRID_ROWS = 4;

type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type DragState =
  | {
      type: "move";
      id: string;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: "resize";
      id: string;
      startX: number;
      startY: number;
      startW: number;
      startH: number;
    }
  | null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a: GridRect, b: GridRect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function isInsideGrid(item: GridRect) {
  return (
    item.x >= 0 &&
    item.y >= 0 &&
    item.x + item.w <= GRID_COLUMNS &&
    item.y + item.h <= GRID_ROWS
  );
}

function canPlaceItem(
  layout: GridItem[],
  candidate: GridRect,
  ignoreId?: string,
) {
  if (!isInsideGrid(candidate)) return false;

  return layout.every((item) => {
    if (item.id === ignoreId) return true;
    return !rectsOverlap(candidate, item);
  });
}

function getModuleConstraints(moduleKey: CourseworkModuleKey) {
  const moduleDef = courseworkModuleRegistry[moduleKey];

  return {
    minW: moduleDef.minW ?? 1,
    minH: moduleDef.minH ?? 1,
    maxW: moduleDef.maxW ?? GRID_COLUMNS,
    maxH: moduleDef.maxH ?? GRID_ROWS,
  };
}

function findFirstOpenSpot(layout: GridItem[]) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const candidate: GridRect = { x, y, w: 1, h: 1 };
      if (canPlaceItem(layout, candidate)) {
        return { x, y };
      }
    }
  }

  return null;
}

export default function CourseworkLayoutEditor({
  availableModules,
  layout,
  onChange,
  activeTarget,
  onTargetChange,
  canEditStaffView,
}: CourseworkLayoutEditorProps) {
  const setLayout = onChange;

  const [showModules, setShowModules] = useState(true);
  const [_showPlacedModules, _setShowPlacedModules] = useState(true);
  const [dragState, setDragState] = useState<DragState>(null);
  const [hoverPreviewRect, setHoverPreviewRect] = useState<
    (GridRect & { valid: boolean }) | null
  >(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const placedModuleKeys = useMemo(
    () => new Set(layout.map((item) => item.moduleKey)),
    [layout],
  );

  const remainingModules = useMemo(
    () => availableModules.filter((module) => !placedModuleKeys.has(module)),
    [availableModules, placedModuleKeys],
  );

  function removeItem(id: string) {
    setLayout((prev) => prev.filter((item) => item.id !== id));
  }

  function addModule(moduleKey: CourseworkModuleKey) {
    setLayout((prev) => {
      const spot = findFirstOpenSpot(prev);

      if (!spot) {
        toast.error("No space left in the 10x4 grid");
        return prev;
      }

      const { minW, minH } = getModuleConstraints(moduleKey);

      const candidate: GridItem = {
        id: `${moduleKey}-${crypto.randomUUID()}`,
        moduleKey,
        x: spot.x,
        y: spot.y,
        w: minW,
        h: minH,
      };

      if (!canPlaceItem(prev, candidate)) {
        toast.error("No valid space for that module");
        return prev;
      }

      return [...prev, candidate];
    });
  }

  function getGridMetrics() {
    const container = previewRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const cellWidth = rect.width / GRID_COLUMNS;
    const cellHeight = rect.height / GRID_ROWS;

    return { rect, cellWidth, cellHeight };
  }

  function startMove(
    event: React.MouseEvent<HTMLButtonElement>,
    item: GridItem,
  ) {
    const metrics = getGridMetrics();
    if (!metrics) return;

    const { rect, cellWidth, cellHeight } = metrics;

    const offsetX = event.clientX - rect.left - item.x * cellWidth;
    const offsetY = event.clientY - rect.top - item.y * cellHeight;

    setDragState({
      type: "move",
      id: item.id,
      offsetX,
      offsetY,
    });
  }

  function startResize(
    event: React.MouseEvent<HTMLButtonElement>,
    item: GridItem,
  ) {
    event.stopPropagation();
    event.preventDefault();

    setDragState({
      type: "resize",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      startW: item.w,
      startH: item.h,
    });
  }

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!dragState) return;

    const metrics = getGridMetrics();
    if (!metrics) return;

    const { rect, cellWidth, cellHeight } = metrics;
    const item = layout.find((entry) => entry.id === dragState.id);
    if (!item) return;

    if (dragState.type === "move") {
      const rawX = event.clientX - rect.left - dragState.offsetX;
      const rawY = event.clientY - rect.top - dragState.offsetY;

      const snappedX = clamp(
        Math.round(rawX / cellWidth),
        0,
        GRID_COLUMNS - item.w,
      );
      const snappedY = clamp(
        Math.round(rawY / cellHeight),
        0,
        GRID_ROWS - item.h,
      );

      const candidate: GridRect = {
        x: snappedX,
        y: snappedY,
        w: item.w,
        h: item.h,
      };

      setHoverPreviewRect({
        ...candidate,
        valid: canPlaceItem(layout, candidate, item.id),
      });

      return;
    }

    const constraints = getModuleConstraints(item.moduleKey);

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    const nextW = clamp(
      Math.round((dragState.startW * cellWidth + deltaX) / cellWidth),
      constraints.minW,
      Math.min(constraints.maxW, GRID_COLUMNS - item.x),
    );

    const nextH = clamp(
      Math.round((dragState.startH * cellHeight + deltaY) / cellHeight),
      constraints.minH,
      Math.min(constraints.maxH, GRID_ROWS - item.y),
    );

    const candidate: GridRect = {
      x: item.x,
      y: item.y,
      w: nextW,
      h: nextH,
    };

    setHoverPreviewRect({
      ...candidate,
      valid: canPlaceItem(layout, candidate, item.id),
    });
  }

  function commitDrag() {
    if (!dragState || !hoverPreviewRect) {
      setDragState(null);
      setHoverPreviewRect(null);
      return;
    }

    if (!hoverPreviewRect.valid) {
      toast.error("That layout would overlap another module");
      setDragState(null);
      setHoverPreviewRect(null);
      return;
    }

    setLayout((prev) =>
      prev.map((item) =>
        item.id === dragState.id
          ? {
              ...item,
              x: hoverPreviewRect.x,
              y: hoverPreviewRect.y,
              w: hoverPreviewRect.w,
              h: hoverPreviewRect.h,
            }
          : item,
      ),
    );

    setDragState(null);
    setHoverPreviewRect(null);
  }

  return (
    <Dialog>
      <div className="flex w-full justify-end">
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-9 rounded-xl border px-4 text-sm shadow-sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Layout
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-full! w-full max-h-full! overflow-y-auto border-none bg-transparent p-0 shadow-none lg:max-h-[82vh]! lg:max-w-[86%]! xl:max-w-[80%]!">
        <div className="flex w-full flex-col-reverse items-stretch justify-center gap-4 lg:flex-row">
          <div className="flex flex-col justify-between bg-background shadow-lg lg:max-h-[82vh] lg:basis-[34%] lg:min-w-[320px]">
            <div className="p-6 pb-0">
              <DialogHeader>
                <DialogTitle className="text-lg">Dashboard Layout</DialogTitle>
                <DialogDescription className="text-sm">
                  Drag modules on the preview to move them. Drag the corner
                  handle to resize. Items snap to the 10x4 grid and cannot
                  overlap.
                </DialogDescription>
              </DialogHeader>

              {canEditStaffView && (
                <div className="pt-4">
                  <Tabs
                    value={activeTarget}
                    onValueChange={(value) =>
                      onTargetChange(value as CourseworkLayoutTarget)
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="student">Student View</TabsTrigger>
                      <TabsTrigger value="staff">Lecturer View</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>

            <div className="overflow-y-auto px-6">
              <div className="space-y-5">
                <div className="space-y-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowModules(!showModules)}
                    className="flex w-full items-center gap-2 transition-opacity hover:opacity-80"
                  >
                    {showModules ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <DialogTitle className="text-sm font-medium">
                        Available Modules
                      </DialogTitle>
                      <p className="text-xs text-muted-foreground">
                        Add modules into the dashboard layout.
                      </p>
                    </div>
                  </button>

                  {showModules && (
                    <div className="space-y-2 pl-5">
                      <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto border bg-accent p-3 md:grid-cols-2">
                        {remainingModules.length === 0 ? (
                          <div className="col-span-full border border-dashed bg-background p-3 text-xs text-muted-foreground">
                            All modules have already been placed.
                          </div>
                        ) : (
                          remainingModules.map((moduleKey) => (
                            <Card
                              key={moduleKey}
                              onClick={() => addModule(moduleKey)}
                              className="flex cursor-pointer flex-row items-center gap-2 rounded-none px-3 py-2 transition-all hover:border-primary hover:bg-primary/5"
                            >
                              <Plus className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-medium">
                                {courseworkModuleRegistry[moduleKey]?.title ??
                                  moduleKey}
                              </span>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 border-t bg-background p-6">
              <div className="space-y-2">
                <DialogTitle className="text-sm font-medium">Notes</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Some modules can be locked to certain sizes. For example, the
                  commits chart can be forced to 1x1.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col border bg-background p-6 shadow-lg lg:max-h-[82vh] lg:basis-[66%]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <DialogTitle className="text-lg">Preview</DialogTitle>
            </div>

            <div className="flex flex-1 items-start justify-center overflow-auto border bg-background p-4">
              <div
                ref={previewRef}
                className="grid w-full max-w-7xl select-none border border-dashed bg-background p-2"
                role="application"
                aria-label="Dashboard layout preview"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(120px, 1fr))`,
                  gap: "8px",
                  minHeight: 420,
                }}
                onMouseMove={handlePointerMove}
                onMouseUp={commitDrag}
                onMouseLeave={commitDrag}
              >
                {layout.length === 0 ? (
                  <div className="col-span-10 row-span-4 flex items-center justify-center text-xs text-muted-foreground">
                    No modules placed yet.
                  </div>
                ) : (
                  layout.map((item) => {
                    const moduleDef = courseworkModuleRegistry[item.moduleKey];
                    const previewItem =
                      hoverPreviewRect && dragState?.id === item.id
                        ? hoverPreviewRect
                        : item;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "min-h-0 overflow-hidden rounded-none border bg-card shadow-sm",
                          dragState?.id === item.id && "opacity-80",
                        )}
                        style={{
                          gridColumn: `${previewItem.x + 1} / span ${previewItem.w}`,
                          gridRow: `${previewItem.y + 1} / span ${previewItem.h}`,
                        }}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between border-b bg-muted/60 px-2.5 py-1.5">
                            <button
                              type="button"
                              className="min-w-0 cursor-move"
                              onMouseDown={(event) => startMove(event, item)}
                              aria-label={`Move ${moduleDef?.title ?? item.moduleKey}`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate text-xs font-medium">
                                  {moduleDef?.title ?? item.moduleKey}
                                </span>
                              </span>
                            </button>

                            <button
                              type="button"
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={() => removeItem(item.id)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground hover:bg-accent hover:text-destructive"
                              aria-label={`Delete ${moduleDef?.title ?? item.moduleKey}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="relative flex flex-1 items-center justify-center p-2 text-xs text-muted-foreground">
                            {moduleDef?.title ?? item.moduleKey}

                            <button
                              type="button"
                              onMouseDown={(event) => startResize(event, item)}
                              className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize border-l border-t bg-muted hover:bg-accent"
                              aria-label={`Resize ${moduleDef?.title ?? item.moduleKey}`}
                            >
                              <span className="pointer-events-none absolute bottom-px right-px text-[8px] leading-none">
                                ◢
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
