"use server"

import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import TabSwitcher from "@/components/tab-switcher";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";

type Status = "ongoing" | "finished";

interface ComponentProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

interface PageProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

async function PageContent({ searchParams }: ComponentProps) {
  const params = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login")
  }

  const user = session.user;
  let role = user.role;
  if (!role) {
    role = "user"
  }
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
          {role === "lecturer" && (
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

export default async function UnitPage({ searchParams }: PageProps) {
  return (
    <Suspense>
      <PageContent searchParams={searchParams}/>
    </Suspense>
  );
}
