"use client";

import { ChevronRight, FileCode, FileText, Folder } from "lucide-react";
import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RepoTree {
  fileTree: GitLabTreeItem[];
}

type RepoNode = {
  name: string;
  path: string;
  type: "tree" | "blob";
  children?: RepoNode[];
};

type GitLabTreeItem = {
  id: string;
  name: string;
  type: "blob" | "tree";
  path: string;
  mode: string;
};

export function buildTree(items: GitLabTreeItem[]): RepoNode[] {
  const map = new Map<string, RepoNode>();
  const roots: RepoNode[] = [];

  for (const item of items) {
    map.set(item.path, {
      name: item.name,
      path: item.path,
      type: item.type,
      children: item.type === "tree" ? [] : undefined,
    });
  }

  for (const item of items) {
    const node = map.get(item.path);
    if (!node) continue;
    const parentPath = item.path.includes("/")
      ? item.path.substring(0, item.path.lastIndexOf("/"))
      : null;

    if (!parentPath) {
      roots.push(node);
    } else {
      const parent = map.get(parentPath);
      parent?.children?.push(node);
    }
  }

  return roots;
}

function TreeNode({ node }: { node: RepoNode }) {
  // File (Blob)
  if (node.type === "blob") {
    const Icon =
      node.name.endsWith(".tsx") || node.name.endsWith(".ts")
        ? FileCode
        : FileText;

    return (
      <div className="flex items-center gap-2 pl-6 py-1 text-sm text-muted-foreground hover:bg-accent rounded">
        <Icon className="h-4 w-4" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  // Folder (tree)
  return (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent">
        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
        <Folder className="h-4 w-4 text-primary" />
        <span className="truncate">{node.name}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="pl-4">
        {node.children?.map((child) => (
          <TreeNode key={child.path} node={child} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function RepoTree({ fileTree }: RepoTree) {
  // console.log(fileTree);
  const nestedTree = React.useMemo(() => buildTree(fileTree), [fileTree]);

  const isEmpty = nestedTree.length === 0;
  return (
    <div>
      <div className="mb-2 text-sm font-medium">Repository</div>

      <div className="max-h-72 overflow-auto rounded-md border">
        <div className="min-w-max space-y-1 p-2">
          {nestedTree.map((node) => (
            <TreeNode key={node.path} node={node} />
          ))}
          {isEmpty && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Repository is empty at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
