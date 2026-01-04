"use server";

import { BookDashed } from "lucide-react";
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
  academic_year: number;
};

export default async function UnitListByYear({ year }: { year: number }) {
  // place unit data into tabs based on year
  const token = await getRequestJWT();

  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const unitData: UnitData[] = await data.json();
  const filtered = unitData.filter((item) => item.academic_year === year);
  const list = filtered.map((unit) => (
    <div key={unit.id} className="mb-3">
      <Unit key={unit.id} props={unit} />
    </div>
  ));
  // const filtered = await getData(currentYear, finished)
  if (filtered !== undefined) {
    return <>{list}</>;
  } else {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookDashed />
          </EmptyMedia>
          <EmptyTitle>No units.</EmptyTitle>
          <EmptyDescription>
            No units were found that you are connected to.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
}
