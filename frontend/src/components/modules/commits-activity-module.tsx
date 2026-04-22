"use client";

import { Activity, FolderGit } from "lucide-react";
import CourseworkCommitListItem from "@/components/coursework/coursework-commit-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
const dummyCommits = [
  {
    repo_id: "repo-alpha",
    repo_url: "https://gitlab.example.com/coursework/team-alpha",
    repo_name: "team-alpha",
    coursework_name: "Software Engineering Project",
    commit: {
      id: "c1",
      short_id: "8ad21f4",
      title: "Add live validation for repo import flow",
      author_name: "Jack Wong",
      authored_label: "22 Apr 26, 10:14",
      additions: 48,
      deletions: 6,
    },
  },
  {
    repo_id: "repo-beta",
    repo_url: "https://gitlab.example.com/coursework/team-beta",
    repo_name: "team-beta",
    coursework_name: "Programming Languages and Computation",
    commit: {
      id: "c2",
      short_id: "b31c9a2",
      title: "Refactor parser branch handling",
      author_name: "Rohan Booth",
      authored_label: "22 Apr 26, 09:52",
      additions: 17,
      deletions: 19,
    },
  },
  {
    repo_id: "repo-gamma",
    repo_url: "https://gitlab.example.com/coursework/team-gamma",
    repo_name: "team-gamma",
    coursework_name: "Computer Systems A",
    commit: {
      id: "c3",
      short_id: "f07e52d",
      title: "Tidy cache simulator metrics output",
      author_name: "Josh Carter",
      authored_label: "22 Apr 26, 09:21",
      additions: 12,
      deletions: 12,
    },
  },
  {
    repo_id: "repo-delta",
    repo_url: "https://gitlab.example.com/coursework/team-delta",
    repo_name: "team-delta",
    coursework_name: "Power to the People in 2025",
    commit: {
      id: "c4",
      short_id: "19ed0ab",
      title: "Fix edge case in tariff calculation",
      author_name: "Charles Price",
      authored_label: "22 Apr 26, 08:46",
      additions: 25,
      deletions: 4,
    },
  },
] satisfies Array<{
  repo_id: string;
  repo_url: string;
  repo_name: string;
  coursework_name: string;
  commit: {
    id: string;
    short_id: string;
    title: string;
    author_name: string;
    authored_label: string;
    additions: number;
    deletions: number;
  };
}>;

export default function AnalyticsActivityModule() {
  const commits = dummyCommits;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <div className="flex flex-row items-center gap-2 text-2xl">
                <Activity />
                Commits Activity
              </div>
              <div className="font-light">
                Dummy commit activity for the analytics layout preview.
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        {commits.length === 0 ? (
          <div className="h-full rounded-md border border-dashed p-4 text-sm">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderGit />
                </EmptyMedia>
                <EmptyTitle>No commits yet.</EmptyTitle>
                <EmptyDescription>
                  Dummy commits will appear here once added.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : null}

        {commits.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-auto">
            {commits.map((item, index) => (
              <CourseworkCommitListItem
                key={`${item.repo_id}-${item.commit.id}`}
                href={item.repo_url}
                title={item.commit.title}
                shortId={item.commit.short_id}
                authorName={item.commit.author_name ?? "Unknown"}
                authoredLabel={item.commit.authored_label}
                secondaryMeta={
                  <>
                    <span className="font-medium text-foreground">
                      {item.coursework_name}
                    </span>{" "}
                    / {item.repo_name}
                  </>
                }
                additions={item.commit.additions}
                deletions={item.commit.deletions}
                highlighted={index === 0}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
