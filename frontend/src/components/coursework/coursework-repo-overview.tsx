"use client";

import { FolderGit, FolderGit2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";

export default function CourseworkRepoOverview({
  repos,
  invitedStudentsCount,
  inviteableStudentsCount,
}: {
  repos: StudentNameAndRepo[];
  invitedStudentsCount: number;
  inviteableStudentsCount: number;
}) {
  const _sorted = [...repos].sort((a, b) => a.student.localeCompare(b.student));

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
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-accent/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <FolderGit className="h-4 w-4" />
              Provisioned Repos
            </div>
            <div className="text-2xl font-semibold">{repos.length}</div>
          </div>
          <div className="rounded-md border bg-accent/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              Invited Students
            </div>
            <div className="text-2xl font-semibold">
              {invitedStudentsCount}/{inviteableStudentsCount}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <div
            className={`rounded-md border p-3 ${
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
              {repos.length > 0 ? "Repos available" : "Not provisioned yet"}
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
        </div>
      </CardContent>
    </Card>
  );
}
