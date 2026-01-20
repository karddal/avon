"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { get_students } from "@/lib/actions/get_students";
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

type studentInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function StudentList({ unit_id }: { unit_id: string }) {
  const [students, setStudents] = useState<studentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await get_students(unit_id);
        const studentIds = data.students;

        const enrichedStudents = await Promise.all(
          studentIds.map(async (id: string) => {
            const name = await get_username_from_id(id);
            const imageSrc = await get_user_image_from_id(id);

            return {
              id: id,
              displayName: name || "Unknown Student",
              src: imageSrc,
            };
          }),
        );

        setStudents(enrichedStudents);
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
        <Input disabled className="w-full" placeholder="Loading students..." />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <Input
        className="w-full"
        placeholder="Search students by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="hover:shadow-md transition-shadow p-0 overflow-hidden"
            >
              <CardContent className="flex w-full gap-4 px-0 items-center">
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
