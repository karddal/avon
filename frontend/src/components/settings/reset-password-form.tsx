"use client";

import type { User } from "better-auth";
import {
  ArrowLeft,
  ArrowRight,
  UserIcon,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/user-card";
import {
  type SearchResponse,
  search_by_name_all_users,
} from "@/lib/actions/search_by_name_all_users";

function _getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
    allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}
  

export default function ListMembers({externalSetSelectedUser}: {externalSetSelectedUser: (user: User | null) => void}) {
    const units = [
        { id: "u1", name: "Year 1 Computer Science 2025/2026" },
        { id: "u2", name: "Year 2 Computer Science 2025/2026" },
    ];
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse>({
    users: [],
    total: 0,
    limit: 0,
    offset: 0,
  });
  const [offset, setOffset] = useState<number>(0);


  const limit = 5;

  async function showUsers(query: string, offset: number) {
    setLoading(true);
    const response: SearchResponse = await search_by_name_all_users(
      query,
      offset,
      limit,
    );
    setLoading(false);
    setResponse(response);
  }

  async function usersbyProgramme(programme: string){
    const usersByPrograme = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <Input
          className="w-full"
          placeholder="User email"
          value={searchQuery}
        />
        <Input
          className="w-full"
          placeholder="New Password"
          value={searchQuery}
        />
      </div>
    </div>
  );
}
