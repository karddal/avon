import { MANAGERS } from "./managers";
import type { Image } from "./types";

export const IMAGES: Image[] = [
  {
    id: "alpine:latest",
    name: "Alpine (recommended)",
    manager: MANAGERS.apk,
  },
  {
    id: "rockylinux:8.9",
    name: "MVB Lab Machine",
    manager: MANAGERS.dnf,
  },
  {
    id: "ubuntu:latest",
    name: "Ubuntu",
    manager: MANAGERS.apt,
  },
];
