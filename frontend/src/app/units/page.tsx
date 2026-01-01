"use server"

import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {Suspense} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DynTab} from "@/app/units/tabs";
import Loading from "@/app/coursework/loading";
import UnitList, {UnitData} from "@/components/unit-list";

type Status = "ongoing" | "finished";

interface ComponentProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

interface PageProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

async function PageContent({ searchParams }: ComponentProps) {
  const {tab = '2025'} = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login")
  }

  const token = await auth.api.getToken({
    headers: await headers(),
  });
  console.log(token.token);

  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
    cache: "no-store"
  });

  const unitData: UnitData[] = await data.json();
  return(
      <UnitList unitData={unitData}></UnitList>
  )
}

export default async function UnitPage({ searchParams }: PageProps) {
  console.log("UNITPAGE RERENDER")
  return (
    <Suspense fallback={<Loading/>}>
      <PageContent searchParams={searchParams}/>
    </Suspense>
  );
}
