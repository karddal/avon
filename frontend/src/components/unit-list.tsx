"use server"

import Unit from "@/components/unit";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {headers} from "next/headers";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, CloudAlert, CloudAlertIcon} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  academic_year: number;
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
  const groupedUnits = Object.groupBy(unitData, (unit) => unit.academic_year);
    // const filtered = await getData(currentYear, finished)
  if (groupedUnits != undefined) {
    const d = Object.keys(groupedUnits).at(0) ?? "0";
    return (
        // <>
        //   {
        //     Object.entries(groupedUnits).map(([year, units]) => (
        //       <section key={year}>
        //         <h3>{year}</h3>
        //         {units?.map((unit) => (
        //             <Unit key={unit.id} props={unit}/>
        //         ))}
        //       </section>
        //     ))
        //   }
        // </>
        <>
          <Tabs defaultValue={d} orientation={"vertical"} className={"flex flex-row"}>
            <TabsList className={"flex flex-1/5 flex-col h-min w-full justify-start"}>
              {
                Object.entries(groupedUnits).map(([year, units]) => (
                    // <section key={year}>
                    //   <h3>{year}</h3>
                    //   {units?.map((unit) => (
                    //       <Unit key={unit.id} props={unit}/>
                    //   ))}
                    // </section>
                  <TabsTrigger key={year} className={"text-lg p-4 w-full"} value={year}>{year}/{Number.parseInt(year) + 1}</TabsTrigger>
                ))
              }
            </TabsList>
            {
              Object.entries(groupedUnits).map(([year, units]) => (
                  <TabsContent key={year} className={"flex-2/5"} value={year}>
                    {units?.map((unit) => (
                        <div className={"mb-3"} key={unit.id}>
                          <Unit key={unit.id} props={unit}/>
                        </div>
                    ))}
                  </TabsContent>
              ))
            }
          </Tabs>
        </>
    );
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
    )
  }
}
