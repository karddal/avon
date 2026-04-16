import { get_username_from_id } from "@/lib/actions/auth/get_username";
import { getRequestJWT } from "@/lib/auth-utils";

export type TestRunStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "error";
export type Trigger = "initial" | "retry" | "manual_rerun";

type TestRunFullServerDetails = {
  id: string;
  coursework_id: string;
  ecs_task_arn: string | null;
  gitlab_repo_id: string;
  git_url: string;
  task_def: string;
  tester_command: string;
  status: TestRunStatus;
  completed_at: string;
  trigger: Trigger;
  created_at: string;
  notifications_enabled: boolean;
  started_by: string;
  batch_id: string;
  tester_exit_code: number | null;
  log_name: string | null;
  log_text: string | null;
};

type ServerFailedResponse = {
  detail: string;
};

export type TestRunFullDetails = {
  id: string;
  coursework_id: string;
  ecs_task_arn: string | null;
  gitlab_repo_id: string;
  git_url: string;
  task_def: string;
  tester_command: string;
  status: TestRunStatus;
  completed_at: Date | null;
  trigger: Trigger;
  created_at: Date;
  notifications_enabled: boolean;
  started_by_name: string;
  started_by_id: string;
  batch_id: string;
  tester_exit_code: number | null;
  log_name: string | null;
  log_text: string | null;
};

export async function get_test_run_for_cw({
  run_id,
  cw_id,
}: {
  run_id: string;
  cw_id: string;
}): Promise<TestRunFullDetails> {
  const token = await getRequestJWT();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${cw_id}/test_run/${run_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Failed to fetch test run data: ${(data as ServerFailedResponse).detail}`,
    );
  } else {
    // look up the started by name
    const tr = data as TestRunFullServerDetails;
    const name = await get_username_from_id(tr.started_by);
    return {
      batch_id: tr.batch_id,
      completed_at: new Date(`${tr.completed_at}Z`),
      coursework_id: tr.coursework_id,
      created_at: new Date(`${tr.created_at}Z`),
      ecs_task_arn: tr.ecs_task_arn,
      git_url: tr.git_url,
      gitlab_repo_id: tr.gitlab_repo_id,
      id: tr.id,
      notifications_enabled: tr.notifications_enabled,
      started_by_id: tr.started_by,
      started_by_name: name,
      status: tr.status,
      task_def: tr.task_def,
      tester_command: tr.tester_command,
      trigger: tr.trigger,
      tester_exit_code: tr.tester_exit_code,
      log_name: tr.log_name,
      log_text: tr.log_text,
    };
  }
}
