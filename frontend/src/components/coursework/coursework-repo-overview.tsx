"use client";

import { ExternalLink, FolderGit2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";

export default function CourseworkRepoOverview({
  repos,
  totalStudentGroups,
}: {
  repos: StudentNameAndRepo[];
  totalStudentGroups: number;
}) {
  const sortedRepos = [...repos].sort((a, b) =>
    a.student.localeCompare(b.student),
  );
  const unprovisionedRepos = Math.max(totalStudentGroups - repos.length, 0);
  const gitlabGroupUrl =
    sortedRepos.length > 0
      ? getGitLabGroupUrl(sortedRepos[0].repo_url)
      : undefined;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <FolderGit2 />
            Student Repositories
          </div>
          <div className="font-light">
            A quick overview of provisioned GitLab repos for this coursework.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col justify-center">
        <div
          className={`flex min-h-32 flex-col justify-center rounded-xl border p-5 shadow-sm ${
            repos.length > 0
              ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
              : "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
          }`}
        >
          <div
            className={`mb-1 flex items-center gap-2 text-xs ${
              repos.length > 0
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            <Users className="h-4 w-4" />
            Current State
          </div>
          <div className="text-base font-semibold">
            {repos.length > 0
              ? `${repos.length} repos available`
              : "Not provisioned yet"}
          </div>
          <p
            className={`mt-1 text-xs ${
              repos.length > 0
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {repos.length > 0
              ? "Manage student repos from the coursework actions menu."
              : "Provision the coursework on GitLab to generate student repositories."}
          </p>
        </div>
        <div className="mt-3 grid gap-2 rounded-md border bg-accent/30 px-3 py-2 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Provisioned
            </div>
            <div className="text-lg font-semibold text-foreground">
              {repos.length}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Unprovisioned
            </div>
            <div className="text-lg font-semibold text-foreground">
              {unprovisionedRepos}
            </div>
          </div>
          {gitlabGroupUrl ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-self-start md:justify-self-end"
            >
              <Link
                href={gitlabGroupUrl}
                target="_blank"
                rel="noreferrer"
                prefetch={false}
              >
                <ExternalLink />
                GitLab
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start md:justify-self-end"
              disabled
            >
              <ExternalLink />
              GitLab
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getGitLabGroupUrl(repoUrl: string) {
  const normalizedUrl = repoUrl.replace(/\.git$/, "");
  const lastSlashIndex = normalizedUrl.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return normalizedUrl;
  }

  return normalizedUrl.slice(0, lastSlashIndex);
}
