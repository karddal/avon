import { BookDashed } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Unit from "@/components/units/unit";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  academic_year: string | number; // Flexible type for comparison
};

export default async function UnitListByYear({
  year,
}: {
  year: string | number;
}) {
  const token = await getRequestJWT();
  const s = await requireSession();
  const role = s.user.role;
  const route = role === "admin" ? "units/active" : "me/units/active";
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${route}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const unitData = await response.json();
  const unitsArray = unitData.units;

  if (unitsArray.length === 0) {
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
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 overflow-y-scroll h-48">
      {unitsArray.map((unit: UnitData) => (
        <Unit key={unit.id} props={unit} />
      ))}
    </div>
  );
}
