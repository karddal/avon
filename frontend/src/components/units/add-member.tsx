"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileStack,
  Icon,
  Menu,
  SendHorizonal,
  TextSearch,
  UserIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { search_by_name, SearchResponse } from "@/lib/actions/search_by_name";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "better-auth";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

function getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
    allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export default function AddMember() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [response, setResponse] = useState<SearchResponse>({
    users: [],
    total: 0,
    limit: 0,
    offset: 0,
  });
  const [offset, setOffset] = useState<number>(0);
  const limit = 5;

  async function handleBulk() {
    toast.success("Bulk adding request sent!");
  }

  async function showUsers(query: string, offset: number) {
    setLoading(true);
    const response: SearchResponse = await search_by_name(query, offset, limit);
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
      {searchQuery.length == 0 ? (
        <></>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-scroll max-h-128 bg-accent p-2">
          {loading ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <Spinner />
            </div>
          ) : (
            <div></div>
          )}
          {response.users.length > 0 ? (
            response.users.map((user: User) => (
              <Card
                key={user.id}
                className="hover:shadow-md transition-shadow p-0 overflow-hidden"
              >
                <CardContent className="flex w-full gap-4 p-0 items-center flex-row justify-between">
                  <div className="flex flex-row gap-2 items-center">
                    <Avatar className="h-12 w-12 border rounded-none shrink-0">
                      <AvatarImage
                        src={user.image ? user.image : ""}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-none">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <span className="font-medium text-sm md:text-base">
                        {user.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // <div className="text-center py-10 text-muted-foreground text-sm">
            //   No users found matching "{searchQuery}"
            // </div>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserIcon />
                </EmptyMedia>
                <EmptyTitle>No users</EmptyTitle>
                <EmptyDescription>No users found</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {response.users.length > 0 ? (
            <div className="flex flex-row items-center text-center">
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
            <div></div>
          )}
        </div>
      )}
    </div>
  );
}
