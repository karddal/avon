import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EXIT_CODE_ERROR = 1;
const EXIT_CODE_SIGINT = 130;
const EXIT_CODE_SIGTERM = 143;
const WINDOWS_KILL_WAIT_MS = 1_000;

type ManagedProcess = {
  readonly child: ChildProcess;
  readonly name: string;
  readonly exitPromise: Promise<void>;
  exited: boolean;
  exitCode: number | null;
  exitSignal: NodeJS.Signals | null;
};

type RuntimeConfig = {
  readonly platform: {
    readonly isWindows: boolean;
    readonly pollIntervalMs: number;
    readonly shutdownTimeoutMs: number;
    readonly startupTimeoutMs: number;
  };
  readonly network: {
    readonly backendHealthUrl: string;
    readonly backendHost: string;
    readonly backendOrigin: string;
    readonly backendPort: string;
    readonly frontendHost: string;
    readonly frontendOrigin: string;
    readonly frontendPort: string;
    readonly frontendUrl: string;
  };
  readonly paths: {
    readonly backendDir: string;
    readonly backendPython: string;
    readonly cypressBin: string;
    readonly frontendDir: string;
    readonly frontendServer: string;
  };
  readonly env: {
    readonly backend: NodeJS.ProcessEnv;
    readonly frontend: NodeJS.ProcessEnv;
    readonly runner: NodeJS.ProcessEnv;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function never(): Promise<never> {
  return new Promise(() => {});
}

function readTimeout(name: string, fallback: number): number {
  return Number(process.env[name] ?? fallback);
}

function ensureFileExists(filePath: string, label: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} was not found at ${filePath}`);
  }
}

function getBackendPythonPath(backendDir: string, isWindows: boolean): string {
  return isWindows
    ? path.join(backendDir, ".venv", "Scripts", "python.exe")
    : path.join(backendDir, ".venv", "bin", "python");
}

function getExitReason(processToDescribe: ManagedProcess): string {
  return (
    processToDescribe.exitSignal ??
    `exit code ${String(processToDescribe.exitCode ?? EXIT_CODE_ERROR)}`
  );
}

function waitForExitCode(processToWait: ManagedProcess): Promise<number> {
  return processToWait.exitPromise.then(() =>
    processToWait.exitSignal ? EXIT_CODE_ERROR : (processToWait.exitCode ?? 0),
  );
}

function createManagedProcess(
  name: string,
  command: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  isWindows: boolean,
): ManagedProcess {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: "inherit",
    shell: false,
    detached: !isWindows,
  });

  if (!child.pid) {
    throw new Error(`Failed to start ${name}`);
  }

  const managed: ManagedProcess = {
    child,
    name,
    exited: false,
    exitCode: null,
    exitSignal: null,
    exitPromise: new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        managed.exited = true;
        managed.exitCode = code;
        managed.exitSignal = signal;
        resolve();
      });
    }),
  };

  return managed;
}

function buildRuntimeConfig(): RuntimeConfig {
  const frontendDir = path.resolve(__dirname, "..", "..");
  const backendDir = path.resolve(frontendDir, "..", "backend");
  const isWindows = process.platform === "win32";

  const frontendPort = process.env.PORT ?? "3000";
  const frontendHost = process.env.FRONTEND_HOST ?? "127.0.0.1";
  const frontendOrigin =
    process.env.FRONTEND_ORIGIN ?? `http://localhost:${frontendPort}`;
  const backendPort = process.env.BACKEND_PORT ?? "8000";
  const backendHost = process.env.BACKEND_HOST ?? "127.0.0.1";
  const backendOrigin = `http://${backendHost}:${backendPort}`;

  const runnerEnv = {
    ...process.env,
    CI_MODE: process.env.CI_MODE ?? "True",
    TESTING_MODE: process.env.TESTING_MODE ?? "True",
    ENV: process.env.ENV ?? "development",
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ?? "wwZgZ19qBU3L0Rxf4oVzAbpw7xkmDOLG",
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ?? `https://localhost:${frontendPort}`,
  };

  return {
    platform: {
      isWindows,
      pollIntervalMs: readTimeout("E2E_POLL_INTERVAL_MS", 1_000),
      shutdownTimeoutMs: readTimeout("E2E_SHUTDOWN_TIMEOUT_MS", 5_000),
      startupTimeoutMs: readTimeout("E2E_START_TIMEOUT_MS", 300_000),
    },
    network: {
      backendHealthUrl: `${backendOrigin}/check/health`,
      backendHost,
      backendOrigin,
      backendPort,
      frontendHost,
      frontendOrigin,
      frontendPort,
      frontendUrl: `http://${frontendHost}:${frontendPort}`,
    },
    paths: {
      backendDir,
      backendPython: getBackendPythonPath(backendDir, isWindows),
      cypressBin: path.join(
        frontendDir,
        "node_modules",
        "cypress",
        "bin",
        "cypress",
      ),
      frontendDir,
      frontendServer: path.join(
        frontendDir,
        ".next",
        "standalone",
        "server.js",
      ),
    },
    env: {
      backend: {
        ...runnerEnv,
        ENV: process.env.ENV ?? "dev",
        IGNORE_AUTH: process.env.IGNORE_AUTH ?? "False",
        TESTING_MODE: process.env.TESTING_MODE ?? "True",
        TEST_FIXTURE_KEY: process.env.TEST_FIXTURE_KEY ?? "test",
        GITLAB_BASE_URL:
          process.env.GITLAB_BASE_URL ?? "https://gitlab.com/api/v4",
        GITLAB_ROOT_ID: process.env.GITLAB_ROOT_ID ?? "124674879",
        DATABASE_URL: process.env.DATABASE_URL ?? "sqlite:///../sqlite.db",
        CORS_ORIGIN: process.env.CORS_ORIGIN ?? `["${frontendOrigin}"]`,
        JWKS_URL: process.env.JWKS_URL ?? `${frontendOrigin}/api/auth/jwks`,
        JWT_AUDIENCE:
          process.env.JWT_AUDIENCE ?? `https://localhost:${frontendPort}`,
        JWT_ISSUER:
          process.env.JWT_ISSUER ?? `https://localhost:${frontendPort}`,
      },
      frontend: {
        ...runnerEnv,
        PORT: frontendPort,
        HOSTNAME: frontendHost,
      },
      runner: runnerEnv,
    },
  };
}

async function waitForHttpReady(
  url: string,
  label: string,
  owner: ManagedProcess,
  config: RuntimeConfig["platform"],
): Promise<void> {
  const deadline = Date.now() + config.startupTimeoutMs;

  while (Date.now() < deadline) {
    if (owner.exited) {
      throw new Error(`${label} exited before becoming ready`);
    }

    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(config.pollIntervalMs),
      });

      if (response.status >= 200 && response.status < 400) {
        return;
      }
    } catch {
      // Service is still starting up.
    }

    await sleep(config.pollIntervalMs);
  }

  throw new Error(`Timed out waiting for ${label} at ${url}`);
}
