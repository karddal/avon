import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";
import type { ReactNode } from "react";

type CourseworkCommitListItemProps = {
  href: string;
  title: string;
  shortId: string;
  authorName: string;
  authoredLabel: string;
  additions: number;
  deletions: number;
  highlighted?: boolean;
  eyebrow?: ReactNode;
  secondaryMeta?: ReactNode;
};

function getCommitTone(additions: number, deletions: number) {
  if (additions > deletions && additions > 0) {
    return {
      hover: "hover:border-emerald-300 dark:hover:border-emerald-800",
      icon:
        "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      badge:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    };
  }

  if (deletions > additions && deletions > 0) {
    return {
      hover: "hover:border-red-300 dark:hover:border-red-800",
      icon:
        "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300",
      badge:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    };
  }

  return {
    hover: "hover:border-sky-300 dark:hover:border-sky-800",
    icon:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  };
}

export default function CourseworkCommitListItem({
  href,
  title,
  shortId,
  authorName,
  authoredLabel,
  additions,
  deletions,
  highlighted = false,
  eyebrow,
  secondaryMeta,
}: CourseworkCommitListItemProps) {
  const tone = getCommitTone(additions, deletions);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group block rounded-xl border px-3 py-3 transition-all ${tone.hover} ${
        highlighted
          ? "bg-background shadow-sm hover:bg-accent/30"
          : "bg-background hover:bg-accent/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone.icon}`}
        >
          <GitCommitHorizontal className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {eyebrow ? <div>{eyebrow}</div> : null}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-5">
                {title}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`rounded-full border px-2 py-0.5 font-medium ${tone.badge}`}
                >
                  {shortId}
                </span>
                <span>{authorName}</span>
                <span>{authoredLabel}</span>
              </div>
              {secondaryMeta ? (
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {secondaryMeta}
                </div>
              ) : null}
            </div>

            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-center pt-1 text-xs font-medium">
          <span className="text-green-600">+{additions}</span>
          <span className="text-red-600">-{deletions}</span>
        </div>
      </div>
    </a>
  );
}
