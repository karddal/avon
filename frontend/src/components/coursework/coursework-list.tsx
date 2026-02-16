import { BookDashed } from "lucide-react";
import Coursework from "@/components/coursework/coursework";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

type CourseworkData = {
  id: string;
  name: string;
  description: string;
  due_date: string;
  creation_date: string;
  colour: string;
};

type unit = {
  id: string;
  unit_code: string;
  name: string;
  programme_start_date: string;
  programme_end_date: string;
  courseworks: CourseworkData[];
};

export default async function CourseworkList({
  finished,
}: {
  finished: boolean;
}) {
  const token = await getRequestJWT();
  const s = await requireSession();
  const role = s.user.role;
  const hasPermissions = role === "admin" || role === "lecturer";
  const route = role === "admin" ? "coursework/all" : "me/courseworks";
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${route}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const courseworkListData: unit[] = await response.json();

  const now = new Date();

  const filteredUnitsList = [];
  for (const unit of courseworkListData) {
    const filteredCourseworks = unit.courseworks.filter((coursework) => {
      const created = new Date(coursework.creation_date);
      const due = new Date(coursework.due_date);

      const isActive = now >= created && now <= due;

      if (finished) {
        return now > due;
      }

      return isActive;
    });
    if (filteredCourseworks.length > 0) {
      filteredUnitsList.push({
        id: unit.id,
        unit_code: unit.unit_code,
        courseworks: filteredCourseworks,
        name: unit.name,
        programme_start_date: unit.programme_start_date,
        programme_end_date: unit.programme_end_date,
      });
    }
  }

  return (
    <>
      {filteredUnitsList.length === 0 && (
        <Empty className="border-dashed border-2 bg-muted/20 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookDashed className="text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No coursework found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any courseworks that you are connected to.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {filteredUnitsList.length > 0 && (
        <Tabs
          defaultValue={filteredUnitsList[0].id}
          orientation={"vertical"}
          className={"flex flex-col lg:flex-row w-full"}
        >
          <TabsList
            className={"basis-1/3 flex flex-col h-min w-full justify-start"}
          >
            {filteredUnitsList.map((unit) => (
              <TabsTrigger
                key={unit.id}
                className={"p-4 w-full text-ellipsis flex"}
                value={unit.id}
              >
                <span className="text-sm md:text-lg text-wrap ">
                  {unit.name}{" "}
                  <span className={"font-light text-sm md:text-lg"}>
                    {new Date(unit.programme_start_date).getFullYear()}-
                    {new Date(unit.programme_end_date).getFullYear()}
                  </span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className={"basis-2/3"}>
            {filteredUnitsList.map((unit) => (
              <TabsContent key={unit.id} className={""} value={unit.id}>
                {unit.courseworks.map((coursework) => (
                  <div className={"mb-3"} key={coursework.id}>
                    <Coursework
                      key={coursework.id}
                      hasPermissions={hasPermissions}
                      props={{
                        id: coursework.id,
                        name: coursework.name,
                        unit_id: unit.id,
                        description: coursework.description,
                        colour: coursework.colour,
                        creation_date: coursework.creation_date,
                        due_date: coursework.due_date,
                        unit_code: unit.unit_code,
                      }}
                    />
                  </div>
                ))}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </>
  );
}
