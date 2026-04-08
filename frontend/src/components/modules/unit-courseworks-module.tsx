import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import UnitsCourseworkList from "@/components/units/units-coursework-list";
import Loading from "@/app/coursework/loading";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

type courseworkData = {
  id: string;
  name: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type courseworkResponse = {
  courseworks: courseworkData[];
};

export default function UnitCourseworksModule({
  role,
  unit,
  courseworks,
}: {
  role: string;
  unit: UnitData;
  courseworks: courseworkResponse;
}) {
  return (
    <div>
      <div className="flex flex-col space-y-1.5 p-6">
        <div>
          <div className="text-2xl font-semibold">Coursework</div>
          <div className="font-light">
            See your assigned courseworks here.
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col p-6 pt-0">
        <Tabs defaultValue="ongoing">
          <div className="flex flex-row flex-wrap justify-between items-center">
            <TabsList>
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="finished">Finished</TabsTrigger>
            </TabsList>

            {(role === "lecturer" || role === "admin") && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/units/${unit.id}/create-coursework`}>
                  <ClipboardPlus />
                  Assign coursework
                </Link>
              </Button>
            )}
          </div>

          <TabsContent value="ongoing">
            <Suspense fallback={<Loading />}>
              <UnitsCourseworkList
                courseworks={courseworks}
                finished={false}
                role={role}
              />
            </Suspense>
          </TabsContent>

          <TabsContent className="w-full" value="finished">
            <Suspense fallback={<Loading />}>
              <UnitsCourseworkList
                courseworks={courseworks}
                finished={true}
                role={role}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}