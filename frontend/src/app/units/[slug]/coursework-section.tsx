import Coursework from "@/components/coursework";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default async function CourseworkSection({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}/courseworks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch courseworks");
  }

  const data = await response.json();
  const courseworks: courseworkData[] = Array.isArray(data.courseworks)
    ? data.courseworks
    : [];

  return (
    <>
      {courseworks.map((coursework) => (
        <Coursework key={coursework.id} props={coursework} />
      ))}
    </>
  );
}
