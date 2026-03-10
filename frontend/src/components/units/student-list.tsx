"use client";

import { Menu, TextSearch, X } from "lucide-react";
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
import { get_batch_user_info } from "@/lib/actions/get_batch_user_details";
import { get_students } from "@/lib/actions/get_students";
import { remove_user_enrollment } from "@/lib/actions/remove_user_enrollment";

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
    const result = await remove_user_enrollment(unit_id, id);
    if (result) {
      toast.success("Student unenrolled successfully");
    } else {
      throw new Error();
    }
    loadStudents();
  }

  const loadStudents = useCallback(async () => {
    try {
      const data = await get_students(unit_id);
      const studentIds = data.students;

      if (studentIds && studentIds.length > 0) {
        const enrichedStudents = await get_batch_user_info(studentIds);
        setStudents(enrichedStudents);
      }
    } finally {
      setLoading(false);
    }
  }, [unit_id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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
            <div className="group relative w-full" key={student.id}>
              <UserCard
                id={student.id}
                name={student.displayName}
                image={student.src}
                user_role={false}
              />

              <div className="absolute top-2 right-2 w-8 h-8">
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-card aspect-square! shadow border h-8 w-8 items-center justify-center flex hover:bg-card/50 hover:transition">
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
              </div>
            </div>
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
