import { Suspense } from "react";
import UnitDescription from "@/app/units/[slug]/description";
import { Skeleton } from "@/components/ui/skeleton";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function UnitDescriptionModule({ unit }: { unit: UnitData }) {
  return (
    <div className="flex h-[16rem] min-h-0 max-h-[19rem] flex-col md:h-[18rem] md:max-h-[22rem] 2xl:h-full 2xl:max-h-none">
      <div className="shrink-0 flex flex-col space-y-1.5 p-6">
        <div>
          <div className="text-2xl font-semibold">Description</div>
          <div className="font-light">Information about the unit.</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-6 pt-0 pb-6">
        <Suspense
          fallback={
            <div className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          }
        >
          <UnitDescription unit={unit} />
        </Suspense>
      </div>
    </div>
  );
}
