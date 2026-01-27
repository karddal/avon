"use server";

import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";

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
          <div className="w-32 py-4 border-2 hover:cursor-pointer">
            Create unit
          </div>
        </Link>
      )}
      <PageContent />
    </Suspense>
  );
}
