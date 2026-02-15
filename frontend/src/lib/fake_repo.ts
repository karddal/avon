// fake-repo.ts
export type RepoNode = {
  name: string;
  path: string;
  type: "tree" | "blob";
  children?: RepoNode[];
};

export const fakeRepo: RepoNode[] = [
  {
    name: "src",
    path: "src",
    type: "tree",
    children: [
      {
        name: "app",
        path: "src/app",
        type: "tree",
        children: [
          {
            name: "page.tsx",
            path: "src/app/page.tsx",
            type: "blob",
          },
          {
            name: "layout.tsx",
            path: "src/app/layout.tsx",
            type: "blob",
          },
        ],
      },
      {
        name: "components",
        path: "src/components",
        type: "tree",
        children: [
          {
            name: "button.tsx",
            path: "src/components/button.tsx",
            type: "blob",
          },
          {
            name: "tree.tsx",
            path: "src/components/tree.tsx",
            type: "blob",
          },
        ],
      },
    ],
  },
  {
    name: "package.json",
    path: "package.json",
    type: "blob",
  },
  {
    name: "README.md",
    path: "README.md",
    type: "blob",
  },
];
