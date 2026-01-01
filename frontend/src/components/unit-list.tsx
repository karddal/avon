"use server"

import Unit from "@/components/unit";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {headers} from "next/headers";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, CloudAlert, CloudAlertIcon} from "lucide-react";

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
};

type UnitListProps = {
  currentYear: number;
  finished: boolean;
};

async function getData(currentYear:number, finished: boolean) {
  console.log("token:");
  const token = await auth.api.getToken({
    headers: await headers(),
  });
  console.log(token.token);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
    cache: "no-store"
  });
  await new Promise(r => setTimeout(r, 2000));
  let unitListData: UnitData[];
  if (!response.ok) {
    throw new Error("Failed to fetch units");
  }
  else {
    unitListData = await response.json();
  }
  //  academic year window: Sept 1 -> Aug 31
  const start = new Date(currentYear, 8, 1); // Sept = month 8
  const end = new Date(currentYear + 1, 7, 31, 23, 59, 59, 999);

  const filtered = unitListData.filter((unit) => {
    const created = new Date(unit.creation_date);
    const inRange = created >= start && created <= end;
    if (finished) {
      return created < start;
    }
    return inRange;
  });
  console.log(filtered)
  return filtered
}

export default async function UnitList({unitData
}: { unitData: UnitData[] }) {
  // place unit data into tabs based on year
  console.log(unitData);
  try {
    // const filtered = await getData(currentYear, finished)
    return (
        <>
          {unitData.length > 0 &&
              unitData.map((unit) => <Unit key={unit.id} props={unit} />)}
          {unitData.length == 0 &&
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
          }
        </>
    );
  } catch (error) {
    return (
        <>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CloudAlertIcon />
              </EmptyMedia>
              <EmptyTitle>Oops, something went wrong.</EmptyTitle>
              <EmptyDescription>
                Couldn't fetch units.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </>
    )
  }

}
