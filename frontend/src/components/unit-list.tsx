"use server";

import { BookDashed, CloudAlert, CloudAlertIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Unit from "@/components/unit";
import { auth } from "@/lib/auth";
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

export default async function UnitList() {
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
        <Tabs
          defaultValue={d}
          orientation={"vertical"}
          className={"flex flex-row"}
        >
          <TabsList
            className={"flex flex-1/5 flex-col h-min w-full justify-start"}
          >
            {Object.entries(groupedUnits).map(([year, units]) => (
              // <section key={year}>
              //   <h3>{year}</h3>
              //   {units?.map((unit) => (
              //       <Unit key={unit.id} props={unit}/>
              //   ))}
              // </section>
              <TabsTrigger
                key={year}
                className={"text-lg p-4 w-full"}
                value={year}
              >
                {year}/{Number.parseInt(year) + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(groupedUnits).map(([year, units]) => (
            <TabsContent key={year} className={"flex-2/5"} value={year}>
              {units?.map((unit) => (
                <div className={"mb-3"} key={unit.id}>
                  <Unit key={unit.id} props={unit} />
                </div>
              ))}
            </TabsContent>
          ))}
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
    );
  }
}
