import { MANAGERS } from "@/lib/docker/managers";
import { Tool } from "./types";

export const TOOLS: Tool[] = [
  {
    id: "gcc",
    name: "C / C++",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "gcc gcc-c++",
        [MANAGERS.apt.id]: "gcc g++",
        [MANAGERS.apk.id]: "gcc g++",
      },
    },
  },
  {
    id: "ghc",
    name: "Haskell",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "ghc",
        [MANAGERS.apt.id]: "ghc",
        [MANAGERS.apk.id]: "ghc",
      },
    },
  },
  {
    id: "go",
    name: "Go",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "golang",
        [MANAGERS.apt.id]: "golang",
        [MANAGERS.apk.id]: "go",
      },
    },
  },
  {
    id: "java",
    name: "Java 21",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "java-21-openjdk-devel",
        [MANAGERS.apt.id]: "openjdk-21-jdk",
        [MANAGERS.apk.id]: "openjdk21",
      },
    },
  },
  {
    id: "mvn",
    name: "Maven",
    category: "tool",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "maven",
        [MANAGERS.apt.id]: "maven",
        [MANAGERS.apk.id]: "maven",
      },
    },
  },
  {
    id: "python3",
    name: "Python 3.11",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "python3.11",
        [MANAGERS.apt.id]: "python3.11",
        [MANAGERS.apk.id]: "python3",
      },
    },
  },
  {
    id: "rust",
    name: "Rust",
    category: "lang",
    install: {
      type: "script",
      script:
        "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
      postInstall: {
        env: { PATH: "/root/.cargo/bin:$PATH" },
      },
    },
  },
  {
    id: "ocaml",
    name: "OCaml",
    category: "lang",
    install: {
      type: "package",
      packages: {
        [MANAGERS.dnf.id]: "opam",
        [MANAGERS.apt.id]: "opam",
        [MANAGERS.apk.id]: "opam",
      },
    },
  },
  {
    id: "uv",
    name: "UV",
    category: "tool",
    install: {
      type: "script",
      script: "curl -LsSf https://astral.sh/uv/install.sh | sh",
      postInstall: {
        env: { PATH: "/root/.local/bin:${PATH}" },
      },
    },
  },
];
