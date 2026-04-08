import { ScrollArea } from "@/components/ui/scroll-area";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function UnitDescription({
  unit,
}: {
  unit: UnitData;
}) {
  return (
    <ScrollArea className="h-full border bg-accent p-2">
      {unit.description ? (
        <div className="break-words">{unit.description}</div>
      ) : (
        <span className="text-muted-foreground italic">
          No description available.
        </span>
      )}
    </ScrollArea>
  );
}