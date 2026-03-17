"use server";

import { fixtureRequest } from "@/scripts/util/fixture-api";

type CreateProgrammeRequest = {
  name: string;
  start_date: string;
  end_date: string;
};

export type CreatedProgramme = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export async function create_programme(req: CreateProgrammeRequest) {
  return fixtureRequest<CreatedProgramme>("/testing/fixtures/programmes", {
    body: JSON.stringify(req),
  });
}
