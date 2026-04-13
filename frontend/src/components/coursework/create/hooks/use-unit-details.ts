import { useEffect, useState } from "react";
import type { UnitData } from "@/components/coursework/create/types";

export function useUnitDetails(unitId?: string) {
  const [data, setData] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setData(null);

        const response = await fetch(
          `/api/units/${unitId}/with-dates`,
          {
            cache: "no-cache",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load unit dates.");
        }

        const unit: UnitData = await response.json();

        if (!cancelled) {
          setData(unit);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load unit data.",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  return { data, loading, error };
}
