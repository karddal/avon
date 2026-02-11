export type Manager = {
  id: "apk" | "apt" | "dnf";
  updateCmd: string;
  installCmd: string;
};

export type Install =
  | { type: "package"; packages: Record<string, string> }
  | {
      type: "script";
      script: string;
      postInstall?: { env?: Record<string, string> };
    };

export type Tool = {
  id: string;
  name: string;
  category: "lang" | "tool" | "runtime";
  install: Install;
};

export type Image = {
  id: string;
  name: string;
  manager: Manager;
};
