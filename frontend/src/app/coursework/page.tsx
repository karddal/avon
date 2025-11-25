import CourseworkList from "@/components/coursework-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function courseworkListing() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="ongoing">
        <TabsList className="flex flex-row gap-4 bg-background my-4">
          <div className="bg-accent p-1">
            <TabsTrigger value="ongoing" className="bg-accent px-4 py-2">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="finished" className="bg-accent px-4 py-2">
              Finished
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="ongoing" className="w-full">
          <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <CourseworkList finished={false} />
          </section>
        </TabsContent>
        <TabsContent value="finished">
          <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <CourseworkList finished={true} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
