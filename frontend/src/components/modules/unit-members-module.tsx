import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { DropdownCard } from "../dropdown-card";
import Lecturers from "../units/lecturers";
import { ScrollArea } from "@/components/ui/scroll-area";

type Lecturer = {
  id: string;
  name: string;
  image: string;
};

export default function UnitMembersModule({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <div className="flex h-[18rem] min-h-0 flex-col p-4 sm:h-[20rem] sm:p-5 md:h-[22rem] lg:h-full">
      <div className="mb-3 shrink-0">
        <div className="text-2xl font-semibold">Unit Staff</div>
        <div className="font-light">Lecturers and teachers appear here</div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-1">
          <div className="pr-3">
            <Lecturers lecturers={lecturers} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}