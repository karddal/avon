import { spawn } from "node:child_process";
import path from "node:path";

const backendDir = path.resolve(process.cwd(), "../backend");

const backend = spawn("uv", ["run", "fastapi", "dev"], {
  cwd: backendDir,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: "sqlite:///../sqlite.e2e.db",
    CORS_ORIGIN: '["http://localhost:3000"]',
    JWKS_URL: "http://localhost:3000/api/auth/jwks",
    JWT_AUDIENCE: "https://localhost:3000",
    JWT_ISSUER: "https://localhost:3000",
      GITLAB_BASE_URL: "https://gitlab.com/api/v4",
      GITLAB_API_TOKEN: "$GITLAB_API_TOKEN",
    GITLAB_ROOT_ID: "124674879",
      IGNORE_AUTH: "True",
      TESTING_MODE: "True",
  },
});

backend.on("exit", (code) => process.exit(code ?? 1));
