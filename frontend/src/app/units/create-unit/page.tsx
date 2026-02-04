import { RedirectType, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireSession } from "@/lib/auth-utils";
import { IntForm } from "./form";

export default async function CreateUnit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const s = await requireSession();
  const userRole = s.user.role;
  console.log("User Role:", userRole);
  if (userRole !== "admin") {
    redirect("/units", RedirectType.replace);
  }
  return (
    <>
      <Suspense>
        <IntForm slug={params}></IntForm>
      </Suspense>
    </>
  );
}
