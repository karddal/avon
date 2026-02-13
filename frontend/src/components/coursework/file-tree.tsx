"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronRight,
  Folder,
  FileText,
  FileCode,
} from "lucide-react"

type GitLabTreeItem = {
    id: string;
    name: string;
    type: "blob" | "tree";
    path: string;
    mode: string;
}

function TreeNode({ node }: { node: RepoNode }) {
  // File (leaf)
  if (node.type === "blob") {
    const Icon =
      node.name.endsWith(".tsx") || node.name.endsWith(".ts")
        ? FileCode
        : FileText

    return (
      <div className="flex items-center gap-2 pl-6 py-1 text-sm text-muted-foreground hover:bg-accent rounded">
        <Icon className="h-4 w-4" />
        <span className="truncate">{node.name}</span>
      </div>
    )
  }

  // Folder
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
  )
}

export default function RepoTree({fileTree} : RepoNode[]) {
  const isEmpty = FAKE_REPO.length === 0
  return (
    <div>
      <div className="mb-2 text-sm font-medium">Repository</div>

      <ScrollArea className="rounded-md border p-2">
        <div className="space-y-1">
          {FAKE_REPO.map((node) => (
            <TreeNode key={node.path} node={node} />
          ))}
          {isEmpty && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Repository is empty at the moment.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
