"use client";

import { Menu, TextSearch, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { delete_user } from "@/lib/actions/delete_user";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { get_lecturers } from "@/lib/actions/get_lecturers";
import { get_username_from_id } from "@/lib/actions/get_username";

function getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
    allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

type lecturerInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function lecturerList({
  unit_id,
  me,
}: {
  unit_id: string;
  me: string;
}) {
  const [lecturers, setlecturers] = useState<lecturerInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  console.log(me);

  async function handleDelete(id: string) {
    const result = await delete_user(id);
    console.log(result);
    if (result) {
      toast.success("Lecturer deleted successfully");
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    async function loadlecturers() {
      try {
        const data = await get_lecturers(unit_id);
        const lecturerIds = data.lecturers;

        const enrichedlecturers = await Promise.all(
          lecturerIds.map(async (id: string) => {
            const name = await get_username_from_id(id);
            const imageSrc = await get_user_image_from_id(id);

            return {
              id: id,
              displayName: name || "Unknown lecturer",
              src: imageSrc,
            };
          }),
        );

        setlecturers(enrichedlecturers);
      } catch (error) {
        console.error("Failed to load lecturers", error);
      } finally {
        setLoading(false);
      }
    }
    loadlecturers();
  }, [unit_id]);

  const filteredlecturers = useMemo(() => {
    return lecturers.filter((lecturer) =>
      lecturer.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [lecturers, searchQuery]);

  if (loading)
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Input
          disabled
          className="w-full"
          placeholder="Loading lecturers..."
          value={searchQuery}
        />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row">
        <Input
          className="w-full"
          placeholder="Search lecturers by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 overflow-y-scroll max-h-48 bg-accent p-2">
        {filteredlecturers.length > 0 ? (
          filteredlecturers.map((lecturer) => (
            <Card
              key={lecturer.id}
              className="hover:shadow-md transition-shadow p-0 overflow-hidden"
            >
              <CardContent className="flex w-full gap-4 p-0 items-center flex-row justify-between">
                <div className="flex flex-row gap-2 items-center">
                  <Avatar className="h-12 w-12 border rounded-none shrink-0">
                    <AvatarImage
                      src={lecturer.src}
                      alt={lecturer.displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-none">
                      {getInitials(lecturer.displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base">
                      {lecturer.displayName}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="border hover:bg-accent hover:transition mx-2 p-1">
                    <Menu className="p-0"></Menu>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <TextSearch></TextSearch>
                      View Lecturer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(lecturer.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={lecturer.id === me}
                    >
                      <X className="text-destructive hover:text-destructive"></X>
                      <p className="text-destructive hover:text-destructive">
                        Remove Lecturer
                      </p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No lecturers found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
