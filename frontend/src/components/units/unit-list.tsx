"use server";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Unit from "@/components/units/unit";
import { getRequestJWT } from "@/lib/auth-utils";

export type UnitData = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
};

type Programme = {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  units: UnitData[];
};

type ProgrammesResponse = {
  programmes: Programme[];
};

export default async function UnitList() {
  // place unit data into tabs based on year
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/units-by-programme`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
  const unitData: ProgrammesResponse = await data.json();
  const programmes = unitData.programmes;
  console.log(unitData);
  // const filtered = await getData(currentYear, finished)
  const d = programmes.at(0)?.id ?? "0";
  return (
    <Tabs
      defaultValue={d}
      orientation={"vertical"}
      className={"flex flex-col lg:flex-row"}
    >
      <TabsList
        className={"basis-1/3 flex flex-col h-min w-full justify-start"}
      >
        {programmes.map((programme) => (
          <TabsTrigger
            key={programme.id}
            className={"text-lg p-4 w-full text-ellipsis"}
            value={programme.id}
          >
            {programme.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={"basis-2/3"}>
        {programmes.map((programme) => (
          <TabsContent
            key={programme.id}
            className={"flex-2/5"}
            value={programme.id}
          >
            {programme.units.map((unit) => (
              <div className={"mb-3"} key={unit.id}>
                <Unit key={unit.id} props={unit} />
              </div>
            ))}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
  // return (
  //   <Empty>
  //     <EmptyHeader>
  //       <EmptyMedia variant="icon">
  //         <BookDashed />
  //       </EmptyMedia>
  //       <EmptyTitle>No units.</EmptyTitle>
  //       <EmptyDescription>
  //         No units were found that you are connected to.
  //       </EmptyDescription>
  //     </EmptyHeader>
  //   </Empty>
  // );
}
