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

export default async function CourseworkName({
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
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch coursework");
  }

  const coursework: courseworkData = await res.json();

  return (
    <>
      <span className="font-light">{coursework.code}</span> {coursework.name}
    </>
  );
}
