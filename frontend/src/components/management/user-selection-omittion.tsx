"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import UserCard from "@/components/user-card";
import type { UUID } from "node:crypto";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMember from "@/components/units/add-member";
import AddMemberLecturer from "@/components/units/add-member-lec";
import LecturerList from "@/components/units/lecturer-list";
import StudentList from "@/components/units/student-list";
import { requireSession } from "@/lib/auth-utils";
import { get_unit_users } from "@/lib/actions/get_unit_users";
import { get_username_from_id } from "@/lib/actions/get_username";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Menu, Pencil, TextSearch, X } from "lucide-react";

interface OmittedMembersProps {
  omittedMembersIds: string[];
  setOmittedUserIds: (ids: string[]) => void
  unit_id: string;
}

type userInfo = {
  id: string;
  displayName: string;
  src?: string;
}


export default function UserSelectionOmittion({ omittedMembersIds, setOmittedUserIds, unit_id}: OmittedMembersProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<userInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    async function safeOmit(id : string) {
        if (!omittedMembersIds.includes(id)){
            setOmittedUserIds([...omittedMembersIds, id]);
        }
    }

    async function safeDelete(id: string) {
        setOmittedUserIds(
            omittedMembersIds.filter(memberId => memberId !== id)
        );
    };

    const loadlecturers = useCallback(async () => {
        const s = await requireSession();
        const role = s.user.role;

        try {
            const data = await get_unit_users(unit_id);
            const userIds = data.users;

            const enrichedlecturers = await Promise.all(
            userIds.map(async (id: string) => {
                const name = await get_username_from_id(id);
                const imageSrc = await get_user_image_from_id(id);

                return {
                id: id,
                displayName: name || "Unknown lecturer",
                src: imageSrc,
                };
            }),
            );

            setUsers(enrichedlecturers);
        } finally {
            setLoading(false);
        }
    }, [unit_id]);

    useEffect(() => {
        loadlecturers();
    }, [loadlecturers]);

    const filteredlecturers = useMemo(() => {
        return users.filter((lecturer) =>
          lecturer.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }, [users, searchQuery]);


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
          filteredlecturers.map((user) => (
            <div className="group relative w-full" key={user.id}>
              <UserCard
                id={user.id}
                name={user.displayName}
                image={user.src}
              />
              <div className="absolute top-2 right-2 w-8 h-8">
                <Checkbox
                    checked={omittedMembersIds.includes(user.id)}
                    onCheckedChange={(checked) => {
                        if (!checked) {
                        safeOmit(user.id)
                        } else {
                        safeDelete(user.id)
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
          <div className="text-center py-10 text-muted-foreground text-sm">
            No users found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
