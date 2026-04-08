type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function UnitDescription({
  unit
}: {
  unit: UnitData;
}) {

  return (
    <div className="flex flex-col overflow-y-auto break-words h-32 border bg-accent p-2">
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
