import {getRequestJWT} from "@/lib/auth-utils";
import {get_username_from_id} from "@/lib/actions/auth/get_username";

enum TestRunStatus {
    Pending,
    Running,
    Succeeded,
    Failed,
    Error
}

type StudentNameAndId = {
    id: string;
    name: string;
}

export type TestRun = {
    id: string;
    batch_id: string;
    gitlab_repo_id: string;
    gitlab_repo_url: string;
    students: StudentNameAndId[];
    status: TestRunStatus;
    started: Date;
}

type ServerTestRunInfo = {
    id: string;
    batch_id: string;
    gitlab_repo_id: string;
    gitlab_repo_url: string;
    student_ids: string[];
    status: TestRunStatus;
    started: string;
}

type ServerSuccessResponse = {
    test_runs: ServerTestRunInfo[];
}

type ServerErrorResponse = {
    detail: string;
}

export async function fetch_test_runs(coursework_id: string): Promise<TestRun[]> {
    const token = await getRequestJWT();

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coursework/${coursework_id}/test_runs`,
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
        throw new Error(`failed to fetch test runs: ${(data as ServerErrorResponse).detail}`)
    } else {
        // Now look up all students ids for names in betterauth db
        // and put them into a response that we can use!

        const runs = (data as ServerSuccessResponse).test_runs
        let output: TestRun[] = []

        for (const run of runs) {

            let students: StudentNameAndId[] = [];
            for (const student_id of run.student_ids) {
                const name = await get_username_from_id(student_id);
                students.push({name: name, id: student_id});
            }

            output.push(
                {
                    id: run.id,
                    batch_id: run.batch_id,
                    gitlab_repo_id: run.gitlab_repo_id,
                    gitlab_repo_url: run.gitlab_repo_url,
                    status: run.status,
                    students: students,
                    started: new Date(run.started),
                }
            )
        }

        return output;
    }
}