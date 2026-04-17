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

export default async function CourseworkDescription({
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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch unit");
  }
  const coursework: courseworkData = await res.json();

  return (
    <div
      data-cy="coursework-description-content"
      className="h-full overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-accent p-3"
    >
      {coursework.description ? (
        coursework.description
      ) : (
        <span className="text-muted-foreground italic">
          No description available.
        </span>
      )}
    </div>
  );
}
