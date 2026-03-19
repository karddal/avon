import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CourseworkList from "@/components/coursework/coursework-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "./loading";

function CreateCoursework() {
  return (
    <div>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link data-cy="create-coursework-link" href={"/coursework/create-coursework"}>
          <ClipboardPlus />
          Create coursework
        </Link>
      </Button>
    </div>
  );
}

async function PageContent() {
  return (
    <div className="space-y-6">
      <Tabs data-cy="coursework-tabs" defaultValue="ongoing" className={""}>
        <div className="flex flex-row align-middle items-center justify-between">
          <TabsList className="flex flex-row gap-4 bg-background my-4">
            <div className="bg-accent p-1">
              <TabsTrigger
                data-cy="coursework-tab-ongoing"
                value="ongoing"
                className="bg-accent px-4 py-2"
              >
                Ongoing
              </TabsTrigger>
              <TabsTrigger
                data-cy="coursework-tab-finished"
                value="finished"
                className="bg-accent px-4 py-2"
              >
                Finished
              </TabsTrigger>
            </div>
          </TabsList>
          <CreateCoursework />
        </div>

        <TabsContent value="ongoing" className="">
          <Suspense fallback={<Loading />}>
            <CourseworkList finished={false} />
          </Suspense>
        </TabsContent>
        <TabsContent value="finished" className={""}>
          <Suspense fallback={<Loading />}>
            <CourseworkList finished={true} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CourseworkPage() {
  return (
    <Suspense fallback={<Loading></Loading>}>
      <PageContent />
    </Suspense>
  );
}
