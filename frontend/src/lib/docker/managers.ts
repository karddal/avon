import { Manager } from "./types";

export const MANAGERS: Record<string, Manager> = {
  apk: {
    id: "apk",
    updateCmd: "apk update",
    installCmd: "apk add --no-cache",
  },
  apt: {
    id: "apt",
    updateCmd: "apt-get update",
    installCmd: "apt-get install -y",
  },
  dnf: {
    id: "dnf",
    updateCmd: "dnf update -y",
    installCmd: "dnf install -y",
  },
};
