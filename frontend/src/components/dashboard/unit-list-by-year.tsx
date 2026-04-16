import { BookDashed } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Unit from "@/components/units/unit";
import {
  type ActiveUnit,
  get_active_units,
} from "@/lib/actions/get_active_units";

export default async function UnitListByYear({
  year,
}: {
  year: string | number;
}) {
  const { hasPermissions, units: unitsArray } = await get_active_units();

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
      {unitsArray.map((unit: ActiveUnit) => (
        <Unit hasPermissions={hasPermissions} key={unit.id} props={unit} />
      ))}
    </div>
  );
}
