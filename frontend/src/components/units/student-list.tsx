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
import { get_batch_user_info } from "@/lib/actions/get_batch_user_details";
import { get_students } from "@/lib/actions/get_students";

function getInitials(name: string) {
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

export default function StudentList({ unit_id }: { unit_id: string }) {
  const [students, setStudents] = useState<studentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function handleDelete(id: string) {
    const result = await delete_user(id);
    console.log(result);
    if (result) {
      toast.success("Student deleted successfully");
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await get_students(unit_id);
        const studentIds = data.students;

        if (studentIds && studentIds.length > 0) {
          const enrichedStudents = await get_batch_user_info(studentIds);
          setStudents(enrichedStudents);
        }
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [unit_id]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

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
      <div className="flex flex-row">
        <Input
          className="w-full"
          placeholder="Search students by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 overflow-y-scroll max-h-48 bg-accent p-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="hover:shadow-md transition-shadow p-0 overflow-hidden"
            >
              <CardContent className="flex w-full gap-4 p-0 items-center flex-row justify-between">
                <div className="flex flex-row gap-2 items-center">
                  <Avatar className="h-12 w-12 border rounded-none shrink-0">
                    <AvatarImage src={student.src} alt={student.displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-none">
                      {getInitials(student.displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base">
                      {student.displayName}
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
                      View Student
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(student.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="text-destructive hover:text-destructive"></X>
                      <p className="text-destructive hover:text-destructive">
                        Remove Student
                      </p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No students found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
