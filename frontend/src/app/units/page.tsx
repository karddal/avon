import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import TabSwitcher from "@/components/tab-switcher";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";
import { getCurrentUser } from "@/lib/auth";

type Status = "ongoing" | "finished";

interface PageProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

async function PageContent({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const userRole = await getCurrentUser();

  console.log(userRole);

  const params = await searchParams;
  const yearNow = new Date().getFullYear();
  const currentYear = params.year
    ? parseInt(params.year, 10)
    : new Date().getFullYear();
  const currentAcademicYear = `${currentYear}/${currentYear + 1}`;

  const activeTab = (params.tab || "ongoing") as Status;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab}>
        <TabsList className="flex flex-col h-auto min-h-fit items-start justify-start md:flex-row md:align-center md:justify-center md:items-center gap-4 bg-background md:my-4">
          <YearSelector value={currentYear} />
          <TabSwitcher currentYear={currentYear} yearNow={yearNow} />
          {userRole === "lecturer" && (
            <Link
              href="/create-unit"
              className="bg-accent text-black font-medium text-sm p-3 flex gap-2 border hover:cursor-pointer"
            >
              {" "}
              Create a New Unit +{" "}
            </Link>
          )}
        </TabsList>

        <TabsContent value="ongoing">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList
                currentYear={currentYear}
                finished={false}
                token={token}
              />
            </section>
          </Suspense>
        </TabsContent>
        <TabsContent value="finished">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList
                currentYear={currentYear}
                finished={true}
                token={token}
              />
            </section>
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground pl-2">
        Academic Year: {currentAcademicYear}
      </div>
    </div>
  );
}

export default function UnitPage({ searchParams }: PageProps) {
  return (
    <Suspense>
      <PageContent searchParams={searchParams} />
    </Suspense>
  );
}
