"use client";

import {Copy, ExternalLink, FolderGit, FolderGit2, Users} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  get_student_repos,
  type StudentNameAndRepo,
} from "@/lib/actions/get_student_repos";

export default function CourseworkRepoOverview({
  courseworkId,
}: {
  courseworkId: string;
}) {
  const [repos, setRepos] = useState<StudentNameAndRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRepos() {
      try {
        const data = await get_student_repos({ coursework_id: courseworkId });
        if (mounted) {
          setRepos(data.repos);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRepos();

    return () => {
      mounted = false;
    };
  }, [courseworkId]);

  const sorted = repos.sort((a, b) => a.student.localeCompare(b.student));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2"><FolderGit2/>Student Repositories</div>
          <div className="font-light">
            A quick overview of provisioned GitLab repos for this coursework.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-accent/40 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <FolderGit className="h-4 w-4" />
                  Provisioned Repos
                </div>
                <div className="text-2xl font-semibold">{repos.length}</div>
              </div>
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
                    ? "Sample student repos are listed below."
                    : "Provision the coursework on GitLab to generate student repositories."}
                </p>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col space-y-2">
              <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Repository Preview
              </div>
              {sorted.length > 0 ? (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {sorted.map((repo) => (
                    <div
                      key={`${repo.student}-${repo.repo_url}`}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {repo.student}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {repo.repo_url}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(repo.repo_url);
                            toast.success("Repo URL copied");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={repo.repo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                  No student repositories found yet.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
