import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import UnitsCourseworkList from "@/components/units/units-coursework-list";
import Loading from "@/app/coursework/loading";





export default function UnitCourseworksModule({ role, slug }: { role: string; slug: string }) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>
            <div className="text-2xl">Coursework</div>
            <div className="font-light">
                See your assigned courseworks here.
            </div>
            </CardTitle>
        </CardHeader>

        <CardContent className="w-full flex flex-col">
            <Tabs defaultValue="ongoing">
            <div
                className={
                "flex flex-row flex-wrap justify-between items-center"
                }
            >
                <TabsList>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
                </TabsList>
                {(role === "lecturer" || role === "admin") && (
                <Button asChild variant={"outline"} size={"sm"}>
                    <Link href={`/units/${slug}/create-coursework`}>
                    <ClipboardPlus />
                    Assign coursework
                    </Link>
                </Button>
                )}
            </div>
            <TabsContent value={"ongoing"}>
                <Suspense fallback={<Loading />}>
                <UnitsCourseworkList
                    unit_id={slug}
                    finished={false}
                ></UnitsCourseworkList>
                </Suspense>
            </TabsContent>
            <TabsContent className={"w-full"} value={"finished"}>
                <Suspense fallback={<Loading />}>
                <UnitsCourseworkList
                    unit_id={slug}
                    finished={true}
                ></UnitsCourseworkList>
                </Suspense>
            </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}