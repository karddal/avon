import { Suspense } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownCard } from "@/components/dropdown-card";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // const name = getNameFromUnit(slug);
  const name = "Imperative and Functional Programming";
  // const desc = getDescFromUnit(slug);

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex flex-col col-span-3">
        <div className="font-semibold text-5xl text-shadow-2xs">
          <span className="font-light">{slug} </span>
          {name}
        </div>
        <div className="w-full bg-accent-foreground"></div>
      </div>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-h-0 mb-2">
        <div className="flex flex-col lg:col-span-2 gap-4 xl:min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Description</div>
                <div className="font-light">Information about the unit.</div>
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
                <div className="text-2xl">Coursework</div>
                <div className="font-light">
                  See your assigned courseworks here.
                </div>
              </CardTitle>
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Ongoing</TabsTrigger>
                  <TabsTrigger value="password">Finished</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              <div className="gap-4 flex-1 flex-col min-h-0 overflow-y-scroll">
                <div className="flex flex-col gap-4 bg-accent/50 border min-h-0 overflow-y-scroll">
                  <Suspense fallback={<Skeleton />}>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Power to the People</p>
                      <div className="w-full h-1 bg-pink-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Simplify</p>
                      <div className="w-full h-1 bg-pink-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">List</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                  </Suspense>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col xl:col-span-1 lg:col-span-2 gap-4 min-h-0">
          <DropdownCard
            title="Unit Staff"
            desc="Lecturers and Teachers appear here."
          >
            <Card className="p-0 bg-accent flex flex-row items-center gap-4">
              <Avatar className="bg-slate-300 size-16 rounded-none"></Avatar>
              <div className="flex flex-col">
                <div className="text-xl font-semibold">Sion Hannuna</div>
                <div className="font-light">
                  Senior Lecturer, School of Computer Science
                </div>
              </div>
            </Card>
            <Card className="p-0 bg-accent flex flex-col lg:flex-row items-center gap-4">
              <Avatar className="bg-slate-300 size-16 rounded-none"></Avatar>
              <div className="flex flex-col">
                <div className="text-xl font-semibold">Sion Hannuna</div>
                <div className="font-light">
                  Senior Lecturer, School of Computer Science
                </div>
              </div>
            </Card>
            <Card className="p-0 bg-accent flex flex-row items-center gap-4">
              <Avatar className="bg-slate-300 size-16 rounded-none"></Avatar>
              <div className="flex flex-col">
                <div className="text-xl font-semibold">Sion Hannuna</div>
                <div className="font-light">
                  Senior Lecturer, School of Computer Science
                </div>
              </div>
            </Card>
          </DropdownCard>
          <DropdownCard
            title="Announcements"
            desc="Recent announcements appear here."
          >
            {" "}
            <Card className="py-0 bg-accent flex flex-row items-center gap-4">
              <div className="flex flex-row">
                <div className="bg-red-500 h-auto w-1"></div>
                <div className="flex flex-col px-2">
                  <div className="text-xl font-semibold">New coursework!</div>
                  <div className="font-light">
                    <span className="font-bold">Sketch</span> has been released.
                    Get started now!
                  </div>
                </div>
              </div>
            </Card>
            <Card className="py-0 bg-accent flex flex-row items-center gap-4">
              <div className="flex flex-row">
                <div className="bg-red-500 h-auto w-1"></div>
                <div className="flex flex-col px-2">
                  <div className="text-xl font-semibold">New coursework!</div>
                  <div className="font-light">
                    <span className="font-bold">Sketch</span> has been released.
                    Get started now!
                  </div>
                </div>
              </div>
            </Card>
            <Card className="py-0 bg-accent flex flex-row items-center gap-4">
              <div className="flex flex-row">
                <div className="bg-red-500 h-auto w-1"></div>
                <div className="flex flex-col px-2">
                  <div className="text-xl font-semibold">New coursework!</div>
                  <div className="font-light">
                    <span className="font-bold">Sketch</span> has been released.
                    Get started now!
                  </div>
                </div>
              </div>
            </Card>
          </DropdownCard>
        </div>
      </section>
    </div>
  );
}
