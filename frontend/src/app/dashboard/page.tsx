import { Edit, Flag, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { StatsChart } from "@/components/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
<<<<<<< HEAD
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
=======
>>>>>>> refs/remotes/origin/admin-dashboard-page

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3 gap-0">
          <CardContent className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
            <Card className="p-2 gap-0 bg-accent">
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  colour="red"
                  data={[
                    { day: "Monday", simplify: 4, sketch: 6 },
                    { day: "Tuesday", simplify: 2, sketch: 4 },
                    { day: "Wednesday", simplify: 1, sketch: 6 },
                    { day: "Thursday", simplify: 5, sketch: 6 },
                    { day: "Friday", simplify: 8, sketch: 6 },
                    { day: "Saturday", simplify: 8, sketch: 7 },
                    { day: "Sunday", simplify: 8, sketch: 5 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="p-2 gap-0 bg-accent">
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Tests passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  colour="blue"
                  data={[
                    { day: "Monday", simplify: 9, sketch: 6 },
                    { day: "Tuesday", simplify: 2, sketch: 4 },
                    { day: "Wednesday", simplify: 1, sketch: 6 },
                    { day: "Thursday", simplify: 5, sketch: 6 },
                    { day: "Friday", simplify: 8, sketch: 10 },
                    { day: "Saturday", simplify: 8, sketch: 10 },
                    { day: "Sunday", simplify: 8, sketch: 10 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="p-2 gap-0 bg-accent lg:col-span-1 col-span-2">
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Late submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  colour="green"
                  data={[
                    { day: "Monday", simplify: 1, sketch: 0 },
                    { day: "Tuesday", simplify: 2, sketch: 1 },
                    { day: "Wednesday", simplify: 1, sketch: 2 },
                    { day: "Thursday", simplify: 2, sketch: 1 },
                    { day: "Friday", simplify: 2, sketch: 0 },
                    { day: "Saturday", simplify: 1, sketch: 1 },
                    { day: "Sunday", simplify: 0, sketch: 2 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <div className="col-span-3 flex lg:flex-row flex-col gap-4">
<<<<<<< HEAD
=======
          <Card className="flex flex-col lg:w-[70%]">
            <CardTitle>
              <div className="font-semibold text-2xl px-6">Coursework</div>
              <div className="font-light text-l px-6">
                See your currently assigned courseworks here.
              </div>
            </CardTitle>
            <CardContent>
              <div className="gap-2 overflow-y-auto flex flex-col h-96">
                <Suspense fallback={<Skeleton />}>
                  <Link href="/coursework/power-to-the-people">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="p-4">Power to the People</p>
                      <div className="w-full h-1 bg-pink-500"></div>
                    </Card>
                  </Link>
                  <Link href="/coursework/simplify">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="p-4">Simplify</p>
                      <div className="w-full h-1 bg-pink-500"></div>
                    </Card>
                  </Link>
                  <Link href="/coursework/list">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="p-4">List</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                  </Link>
                  <Link href="/coursework/sketch">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                  </Link>
                  <Link href="/coursework/sketch">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="p-4">Sketch</p>
                      <div className="w-full h-1 bg-blue-500"></div>
                    </Card>
                  </Link>
                </Suspense>
              </div>
            </CardContent>
          </Card>
>>>>>>> refs/remotes/origin/admin-dashboard-page
          <Card className="flex flex-col lg:w-[30%]">
            <CardTitle>
              <div className="font-semibold text-2xl px-6">Quick Actions</div>
              <div className="font-light text-l px-6">
                Quick actions at a glance.
              </div>
            </CardTitle>
            <CardContent className="flex flex-col gap-4 m-0">
              <Link href="/create" className="hover:bg-green-400/10">
                <Card className="bg-green-400/10 p-2">
                  <CardContent className="flex flex-row p-0 items-center gap-4">
                    <Plus className="size-12 p-0"></Plus>
<<<<<<< HEAD
                    <p className="font-semibold text-xl">Create coursework</p>
=======
                    <p className="font-semibold text-xl">
                      Create a new coursework
                    </p>
>>>>>>> refs/remotes/origin/admin-dashboard-page
                  </CardContent>
                </Card>
              </Link>

              <Link href="/end" className="hover:bg-red-400/10">
                <Card className="bg-red-400/10 p-2">
                  <CardContent className="flex flex-row p-0 items-center gap-4">
                    <Flag className="size-12 p-0"></Flag>
<<<<<<< HEAD
                    <p className="font-semibold text-xl">End submissions</p>
=======
                    <p className="font-semibold text-xl">
                      End submissions to a coursework
                    </p>
>>>>>>> refs/remotes/origin/admin-dashboard-page
                  </CardContent>
                </Card>
              </Link>
              <Link href="/edit" className="hover:bg-amber-400/10">
                <Card className="bg-amber-400/10 p-2">
                  <CardContent className="flex flex-row p-0 items-center gap-4">
                    <Edit className="size-12 p-0"></Edit>
                    <p className="font-semibold text-xl">Edit Deadline</p>
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>
<<<<<<< HEAD
          <Card className="flex flex-col lg:w-full">
            <CardContent>
              <Tabs defaultValue="coursework" className="">
                <TabsList>
                  <TabsTrigger value="coursework">Coursework</TabsTrigger>
                  <TabsTrigger value="units">Units</TabsTrigger>
                </TabsList>
                <div className="gap-2 overflow-y-auto flex flex-col h-96">
                  <Suspense fallback={<Skeleton />}>
                    <TabsContent
                      className="flex flex-col gap-2"
                      value="coursework"
                    >
                      <Link href="/coursework/power-to-the-people">
                        <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                          <p className="p-4">Power to the People</p>
                          <div className="w-full h-1 bg-pink-500"></div>
                        </Card>
                      </Link>
                      <Link href="/coursework/simplify">
                        <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                          <p className="p-4">Simplify</p>
                          <div className="w-full h-1 bg-pink-500"></div>
                        </Card>
                      </Link>
                      <Link href="/coursework/list">
                        <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                          <p className="p-4">List</p>
                          <div className="w-full h-1 bg-blue-500"></div>
                        </Card>
                      </Link>
                      <Link href="/coursework/sketch">
                        <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                          <p className="p-4">Sketch</p>
                          <div className="w-full h-1 bg-blue-500"></div>
                        </Card>
                      </Link>
                      <Link href="/coursework/sketch">
                        <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                          <p className="p-4">Sketch</p>
                          <div className="w-full h-1 bg-blue-500"></div>
                        </Card>
                      </Link>
                    </TabsContent>
                  </Suspense>
                </div>
              </Tabs>
            </CardContent>
          </Card>
          {/* <Card className="flex flex-col lg:w-full">
            <CardTitle>
              <div className="font-semibold text-2xl px-6">Units</div>
              <div className="font-light text-l px-6">
                See your assigned units here.
              </div>
            </CardTitle>
            <CardContent>
              <div className="gap-2 overflow-y-auto flex flex-col h-96">
                <Suspense fallback={<Skeleton />}>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                  <Link href="/units/COMS10015">
                    <Card className="gap-2 p-0 bg-accent w-full text-2xl font-normal hover:bg-foreground/10">
                      <p className="px-2 py-0 text-medium">
                        Computer Architecture
                      </p>
                      <p className="px-2 py-0 text-sm font-light">COMS10015</p>
                      <div className="w-full h-1 bg-green-500"></div>
                    </Card>
                  </Link>
                </Suspense>
              </div>
            </CardContent>
          </Card> */}
=======
>>>>>>> refs/remotes/origin/admin-dashboard-page
        </div>
      </section>
    </div>
  );
}
