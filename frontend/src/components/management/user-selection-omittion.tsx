"use client";

import { ArrowLeft, ArrowRight, Pencil, UserIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/user-card";

interface OmittedMembersProps {
  users: UserInfo[];
  loading: boolean;
  omittedMembersIds: string[];
  setOmittedUserIds: (ids: string[]) => void;
}

type UserInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function UserSelectionOmittion({
  users,
  loading,
  omittedMembersIds,
  setOmittedUserIds,
}: OmittedMembersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState<number>(0);
  const [_length, _setLength] = useState<number>(0);
  const limit = 5;

  async function safeOmit(id: string) {
    if (!omittedMembersIds.includes(id)) {
      setOmittedUserIds([...omittedMembersIds, id]);
    }
  }

  async function safeDelete(id: string) {
    setOmittedUserIds(omittedMembersIds.filter((memberId) => memberId !== id));
  }

  const filteredUsers = useMemo(() => {
    return users.filter((lecturer) =>
      lecturer.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(offset, offset + limit);
  }, [filteredUsers, offset]);

  if (loading)
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Input
          disabled
          className="w-full"
          placeholder="Loading users..."
          value={searchQuery}
        />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <Input
          className="w-full"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOffset(0);
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
        <div className="flex flex-col gap-2 overflow-y-scroll max-h-48 bg-accent p-2">
          {filteredUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div className="group relative w-full" key={user.id}>
                <UserCard
                  id={user.id}
                  name={user.displayName}
                  image={user.src}
                  user_role={false}
                />
                <div className="absolute top-2 right-2 w-8 h-8">
                  <Checkbox
                    checked={omittedMembersIds.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        safeOmit(user.id);
                      } else {
                        safeDelete(user.id);
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
                    <Pencil size={20} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
          {!loading && searchQuery.length > 0 && filteredUsers.length === 0 ? (
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
        </div>
      )}
      {filteredUsers.length > 0 && searchQuery.length > 0 ? (
        <div className="flex flex-row items-center text-center my-2">
          <Button
            size="icon"
            variant="outline"
            disabled={offset / limit + 1 === 1}
            onClick={() => {
              const newOffset = Math.max(0, offset - limit);
              setOffset(newOffset);
            }}
          >
            <ArrowLeft></ArrowLeft>
          </Button>
          <span className="font-light text-center w-full">
            {offset / limit + 1}/{Math.ceil(filteredUsers.length / limit)} -
            Showing {paginatedUsers.length} results out of{" "}
            {filteredUsers.length}
          </span>
          <Button
            size="icon"
            variant="outline"
            disabled={
              offset / limit + 1 === Math.ceil(filteredUsers.length / limit)
            }
            onClick={() => {
              const newOffset = Math.min(
                offset + limit,
                filteredUsers.length - 1,
              );
              setOffset(newOffset);
            }}
          >
            <ArrowRight></ArrowRight>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
