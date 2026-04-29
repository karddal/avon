import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    port: 4000,
  },
  env: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001",
    testFixtureKey: process.env.TEST_FIXTURE_KEY ?? "sep-test-fixture-key",
  },
  defaultCommandTimeout: 10000,
});
