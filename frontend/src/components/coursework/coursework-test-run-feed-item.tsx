"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleDotDashed,
  Clock3,
  FlaskConical,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import TestRunComponent from "@/components/coursework/test-run/TestRun";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CourseworkTestRunFeedItemProps = {
  courseworkId: string;
  testRunId: string;
  title: string;
  courseworkName: string;
  repoLabel: string;
  startedLabel: string;
  status: "pending" | "running" | "succeeded" | "failed" | "error";
  triggerLabel: string;
  studentCount: number;
  studentLabel?: string;
};

function getStatusTone(status: CourseworkTestRunFeedItemProps["status"]) {
  switch (status) {
    case "succeeded":
      return {
        hover: "hover:border-emerald-300 dark:hover:border-emerald-800",
        icon:
          "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
        pill:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    case "failed":
    case "error":
      return {
        hover: "hover:border-red-300 dark:hover:border-red-800",
        icon:
          "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300",
        pill:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        text: "text-red-600 dark:text-red-400",
      };
    case "running":
      return {
        hover: "hover:border-zinc-300 dark:hover:border-zinc-700",
        icon:
          "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300",
        pill:
          "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950/40 dark:text-zinc-300",
        text: "text-zinc-700 dark:text-zinc-300",
      };
    case "pending":
    default:
      return {
        hover: "hover:border-slate-300 dark:hover:border-slate-700",
        icon:
          "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
        pill:
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-900 dark:bg-slate-950/40 dark:text-slate-300",
        text: "text-slate-700 dark:text-slate-300",
      };
  }
}

function getStatusIcon(status: CourseworkTestRunFeedItemProps["status"]) {
  switch (status) {
    case "succeeded":
      return CheckCircle2;
    case "failed":
    case "error":
      return XCircle;
    case "running":
      return CircleDotDashed;
    case "pending":
    default:
      return Clock3;
  }
}

function formatStatusLabel(status: CourseworkTestRunFeedItemProps["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

export default function CourseworkTestRunFeedItem({
  courseworkId,
  testRunId,
  title,
  courseworkName,
  repoLabel,
  startedLabel,
  status,
  triggerLabel,
  studentCount,
  studentLabel,
}: CourseworkTestRunFeedItemProps) {
  const [open, setOpen] = useState(false);
  const tone = getStatusTone(status);
  const StatusIcon = getStatusIcon(status);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`group relative block w-full rounded-xl border px-3 py-3 text-left transition-all ${tone.hover} bg-background hover:bg-accent/30`}
        >
          <ArrowUpRight className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone.icon}`}
            >
              <StatusIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold leading-5">
                    {title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-medium ${tone.pill}`}
                    >
                      {formatStatusLabel(status)}
                    </span>
                    <span>{startedLabel}</span>
                    <span>{triggerLabel}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {courseworkName}
                    </span>{" "}
                    {repoLabel}
                    {/* {studentLabel ? <span> | {studentLabel}</span> : null} */}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-center pt-1 text-xs font-medium">
              <span className={tone.text}>
                {studentCount} student{studentCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-full! lg:max-w-[75%]! w-full max-h-[90vh] xs:max-h-screen overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Test run
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <TestRunComponent
            key={testRunId}
            test_run_id={testRunId}
            coursework_id={courseworkId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
