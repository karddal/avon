"use server";

import { fixtureRequest } from "@/scripts/util/fixture-api";

type CreateCourseworkRequest = {
  name: string;
  description: string;
  unit_id: string;
  due_date: string;
  colour: string;
};

export type CreatedCoursework = {
  id: string;
  name: string;
  description: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
};

export async function create_coursework(req: CreateCourseworkRequest) {
  return fixtureRequest<CreatedCoursework>("/testing/fixtures/courseworks", {
    body: JSON.stringify(req),
  });
}
