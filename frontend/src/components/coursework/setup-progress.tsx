import SetupProgressCarousel, {
  type SetupProgressArea,
} from "@/components/coursework/setup-progress-carousel";
import { fetch_test_runs } from "@/lib/actions/coursework/coursework-fetch-test-runs";
import { get_all_students_with_maybe_repos } from "@/lib/actions/coursework/get_all_students_on_unit_with_repos";
import { get_cw_update_data } from "@/lib/actions/coursework/get_coursework_update_data";
import { get_cw_engine_data } from "@/lib/actions/coursework/get_cw_engine_data";

interface SetupProgressProps {
  cw_id: string;
}

function getDefaultAreaIndex(areas: SetupProgressArea[]) {
  const actionableIndex = areas.findIndex((area) => area.status === "action");
  if (actionableIndex !== -1) {
    return actionableIndex;
  }

  const readyIndex = areas.findIndex((area) => area.status === "ready");
  if (readyIndex !== -1) {
    return readyIndex;
  }

  return Math.max(areas.length - 1, 0);
}

export default async function SetupProgress({ cw_id }: SetupProgressProps) {
  const [coursework, engineData, studentsWithRepos, testRuns] =
    await Promise.all([
      get_cw_update_data(cw_id),
      get_cw_engine_data({ coursework_id: cw_id }),
      get_all_students_with_maybe_repos({ coursework_id: cw_id }),
      fetch_test_runs(cw_id).catch(() => []),
    ]);

  const templateConfigured = Boolean(coursework.templateId);
  const reposProvisioned = studentsWithRepos.some((student) => student.repo_id);
  const engineConfigured = Boolean(
    engineData.base_image_id && engineData.tester_command,
  );
  const hasTestRuns = testRuns.length > 0;

  const areas: SetupProgressArea[] = [
    {
      title: "Template Repository",
      status: templateConfigured ? "complete" : "action",
      description: templateConfigured
        ? "The coursework has a repo template configured and can provision student repositories."
        : "Choose or create the template repository before provisioning student repos.",
      detail: "Needed for provisioning student repositories.",
    },
    {
      title: "Student Repositories",
      status: reposProvisioned
        ? "complete"
        : templateConfigured
          ? "action"
          : "blocked",
      description: reposProvisioned
        ? "Student repositories have been provisioned for this coursework."
        : templateConfigured
          ? "The coursework is ready to provision student repositories."
          : "Provisioning stays blocked until a template repository is configured.",
      detail: templateConfigured
        ? "Depends on: template repository."
        : "Blocked by: missing template repository.",
    },
    {
      title: "Testing Engine",
      status: engineConfigured ? "complete" : "action",
      description: engineConfigured
        ? "A base image and tester command are configured for automated testing."
        : "Configure the Avon engine if you want to run automated test batches.",
      detail: "Independent from GitLab setup, but required for test batches.",
    },
    {
      title: "Test Batches",
      status: hasTestRuns
        ? "complete"
        : reposProvisioned && engineConfigured
          ? "ready"
          : "blocked",
      description: hasTestRuns
        ? "At least one test batch has been started for this coursework."
        : reposProvisioned && engineConfigured
          ? "The coursework is ready to run its first test batch."
          : "Test batches need both provisioned repos and a configured engine.",
      detail:
        "Depends on: student repositories plus testing engine. Not required to manage repos.",
    },
    {
      title: "Manage Student Repositories",
      status: reposProvisioned ? "ready" : "blocked",
      description: reposProvisioned
        ? "You can manage teams, invitations, and repository membership now."
        : "Repo management becomes available after repositories have been provisioned.",
      detail: reposProvisioned
        ? "Useful for team changes and invite management."
        : "Blocked by: no student repositories yet.",
    },
  ];

  return (
    <SetupProgressCarousel
      areas={areas}
      defaultIndex={getDefaultAreaIndex(areas)}
    />
  );
}
