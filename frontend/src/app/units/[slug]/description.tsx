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
    <div className="h-full min-h-0 overflow-y-auto wrap-break-word border bg-accent p-3">
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
