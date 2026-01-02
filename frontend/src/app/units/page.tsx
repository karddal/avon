"use server"

import {Suspense} from "react";
import Loading from "@/app/coursework/loading";
import UnitList from "@/components/unit-list";
import {requireSession} from "@/lib/auth-utils";

type Status = "ongoing" | "finished";

interface ComponentProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

interface PageProps {
  searchParams: Promise<{ year?: string; tab?: Status }>;
}

async function PageContent({ searchParams }: ComponentProps) {
  await requireSession(); // make sure logged in

  return(
      <UnitList></UnitList>
  )
}

export default async function UnitPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading/>}>
      <PageContent searchParams={searchParams}/>
    </Suspense>
  );
}
