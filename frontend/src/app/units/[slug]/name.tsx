"use cache";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
};

export default async function UnitName({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch unit");
  }

  const unit: UnitData = await response.json();

  return (
    <>
      <span className="font-light">COMS00000</span> {unit.name}
    </>
  );
}
