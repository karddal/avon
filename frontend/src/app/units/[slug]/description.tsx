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
    <div className="flex-1 min-h-0 overflow-y-auto break-words border bg-accent p-2">
      {unit.description ? (
        unit.description
      ) : (
        <span className="text-muted-foreground italic">
          No description available.
        </span>
      )}
    </div>
  );
}