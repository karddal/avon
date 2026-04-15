"use client";

import { ArrowRight, CalendarDays, CheckCircle, Circle, CircleDashed, Clock, ExternalLink, FolderGit2, GitCommitHorizontal, GitGraph, HeartHandshake, Info, Timer, ZapOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { courseworkModuleRegistry } from "@/components/modules/coursework_layout/coursework-module-registry";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { cn } from "@/lib/utils";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";
import type { CourseworkStudentRepo } from "@/lib/actions/coursework/get_my_coursework_repo";
import { CourseworkDeadlineBanner } from "@/components/coursework/coursework-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";


type CourseworkRendererProps = {
  layout: GridItem[];
  coursework: CourseworkSummary;
  canViewSetupProgress: boolean;
  canViewStudentRepos: boolean;
  repos: StudentNameAndRepo[];
  setupProgress: SetupProgressItem[];
  studentRepo: CourseworkStudentRepo | null;
};

type CourseworkSummary = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  due_date: string;
};

type SetupProgressItem = {
  title: string;
  completed: boolean;
};


const GRID_ROWS = 4;
const MD_COLUMNS = 2;

function getMdSpans(item: GridItem) {
  return {
    colSpan: Math.min(Math.max(item.w, 1), MD_COLUMNS),
    rowSpan: Math.min(Math.max(item.h, 1), 2),
  };
}

function canPlaceMdItem(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
) {
  if (col + colSpan > MD_COLUMNS) return false;

  for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex += 1) {
    const occupiedRow =
      occupied[rowIndex] ?? Array.from({ length: MD_COLUMNS }, () => false);

    for (let colIndex = col; colIndex < col + colSpan; colIndex += 1) {
      if (occupiedRow[colIndex]) {
        return false;
      }
    }
  }

  return true;
}

function markMdItem(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
) {
  for (let rowIndex = row; rowIndex < row + rowSpan; rowIndex += 1) {
    occupied[rowIndex] ??= Array.from({ length: MD_COLUMNS }, () => false);

    for (let colIndex = col; colIndex < col + colSpan; colIndex += 1) {
      occupied[rowIndex][colIndex] = true;
    }
  }
}

function getResponsiveMdLayout(layout: GridItem[]) {
  const occupied: boolean[][] = [];

  return layout.map((item, index) => {
    const preferred = getMdSpans(item);
    let row = 0;

    while (true) {
      for (let candidateCol = 0; candidateCol < MD_COLUMNS; candidateCol += 1) {
        if (
          canPlaceMdItem(
            occupied,
            row,
            candidateCol,
            preferred.colSpan,
            preferred.rowSpan,
          )
        ) {
          let colSpan = preferred.colSpan;

          if (
            candidateCol === 0 &&
            preferred.colSpan === 1 &&
            canPlaceMdItem(occupied, row, 0, MD_COLUMNS, preferred.rowSpan)
          ) {
            const nextItem = layout[index + 1];
            const nextColSpan = nextItem ? getMdSpans(nextItem).colSpan : null;

            if (!nextItem || nextColSpan === MD_COLUMNS) {
              colSpan = MD_COLUMNS;
            }
          }

          markMdItem(occupied, row, candidateCol, colSpan, preferred.rowSpan);

          return {
            ...item,
            colSpan,
            rowSpan: preferred.rowSpan,
          };
        }
      }

      row += 1;
    }

    throw new Error("Failed to place dashboard module in medium layout");
  });
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return {
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    day: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }),
  };
}

