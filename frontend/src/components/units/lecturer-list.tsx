"use client";

import { Crown, Menu, TextSearch, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/user-card";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { get_lecturers } from "@/lib/actions/get_lecturers";
import { get_owner_of_unit } from "@/lib/actions/get_owner_of_unit";
import { get_username_from_id } from "@/lib/actions/get_username";
import { remove_user_enrollment } from "@/lib/actions/remove_user_enrollment";
import { transfer_ownership } from "@/lib/actions/transfer_ownership";
import { requireSession } from "@/lib/auth-utils";

type lecturerInfo = {
  id: string;
  displayName: string;
  src?: string;
  role: boolean;
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
  const [_role, setRole] = useState<string | null | undefined>();
  const [userIsOwner, setUserIsOwner] = useState<boolean>(false);

  async function handleDelete(id: string) {
    const result = await remove_user_enrollment(unit_id, id);
    if (result) {
      toast.success("Lecturer unenrolled successfully");
    } else {
      throw new Error();
    }
    loadlecturers();
  }

  async function handleTransfer(new_owner_id: string) {
    const result = await transfer_ownership(unit_id, new_owner_id);
    if (result) {
      toast.success("Ownership transferred successfully.");
    } else {
      throw new Error();
    }
    loadlecturers();
  }

  const loadlecturers = useCallback(async () => {
    const s = await requireSession();
    const role = s.user.role;
    setRole(role);
    try {
      const data = await get_lecturers(unit_id);
      const lecturerIds = data.lecturers;
      const owner = await get_owner_of_unit(unit_id);
      setUserIsOwner(owner === me);

      const enrichedlecturers = await Promise.all(
        lecturerIds.map(async (id: string) => {
          const name = await get_username_from_id(id);
          const imageSrc = await get_user_image_from_id(id);

          return {
            id: id,
            displayName: name || "Unknown lecturer",
            src: imageSrc,
            role: owner === id,
          };
        }),
      );

      setlecturers(enrichedlecturers);
    } finally {
      setLoading(false);
    }
  }, [unit_id, me]);

  useEffect(() => {
    loadlecturers();
  }, [loadlecturers]);

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
            <div className="group relative w-full" key={lecturer.id}>
              <UserCard
                id={lecturer.id}
                name={lecturer.displayName}
                image={lecturer.src}
                user_role={lecturer.role}
              />

              <div className="absolute top-2 right-2 w-8 h-8">
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-card aspect-square! shadow border h-8 w-8 items-center justify-center flex hover:bg-card/50 hover:transition">
                    <Menu className="p-0"></Menu>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <TextSearch></TextSearch>
                      View Lecturer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTransfer(lecturer.id)}
                      disabled={!userIsOwner}
                    >
                      <Crown className="text-black"></Crown>
                      Transfer Ownership
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(lecturer.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={
                        lecturer.id === me || lecturer.role || !userIsOwner
                      }
                    >
                      <X className="text-destructive hover:text-destructive"></X>
                      <p className="text-destructive hover:text-destructive">
                        Remove Lecturer
                      </p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
