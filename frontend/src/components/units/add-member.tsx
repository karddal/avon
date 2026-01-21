"use client";

import { FileStack, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

function _getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
    allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

type studentInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function AddMember() {
  const [_students, _setStudents] = useState<studentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, _setLoading] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  async function handleBulk() {
    toast.success("Bulk adding request sent!");
  }

  if (loading)
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Input
          disabled
          className="w-full"
          placeholder="Loading students..."
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
          placeholder="Search for someone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline" onClick={() => setShowBulk(true)}>
          <FileStack></FileStack>Bulk
        </Button>
      </div>
      {showBulk ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg">Bulk Add</h1>
            <p className="text-muted-foreground font-normal text-sm">
              Add student emails, one per line.
            </p>
          </div>
          <Textarea className="overflow-y-scroll "></Textarea>
          <Button onClick={() => handleBulk()}>
            <SendHorizonal></SendHorizonal>Submit
          </Button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
