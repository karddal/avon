import CourseworkList from "@/components/coursework-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function courseworkListing() {
  return (
    <div className="space-y-6">
      {/* <YearSelector /> */}
      <Tabs defaultValue="ongoing">
        <TabsList className="flex flex-row gap-4 bg-background">
          <div className="bg-accent p-1">
            <TabsTrigger className="bg-accent" value="ongoing">
              Ongoing
            </TabsTrigger>
            <TabsTrigger className="bg-accent" value="finished">
              Finished
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="ongoing" className="w-full">
          <CourseworkList />
        </TabsContent>
        <TabsContent value="finished">
          <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <CourseworkList />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
