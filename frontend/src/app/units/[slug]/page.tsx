import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitDescription from "@/app/units/[slug]/description";
import UnitName from "@/app/units/[slug]/name";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LecturerDropdown from "@/components/units/lecturer-dropdown";
import Lecturers from "@/components/units/lecturers";
import UnitsCourseworkList from "@/components/units/units-coursework-list";
import { get_unit_scopes } from "@/lib/actions/unit/get_unit_scopes";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import { get_username_from_id } from "@/lib/actions/auth/get_username";
import { get_user_image_from_id } from "@/lib/actions/coursework/get_image";
import { get_owner_of_unit } from "@/lib/actions/unit/get_owner_of_unit";
import {
  getUnitLayoutForCurrentUnit,
  saveUnitLayoutForCurrentUnit,
} from "@/lib/actions/unit-layout";
import UnitClient from "@/components/modules/unit-client";
import { availableUnitModules, defaultUnitLayout } from "@/lib/unit-layout";

type Response = {
  lecturers: string[];
};

type Lecturer = {
  id: string;
  name: string;
  image: string;
  role: boolean;
};

type UnitDataResponse = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  unlocked: boolean;
};

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
  unlocked: boolean;
};

type courseworkData = {
  id: string;
  name: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type courseworkResponse = {
  courseworks: courseworkData[];
};

async function PageContent({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const slug = String(p.slug);
  console.log("UNIT", slug);
  const s = await requireSession();
  const token = await getRequestJWT();
  const scopes: Set<string> = await get_unit_scopes(slug);

  let userRole = s.user.role;
  const me = s.user.id;
  if (!userRole) {
    userRole = "user";
  }
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const c: UnitDataResponse = await response.json();
  const data: UnitUpdateData = {
    id: c.id,
    name: c.name,
    description: c.description,
    colour: c.colour,
    unit_code: c.unit_code,
    programme_id: c.programme_id,
    unlocked: c.unlocked,
  };
  const lecturersResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${data.id}/lecturers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const lecturerResponse: Response = await lecturersResponse.json();
  const lecturers = lecturerResponse.lecturers;
  const owner = await get_owner_of_unit(data.id);

    const results: Lecturer[] = [];
    for (const lecturer of lecturers) {
      console.log(lecturer);
      results.push({
        id: lecturer,
        name: await get_username_from_id(lecturer),
        image: await get_user_image_from_id(lecturer),
        role: lecturer === owner,
      });
    }

  const courseworkResponseRaw = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${data.id}/courseworks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const savedLayout = await getUnitLayoutForCurrentUnit(data.id);
  const courseworkResponse: courseworkResponse = await courseworkResponseRaw.json();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col col-span-3 min-h-0">
        <div className="font-semibold text-5xl text-shadow-2xs">
          <Suspense
            fallback={
              <div className="h-16">
                <Skeleton className="bg-foreground/10" />
              </div>
            }
          >
            <div className="flex flex-row gap-4 justify-between items-center">
              <UnitName slug={slug} token={token} />
              {(userRole === "lecturer" || userRole === "admin") && (
                <LecturerDropdown
                  unit_update_data={data}
                  me={me}
                  slug={slug}
                  scopes={scopes}
                ></LecturerDropdown>
              )}
            </div>
          </Suspense>
        </div>
        <div className="w-full bg-accent-foreground"></div>
      </div>
      <div className="flex min-h-0 mt-4 md:mt-0 mb-0 flex-1 flex-col space-y-4 md:space-y-6">
        <UnitClient
          initialLayout={savedLayout}
          availableModules={availableUnitModules}
          saveLayout={saveUnitLayoutForCurrentUnit}
          unit={data}
          role={userRole}
          lecturers={results}
          courseworks={courseworkResponse}
        />
      </div>
      
    </>
  );
}

export default function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={params} />
    </Suspense>
  );
}
