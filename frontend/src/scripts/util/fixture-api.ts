"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

function getFixtureKey(): string {
  const key = process.env.TEST_FIXTURE_KEY;
  if (!key) {
    throw new Error("TEST_FIXTURE_KEY must be set for test fixture requests");
  }

  return key;
}

type FixtureInit = {
  method?: string;
  body?: string;
};

export async function fixtureRequest<TResponse>(
  path: string,
  init: FixtureInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "POST",
    cache: "no-cache",
    body: init.body,
    headers: {
      "Content-Type": "application/json",
      "X-Test-Fixture-Key": getFixtureKey(),
    },
  });

  if (!response.ok) {
    let detail = response.statusText;

    try {
      const json = await response.json();
      detail =
        typeof json.detail === "string" ? json.detail : JSON.stringify(json);
    } catch {
      detail = await response.text();
    }

    throw new Error(`Fixture request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
