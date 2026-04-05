"use client";

import { useEffect, useMemo, useState } from "react";
import Coursework from "@/components/coursework/coursework";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ActiveCourseworkUnit,
  get_active_coursework,
} from "@/lib/actions/get_active_coursework";

type ActiveCourseworkState = {
  hasPermissions: boolean;
  units: ActiveCourseworkUnit[];
};

export default function ActiveCourseworkModule() {
  const [state, setState] = useState<ActiveCourseworkState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void get_active_coursework()
      .then((result) => {
        if (!cancelled) {
          setState(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCourseworks = useMemo(() => {
    if (!state) return [];

    return state.units.flatMap((unit) =>
      unit.courseworks.map((coursework) => ({
        ...coursework,
        unit_id: unit.id,
        unit_code: unit.unit_code,
      })),
    );
  }, [state]);

  return (
    <div className="flex h-[18rem] min-h-0 flex-col p-4 sm:h-[20rem] sm:p-5 md:h-[22rem] lg:h-full">
      <div className="mb-3 text-sm font-medium">Active Coursework</div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {!state && !error ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading active coursework...
          </div>
        ) : null}

        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Could not load active coursework.
          </div>
        ) : null}

        {state && activeCourseworks.length === 0 ? (
          <Empty className="h-full border border-dashed bg-muted/20 py-8">
            <EmptyHeader>
              <EmptyTitle>No active coursework</EmptyTitle>
              <EmptyDescription>
                There are no active courseworks to show right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {state && activeCourseworks.length > 0 ? (
          <ScrollArea className="h-full pr-1">
            <div className="space-y-3 pr-3">
              {activeCourseworks.map((coursework) => (
                <Coursework
                  key={coursework.id}
                  hasPermissions={state.hasPermissions}
                  props={coursework}
                />
              ))}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </div>
  );
}
