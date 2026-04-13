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
