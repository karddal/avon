import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import UnitDescription from "@/app/units/[slug]/description";

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
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="text-2xl">Description</div>
          <div className="font-light">Information about the unit.</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense
            fallback={
            <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            }
        >
          <UnitDescription unit={unit}/>
        </Suspense>
      </CardContent>
    </Card>
  );
}