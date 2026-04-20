import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitsCourseworkList from "@/components/units/units-coursework-list";

type UnitCoursework = {
  id: string;
  name: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type UnitCourseworksModuleProps = {
  role: string;
  unit: {
    id: string;
  };
  courseworks: {
    courseworks: UnitCoursework[];
  };
};

export default function UnitCourseworksModule({
  role,
  unit,
  courseworks,
}: UnitCourseworksModuleProps) {
  return (
    <div className="flex h-[18rem] min-h-0 flex-col lg:h-full">
      <div className="flex flex-col space-y-1.5 p-6">
        <div>
          <div className="text-2xl font-semibold">Coursework</div>
          <div className="font-light">See your assigned courseworks here.</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-6 pt-0 pb-6">
        <Tabs defaultValue="ongoing" className="flex h-full min-h-0 flex-col">
          <div className="mb-3 flex shrink-0 flex-row justify-between items-center">
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

          <TabsContent value="ongoing" className="mt-0 min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <Suspense fallback={<Loading />}>
                <UnitsCourseworkList
                  courseworks={courseworks}
                  finished={false}
                  role={role}
                />
              </Suspense>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="finished" className="mt-0 min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <Suspense fallback={<Loading />}>
                <UnitsCourseworkList
                  courseworks={courseworks}
                  finished={true}
                  role={role}
                />
              </Suspense>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
