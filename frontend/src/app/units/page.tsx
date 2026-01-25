"use server";

import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";
import Link from "next/link";

async function PageContent() {
  await requireSession(); // make sure logged in

  return <UnitList></UnitList>;
}

export default async function UnitPage() {
  const s = await requireSession();
  let userRole = s.user.role;
  if (!userRole) {
    userRole = "user";
  }
  return (
    <Suspense fallback={<Loading />}>

      {userRole === "admin" && (
        <Link href={"/units/create-unit"}>
          <button className="w-32 py-4 border-2 hover:cursor-pointer" >
            Create unit
          </button>
        </Link>
      )}
      <PageContent />
    </Suspense>
  );
}
