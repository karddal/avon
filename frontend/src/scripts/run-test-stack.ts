import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EXIT_CODE_ERROR = 1;
const EXIT_CODE_SIGINT = 130;
const EXIT_CODE_SIGTERM = 143;
const WINDOWS_KILL_WAIT_MS = 1_000;

// type for the subprocess this script manage
// like BE and FE
type ManagedProcess = {
  readonly child: ChildProcess;
  readonly name: string;
  readonly exitPromise: Promise<void>;
  exited: boolean;
  exitCode: number | null;
  exitSignal: NodeJS.Signals | null;
};

// type for the config subprocess need to run
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

// helpers
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

// cross-platform
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

// wrapper to make sure things work cross-platform
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

// all the key, path, link for the subprocess
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
    CI_MODE: process.env.CI_nMODE ?? "True",
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

// make sure process not running when the BE and FE is not start up yet
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

// unexpected-exit monitoring and shutdown manager for each subprocess
class ProcessSupervisor {
  private readonly processes: ManagedProcess[] = [];
  private shuttingDown = false;

  constructor(private readonly config: RuntimeConfig["platform"]) {}

  start(
    name: string,
    command: string,
    args: string[],
    cwd: string,
    env: NodeJS.ProcessEnv,
  ): ManagedProcess {
    const managed = createManagedProcess(
      name,
      command,
      args,
      cwd,
      env,
      this.config.isWindows,
    );

    this.processes.push(managed);

    return managed;
  }

  //catch unexpected exit
  failOnUnexpectedExit(processToWatch: ManagedProcess): Promise<never> {
    return processToWatch.exitPromise.then(
      () => {
        if (this.shuttingDown) {
          return never();
        }

        throw new Error(
          `${processToWatch.name} exited unexpectedly (${getExitReason(processToWatch)})`,
        );
      },
      (error) => {
        if (this.shuttingDown) {
          return never();
        }

        throw error;
      },
    );
  }

  //some node specific fix(by ai), (still have residual when exit)
  readonly cleanupSync = (): void => {
    for (const processToStop of [...this.processes].reverse()) {
      this.terminate(processToStop, "SIGKILL");
    }
  };

  async cleanup(exitCode: number): Promise<never> {
    if (this.shuttingDown) {
      process.exit(exitCode);
    }

    this.shuttingDown = true;

    for (const processToStop of [...this.processes].reverse()) {
      await this.stop(processToStop);
    }

    process.exit(exitCode);
  }

  private terminate(
    processToStop: ManagedProcess,
    signal: NodeJS.Signals,
  ): void {
    if (processToStop.exited || !processToStop.child.pid) {
      return;
    }

    //process kill for windows
    if (this.config.isWindows) {
      spawnSync(
        "taskkill",
        ["/PID", String(processToStop.child.pid), "/T", "/F"],
        {
          stdio: "ignore",
        },
      );
      return;
    }

    //for unix
    try {
      process.kill(-processToStop.child.pid, signal);
    } catch {
      try {
        processToStop.child.kill(signal);
      } catch {
        // The child can already be gone while we are shutting down.
      }
    }
  }

  private async stop(processToStop: ManagedProcess): Promise<void> {
    if (processToStop.exited) {
      return;
    }

    this.terminate(processToStop, "SIGTERM");

    // fix by AI "Windows path does not use Unix-style signal escalation"
    if (this.config.isWindows) {
      await Promise.race([
        processToStop.exitPromise,
        sleep(WINDOWS_KILL_WAIT_MS),
      ]);
      return;
    }

    await Promise.race([
      processToStop.exitPromise,
      sleep(this.config.shutdownTimeoutMs),
    ]);

    if (!processToStop.exited) {
      this.terminate(processToStop, "SIGKILL");
      await Promise.race([
        processToStop.exitPromise,
        sleep(WINDOWS_KILL_WAIT_MS),
      ]);
    }
  }
}

// catch every type of the exit(type suggest by AI)
function registerLifecycleHandlers(supervisor: ProcessSupervisor): void {
  process.on("SIGINT", () => {
    void supervisor.cleanup(EXIT_CODE_SIGINT);
  });

  process.on("SIGTERM", () => {
    void supervisor.cleanup(EXIT_CODE_SIGTERM);
  });

  process.on("uncaughtException", (error) => {
    console.error(error);
    void supervisor.cleanup(EXIT_CODE_ERROR);
  });

  process.on("unhandledRejection", (error) => {
    console.error(error);
    void supervisor.cleanup(EXIT_CODE_ERROR);
  });

  process.on("exit", supervisor.cleanupSync);
}

const runtime = buildRuntimeConfig();
const supervisor = new ProcessSupervisor(runtime.platform);

async function main(): Promise<void> {
  ensureFileExists(runtime.paths.backendPython, "Backend virtualenv Python");
  ensureFileExists(runtime.paths.frontendServer, "Built frontend server");
  ensureFileExists(runtime.paths.cypressBin, "Cypress CLI");

  registerLifecycleHandlers(supervisor);

  const backend = supervisor.start(
    "backend",
    runtime.paths.backendPython,
    [
      "-m",
      "uvicorn",
      "app.main:app",
      "--host",
      runtime.network.backendHost,
      "--port",
      runtime.network.backendPort,
    ],
    runtime.paths.backendDir,
    runtime.env.backend,
  );

  await waitForHttpReady(
    runtime.network.backendHealthUrl,
    "backend",
    backend,
    runtime.platform,
  );

  const frontend = supervisor.start(
    "frontend",
    process.execPath,
    [runtime.paths.frontendServer],
    runtime.paths.frontendDir,
    runtime.env.frontend,
  );

  await waitForHttpReady(
    runtime.network.frontendUrl,
    "frontend",
    frontend,
    runtime.platform,
  );

  const cypress = supervisor.start(
    "cypress",
    process.execPath,
    [runtime.paths.cypressBin, "run"],
    runtime.paths.frontendDir,
    runtime.env.runner,
  );

  const cypressExitCode = await Promise.race([
    waitForExitCode(cypress),
    supervisor.failOnUnexpectedExit(backend),
    supervisor.failOnUnexpectedExit(frontend),
  ]);

  await supervisor.cleanup(cypressExitCode);
}

void main().catch(async (error) => {
  console.error(error);
  await supervisor.cleanup(EXIT_CODE_ERROR);
});
