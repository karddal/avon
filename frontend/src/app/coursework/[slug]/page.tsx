import { Suspense } from "react";
import { DropdownCard } from "@/components/dropdown-card";
import RunTestsItem from "@/components/run-tests-item";
import TestPassedProgressBar from "@/components/tests-passed-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // const name = getNameFromUnit(slug);
  const name = "Sketch";
  // const desc = getDescFromUnit(slug);

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex flex-col col-span-3">
        <div className="font-semibold text-5xl text-shadow-2xs">
          <span className="font-light">
            Imperative and Functional Programming{" "}
          </span>
          <br />
          {name}
        </div>
        <div className="w-full bg-accent-foreground"></div>
      </div>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-h-0 mb-2">
        <div className="flex flex-col lg:col-span-2 gap-4 lg:min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Description</div>
                <div className="font-light">
                  Information about the coursework.
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col overflow-y-scroll break-words h-32 border bg-accent">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse mollis pellentesque arcu ac tempor. Cras iaculis
                dictum ullamcorper. Vivamus at pulvinar lectus. Pellentesque
                fringilla sollicitudin semper. Cras mi odio, cursus a risus
                eget, facilisis interdum ligula. Sed vestibulum risus in
                vulputate dictum. Nulla viverra purus in sem dignissim tempus.
                Vestibulum pellentesque aliquam feugiat. Vestibulum sed justo eu
                sem consequat luctus. Nulla ex enim, iaculis eu tincidunt vel,
                maximus ac ante. Pellentesque habitant morbi tristique senectus
                et netus et malesuada fames ac turpis egestas. Proin sed mauris
                velit. Phasellus tempor consequat nisi sed rutrum. Nullam rutrum
                facilisis arcu, id rhoncus quam pulvinar a. Integer quis erat
                quis tortor pharetra interdum. Nam ut arcu euismod tellus
                sagittis facilisis et a nisl.
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col gap-4 h-96 md:h-[32rem] lg:min-h-0 xl:h-auto xl:min-h-0">
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Activity</div>
                <div className="font-light">
                  See a feed of events related to your coursework here.
                </div>
              </CardTitle>
              {/*<Tabs defaultValue="account">*/}
              {/*  <TabsList>*/}
              {/*    <TabsTrigger value="account">Ongoing</TabsTrigger>*/}
              {/*    <TabsTrigger value="password">Finished</TabsTrigger>*/}
              {/*  </TabsList>*/}
              {/*</Tabs>*/}
            </CardHeader>

            <Suspense fallback={<Skeleton />}>
              <CardContent className="overflow-y-scroll">
                <div className="flex flex-col gap-2">
                  <Card className="gap-2 p-4 bg-accent w-full text-2xl font-normal">
                    <p>Tests finished</p>
                    <TestPassedProgressBar
                      className=""
                      value={100}
                      colour="#59AC77"
                    />
                    <p className="text-sm">100/100 tests passed.</p>
                    <p className="text-sm font-light">20 October 2025 15:00</p>
                    {/*<div className="w-full h-1 bg-green-600"></div>*/}
                  </Card>
                  <Card className="gap-2 p-4 bg-accent w-full text-2xl font-normal">
                    <p>Tests finished</p>
                    <TestPassedProgressBar
                      className=""
                      value={35}
                      colour="#F4991A"
                    />
                    <p className="text-sm">35/100 tests passed.</p>
                    <p className="text-sm font-light">20 October 2025 15:00</p>
                    {/*<div className="w-full h-1 bg-green-600"></div>*/}
                  </Card>
                </div>
              </CardContent>
            </Suspense>
          </Card>
        </div>
        <div className="flex flex-col xl:col-span-1 lg:col-span-2 gap-4 min-h-0">
          <DropdownCard
            title={"Information"}
            desc={"Important information about the coursework appears here."}
          >
            {" "}
            <p>Set date: </p>
            <p>Due date: </p>
          </DropdownCard>
          <DropdownCard
            title="Tools"
            desc="Tools you can use for this coursework appear here."
          >
            {" "}
            <RunTestsItem />
          </DropdownCard>
        </div>
      </section>
    </div>
  );
}
