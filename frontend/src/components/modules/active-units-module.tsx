"use client";

import { useEffect, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import Unit from "@/components/units/unit";
import {
  type ActiveUnit,
  get_active_units,
} from "@/lib/actions/get_active_units";

type ActiveUnitsState = {
  hasPermissions: boolean;
  units: ActiveUnit[];
};

export default function ActiveUnitsModule() {
  const [state, setState] = useState<ActiveUnitsState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void get_active_units()
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

  return (
    <div className="flex h-[18rem] min-h-0 flex-col p-4 sm:h-[20rem] sm:p-5 md:h-[22rem] lg:h-full">
      <div className="mb-3 text-sm font-medium">Active Units</div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {!state && !error ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading active units...
          </div>
        ) : null}

        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Could not load active units.
          </div>
        ) : null}

        {state && state.units.length === 0 ? (
          <Empty className="h-full border border-dashed bg-muted/20 py-8">
            <EmptyHeader>
              <EmptyTitle>No active units</EmptyTitle>
              <EmptyDescription>
                There are no active units to show right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {state && state.units.length > 0 ? (
          <ScrollArea className="h-full pr-1">
            <div className="space-y-3 pr-3">
              {state.units.map((unit) => (
                <Unit
                  key={unit.id}
                  hasPermissions={state.hasPermissions}
                  props={unit}
                />
              ))}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </div>
  );
}
