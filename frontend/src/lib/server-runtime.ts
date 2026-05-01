import { existsSync } from "node:fs";
import path from "node:path";

type AppEnv = "development" | "test" | "production";

const APP_ENV_ALIASES: Record<string, AppEnv> = {
  dev: "development",
  development: "development",
  test: "test",
  e2e: "test",
  prod: "production",
  production: "production",
};

export function getAppEnv(): AppEnv {
  const rawEnv = process.env.APP_ENV;
  if (rawEnv) {
    return APP_ENV_ALIASES[rawEnv.toLowerCase()] ?? "development";
  }

  if (process.env.BA_DATABASE_URL) {
    return "production";
  }

  return "development";
}

export function isTestAppEnv(): boolean {
  return getAppEnv() === "test";
}

export function shouldUseExternalDatabase(): boolean {
  return getAppEnv() === "production" && Boolean(process.env.BA_DATABASE_URL);
}

export function getSqliteDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }

  const candidates = [
    path.resolve(process.cwd(), "../sqlite.db"),
    path.resolve(process.cwd(), "../../sqlite.db"),
    path.resolve(process.cwd(), "../../../sqlite.db"),
    path.resolve(process.cwd(), "sqlite.db"),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
