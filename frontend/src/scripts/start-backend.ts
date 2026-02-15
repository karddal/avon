import { spawn } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

const backendDir = path.resolve(process.cwd(), "../backend");

dotenv.config({
  path: path.join(backendDir, ".env.dev"),
});

const backend = spawn("uv", ["run", "fastapi", "dev"], {
  cwd: backendDir,
  stdio: "inherit",
  env: {
    ...process.env,
    IGNORE_AUTH: "True",
    TESTING_MODE: "True",
  },
});

backend.on("exit", (code) => process.exit(code ?? 1));
