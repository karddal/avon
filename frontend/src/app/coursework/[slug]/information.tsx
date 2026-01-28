import { DropdownCard } from "@/components/dropdown-card";

type courseworkData = {
  id: string;
  name: string;
  description: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

function formatDateTimeString(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} at ${hours}:${minutes}`;
}

export default async function CourseworkInformation({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
    {
      headers: {
        Cookie: `access_token=${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch coursework");
  }

  const coursework: courseworkData = await res.json();

  const start_date = formatDateTimeString(coursework.creation_date);
  const end_date = formatDateTimeString(coursework.due_date);

  return (
    <DropdownCard
      title={"Information"}
      desc={"Important information about the coursework appears here."}
      openByDefault={true}
    >
      <p>
        <strong>Set date:</strong> {start_date}
      </p>
      <p>
        <strong>Due date:</strong> {end_date}
      </p>
    </DropdownCard>
  );
}
