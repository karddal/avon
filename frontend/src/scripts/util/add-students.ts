"use server";

import { fixtureRequest } from "@/scripts/util/fixture-api";

type BatchEnrollmentResponse = {
  count: number;
};

export async function seed_batch_add_students_to_unit(
  unit_id: string,
  users: string[],
) {
  return fixtureRequest<BatchEnrollmentResponse>(
    "/testing/fixtures/unit-enrollments/students",
    {
      body: JSON.stringify({
        unit_id: unit_id,
        user_ids: users,
      }),
    },
  );
}

export async function seed_batch_add_lecturers_to_unit(
  unit_id: string,
  users: string[],
) {
  return fixtureRequest<BatchEnrollmentResponse>(
    "/testing/fixtures/unit-enrollments/lecturers",
    {
      body: JSON.stringify({
        unit_id: unit_id,
        user_ids: users,
      }),
    },
  );
}
