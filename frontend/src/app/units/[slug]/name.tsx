type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
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
      cache: "no-cache",
    },
  );

  const unit: UnitData = await response.json();

  return (
    <div className="text-3xl lg:text-5xl">
      <span className="font-mono font-light">{unit.unit_code}</span> {unit.name}
    </div>
  );
}