function DescriptionModule({ description }: { description: string }) {
  return (
    <Card className="h-full min-h-0 border-0 shadow-none">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row gap-2 items-center">
            <Info />
            Description
          </div>
          <div className="font-light">Information about the coursework.</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <div className="h-full overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-accent p-3">
          {description ? (
            description
          ) : (
            <span className="text-muted-foreground italic">
              No description available.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InformationModule({ coursework }: { coursework: CourseworkSummary }) {
  const start = formatDateTime(coursework.creation_date);
  const end = formatDateTime(coursework.due_date);

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="flex flex-col">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <CalendarDays />
            Information
          </div>
          <div className="font-light">Information about the coursework is shown below.</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-evenly gap-8 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" /> Set Date
            </span>
            <div className="flex flex-col">
              <h2 className="text-4xl font-mono font-black tracking-tighter tabular-nums">{start.time}</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">{start.day}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
              <Timer className="w-3 h-3" /> Due Date
            </span>
            <div className="flex flex-col">
              <h2 className="text-4xl font-mono font-black tracking-tighter tabular-nums text-destructive">{end.time}</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">{end.day}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RepoOverviewModule({ repos }: { repos: StudentNameAndRepo[] }) {
  const sorted = [...repos].sort((a, b) => a.student.localeCompare(b.student));

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <FolderGit2 />
            Student Repositories
          </div>
          <div className="font-light">A quick overview of provisioned GitLab repos for this coursework.</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        {sorted.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sorted.map((repo) => (
              <div key={`${repo.student}-${repo.repo_url}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{repo.student}</div>
                  <div className="truncate text-xs text-muted-foreground">{repo.repo_url}</div>
                </div>
                <a href={repo.repo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-sm h-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                  <FolderGit2 />
                </EmptyMedia>
                <EmptyTitle>No student repositories.</EmptyTitle>
                <EmptyDescription>There are no student repositories yet.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SetupProgressModule({ steps }: { steps: SetupProgressItem[] }) {
  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="flex flex-col">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <CircleDashed />
            Setup Progress
          </div>
          <div className="font-light">View the progress in setting up the coursework.</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center w-full">
              {step.completed ? (
                <div className="flex w-full items-center justify-between rounded-xl border border-green-500/30 bg-green-500/5 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">{step.title}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 ml-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{step.title}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ml-3">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
              {steps.length - 1 > index && (
                <div className="flex items-center px-3 py-3 md:py-0">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentRepoOverviewModule({ studentRepo }: { studentRepo: CourseworkStudentRepo | null }) {
  if (!studentRepo) {
    return (
      <div className="border border-dashed p-4 text-sm h-full">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <ZapOff />
            </EmptyMedia>
            <EmptyTitle>No data.</EmptyTitle>
            <EmptyDescription>We do not have a repository on file for you yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const commitCount = studentRepo.total_commits;
  const linesChanged = studentRepo.commits.reduce(
    (total, commit) => total + commit.additions + commit.deletions,
    0,
  );

  return (
    <div className="space-y-3 p-2">
      <a href={studentRepo.repo_url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-between gap-3 rounded-md border bg-accent/40 px-4 py-3 transition-colors hover:bg-accent">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{studentRepo.repo_url}</div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0" />
      </a>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border p-4">
          <div className="text-xs">Number of Commits</div>
          <div className="text-3xl font-semibold">{commitCount}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-xs">Lines Changed</div>
          <div className="text-3xl font-semibold">{linesChanged}</div>
        </div>
      </div>
    </div>
  );
}

function StudentRepoActivityModule({ studentRepo }: { studentRepo: CourseworkStudentRepo | null }) {
  if (!studentRepo) {
    return (
      <div className="border border-dashed p-4 text-sm h-full">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <GitGraph />
            </EmptyMedia>
            <EmptyTitle>No coursework repository provisioned.</EmptyTitle>
            <EmptyDescription>No data is available yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center space-y-2 p-2">
      {studentRepo.commits.length > 0 ? (
        studentRepo.commits.slice(0, 3).map((commit) => (
          <a key={commit.id} href={commit.web_url ?? studentRepo.repo_url} target="_blank" rel="noreferrer" className="block rounded-md border px-3 py-2 transition-colors hover:bg-accent/40">
            <div className="flex items-center gap-3">
              <GitCommitHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium leading-5">{commit.title}</div>
                <div className="text-xs text-muted-foreground">{commit.short_id} · {commit.author_name ?? "Unknown"}</div>
              </div>
            </div>
          </a>
        ))
      ) : (
        <div className="rounded-md border border-dashed p-4 text-sm h-full">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <GitCommitHorizontal />
              </EmptyMedia>
              <EmptyTitle>No commits.</EmptyTitle>
              <EmptyDescription>No default-branch commits found yet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
}

function StudentPanelModule() {
  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <HeartHandshake />
            Getting Started
          </div>
          <div className="font-light">A short checklist for working on this coursework.</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 text-sm space-y-1 text-muted-foreground">
          <li>Find your coursework repository and clone it.</li>
          <li>Commit regularly in small, clear commits.</li>
          <li>Leave time for final testing before the deadline.</li>
        </ul>
      </CardContent>
    </Card>
  );
}

export default function CourseworkRenderer({
  layout,
  coursework,
  canViewSetupProgress,
  canViewStudentRepos,
  repos,
  setupProgress,
  studentRepo,
}: CourseworkRendererProps) {
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateLayoutMode = () => {
      setIsDesktopLayout(mediaQuery.matches);
    };

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);

    return () => {
      mediaQuery.removeEventListener("change", updateLayoutMode);
    };
  }, []);

  const orderedLayout = [...layout].sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y;
    }

    return left.x - right.x;
  });

  const mdLayout = getResponsiveMdLayout(orderedLayout);
  const sortedRepos = useMemo(
    () => [...repos].sort((a, b) => a.student.localeCompare(b.student)),
    [repos],
  );

  const start = formatDateTime(coursework.creation_date);
  const end = formatDateTime(coursework.due_date);

  const moduleContent: Record<GridItem["moduleKey"], React.ReactNode> = {
    description: <DescriptionModule description={coursework.description} />,
    information: <InformationModule coursework={coursework} />,
    deadline_banner: (
      <div className="p-3">
        <CourseworkDeadlineBanner deadline={coursework.due_date} warningThreshold={7} />
        <div className="mt-2 text-xs text-muted-foreground">Created: {start.day} {start.time} · Due: {end.day} {end.time}</div>
      </div>
    ),
    repo_overview: canViewStudentRepos ? (
      <RepoOverviewModule repos={sortedRepos} />
    ) : (
      <div className="p-4 text-sm text-muted-foreground">Repository overview is available to staff only.</div>
    ),
    student_repo_overview: <StudentRepoOverviewModule studentRepo={studentRepo} />,
    setup_progress: canViewSetupProgress ? (
      <SetupProgressModule steps={setupProgress} />
    ) : (
      <div className="p-4 text-sm text-muted-foreground">Setup progress is available to staff only.</div>
    ),
    student_repo_activity: <StudentRepoActivityModule studentRepo={studentRepo} />,
    student_panel: <StudentPanelModule />,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="grid w-full grid-cols-1 auto-rows-[minmax(140px,auto)] gap-3 sm:gap-4 sm:p-4 md:grid-flow-dense md:grid-cols-2 lg:h-full lg:flex-1 lg:grid-cols-10 lg:auto-rows-auto"
        style={
          isDesktopLayout
            ? {
                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
        {orderedLayout.length === 0 ? (
          <div className="col-span-full flex min-h-55 items-center justify-center border border-dashed bg-background px-4 text-center text-sm text-muted-foreground lg:row-span-3">
            No modules placed yet.
          </div>
        ) : null}

        {orderedLayout.map((item) => {
          const mdItem = mdLayout.find((entry) => entry.id === item.id);

          return (
            <div
              key={item.id}
              className={cn(
                "min-h-35 overflow-hidden border bg-background md:min-h-45 lg:min-h-0",
                mdItem?.colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
                mdItem?.rowSpan === 2 ? "md:row-span-2" : "md:row-span-1",
              )}
              style={
                isDesktopLayout
                  ? {
                      gridColumn: `${item.x + 1} / span ${item.w}`,
                      gridRow: `${item.y + 1} / span ${item.h}`,
                    }
                  : undefined
              }
            >
              <div className="h-full min-h-0 overflow-visible lg:overflow-auto">
                {moduleContent[item.moduleKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
