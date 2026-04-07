import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
};

export default async function UnitDescription({
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
    },
  );

  const unit: UnitData = await response.json();

  return (
  <div className="flex flex-col overflow-y-auto wrap-break-word h-32 border bg-accent p-2">
    {unit.description ? (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {unit.description}
        </ReactMarkdown>
      </div>
    ) : (
      <span className="text-muted-foreground italic">
        No description available.
      </span>
    )}
  </div>
);
}
