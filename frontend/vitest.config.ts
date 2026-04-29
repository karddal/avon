import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	test: {
		coverage: {
			include: [
				"src/app/api/health/route.ts",
				"src/lib/analytics-layout.ts",
				"src/lib/coursework-layout.ts",
				"src/lib/date-format.ts",
				"src/lib/server-runtime.ts",
				"src/components/units/unit_utils.ts",
			],
			reporter: ["text", "json-summary", "lcov"],
			reportsDirectory: "coverage/unit",
		},
		include: ["src/**/*.test.ts"],
	},
});
