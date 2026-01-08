import { BookDashed, AlertCircle } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Unit from "@/components/units/unit";
import { getRequestJWT } from "@/lib/auth-utils";

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  academic_year: string | number;
};

export default async function UnitListByYear({
  year,
}: {
  year: string | number;
}) {
  const token = await getRequestJWT();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/units`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const unitData = await response.json();

    const unitsArray = Array.isArray(unitData)
      ? unitData
      : unitData.data && Array.isArray(unitData.data)
      ? unitData.data
      : [];

    const filtered = unitsArray.filter((item: UnitData) => {
      return item.academic_year.toString() === year.toString();
    });

    if (filtered.length === 0) {
      return (
        <Empty className="border-dashed border-2 bg-muted/20 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookDashed className="text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No units found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any units for the {year} academic year.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((unit: UnitData) => (
          <Unit key={unit.id} props={unit} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return (
      <div className="flex items-center justify-center p-8 border-2 border-destructive/20 rounded-lg bg-destructive/5 text-destructive">
        <AlertCircle className="mr-2 h-4 w-4" />
        <p className="text-sm font-medium">
          Failed to load units. Please try again later.
        </p>
      </div>
    );
  }
}
