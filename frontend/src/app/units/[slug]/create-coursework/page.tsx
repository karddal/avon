import { Suspense } from "react";
import { IntForm } from "@/app/units/[slug]/create-coursework/form";
// import { IntForm } from "./form";
import { getRequestJWT } from "@/lib/auth-utils";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  start_date: string;
  end_date: string;
};

async function Actual({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const s = p.slug;

  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${s}/with_dates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const unit: UnitData = await response.json();
  const end = new Date(unit.end_date);
  return (
    <IntForm
      slug={s}
      unitCode={unit.unit_code}
      unitName={unit.name}
      unitId={unit.id}
      maxDueDate={end}
    ></IntForm>
  );
}

export default async function CreateCourseworkFlow({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense>
      <Actual params={params}></Actual>
    </Suspense>
  );
}
