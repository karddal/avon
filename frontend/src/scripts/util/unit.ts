"use server";

import { fixtureRequest } from "@/scripts/util/fixture-api";

type CreateUnitRequest = {
  name: string;
  description: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  owner: string;
  unlocked: boolean | null;
};

export type CreatedUnit = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
};

export async function create_unit(req: CreateUnitRequest) {
  return fixtureRequest<CreatedUnit>("/testing/fixtures/units", {
    body: JSON.stringify(req),
  });
}
