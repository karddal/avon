"use client";

import type { User } from "better-auth";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  SendHorizonal,
  UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { batch_add_students_to_unit } from "@/lib/actions/unit/batch_add_students_to_unit";
import { get_students } from "@/lib/actions/unit/get_students";
import {
  type SearchResponse,
  search_by_name,
} from "@/lib/actions/search_by_name";
import { fail } from "node:assert";
} from "@/lib/actions/unit/search_by_name";

function _getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
    allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export default function AddMember({ unit_id }: { unit_id: string }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse>({
    users: [],
    total: 0,
    limit: 0,
    offset: 0,
  });
  const [offset, setOffset] = useState<number>(0);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [length, setLength] = useState<number>(0);
  const [disabledUsers, setDisabledUsers] = useState<string[]>([]);

  const limit = 5;

  async function handleSend() {
    const userIds = selectedUsers.map((user) => user.id);
    const response = await batch_add_students_to_unit(unit_id, userIds);
    if (response.success) {
      toast.success("Added student(s) to unit!");
    } else {
      toast.error("Student(s) have already been added!");
    }
  }

  const loadDisabled = useCallback(async () => {
    try {
      setDisabledUsers([]);

      const [disabledS] = await Promise.all([get_students(unit_id)]);

      const disabledU = [...(disabledS?.students || [])];

      setDisabledUsers(disabledU);
    } catch (_error) { }
  }, [unit_id]);

  useEffect(() => {
    loadDisabled();
  }, [loadDisabled]);

  async function showUsers(query: string, offset: number) {
    setLoading(true);
    const response: SearchResponse = await search_by_name(
      query,
      offset,
      limit,
      "user",
    );
    setLoading(false);
    setResponse(response);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <Input
          className="w-full"
          placeholder="Search for someone..."
          value={searchQuery}
          onChange={(e) => {
            setOffset(0);
            setSearchQuery(e.target.value);
            showUsers(e.target.value, offset);
          }}
        />
      </div>
      {loading && searchQuery.length === 0 ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <Skeleton className="bg-accent w-full h-12" />
          <Skeleton className="bg-accent w-full h-12" />
          <Skeleton className="bg-accent w-full h-12" />
        </div>
      ) : (
        <></>
      )}
      {searchQuery.length === 0 ? (
        <></>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-scroll max-h-128 bg-accent p-2">
          {response.users.length > 0 ? (
            response.users.map((user: User) => (
              <div className="group relative w-full" key={user.id}>
                <UserCard
                  id={user.id}
                  name={user.name}
                  image={user.image}
                  email={user.email}
                  user_role={false}
                />

                <div className="absolute top-2 right-2 w-8 h-8">
                  <Checkbox
                    disabled={disabledUsers.includes(user.id)}
                    checked={selectedUsers.some((u) => u.id === user.id)}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        const newList = selectedUsers.filter(
                          (u) => u.id !== user.id,
                        );
                        setSelectedUsers(newList);
                        setLength(newList.length);
                      } else {
                        const newList = [...selectedUsers, user];
                        setSelectedUsers(newList);
                        setLength(newList.length);
                      }
                    }}
                    className="peer w-full h-full z-10 bg-card/80 shadow rounded-none border data-[state=checked]:bg-primary"
                  />
                  <div
                    className="
      absolute inset-0 flex items-center justify-center 
      pointer-events-none 
      transition-all 
      duration-400
      ease-in-out
      peer-data-[state=checked]:opacity-0 
      peer-data-[state=checked]:scale-0
      peer-data-[state=checked]:rotate-90
    "
                  >
                    <Plus size={20} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
          {!loading && searchQuery.length > 0 && response.users.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserIcon />
                </EmptyMedia>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription className="flex flex-row">
                  No users for search query "
                  <div className="truncate max-w-20">{searchQuery}</div>"
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <></>
          )}
          {response.users.length > 0 ? (
            <div className="flex flex-row items-center text-center my-2">
              <Button
                size="icon"
                variant="outline"
                disabled={offset / limit + 1 === 1}
                onClick={() => {
                  const newOffset = Math.max(0, offset - limit);
                  setOffset(newOffset);
                  showUsers(searchQuery, newOffset);
                }}
              >
                <ArrowLeft></ArrowLeft>
              </Button>
              <span className="font-light text-center w-full">
                {offset / limit + 1}/{Math.ceil(response.total / limit)} -
                Showing {response.users.length} results out of {response.total}
              </span>
              <Button
                size="icon"
                variant="outline"
                disabled={
                  offset / limit + 1 === Math.ceil(response.total / limit)
                }
                onClick={() => {
                  const newOffset = Math.min(
                    offset + limit,
                    response.total - 1,
                  );
                  setOffset(newOffset);
                  showUsers(searchQuery, newOffset);
                }}
              >
                <ArrowRight></ArrowRight>
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
      {length > 0 ? (
        <div className="flex flex-row items-center text-center">
          <Button
            className="w-full"
            variant="default"
            onClick={() => {
              handleSend();
              loadDisabled();
            }}
          >
            <SendHorizonal></SendHorizonal> Add {length} users to unit
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
