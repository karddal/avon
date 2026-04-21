import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function UnitDescription({ unit }: { unit: UnitData }) {
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
