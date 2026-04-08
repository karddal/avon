import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { DropdownCard } from "../dropdown-card";
import Lecturers from "../units/lecturers";

type Lecturer = {
  id: string;
  name: string;
  image: string;
};

export default function UnitMembersModule({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <DropdownCard
        openByDefault={true}
        title="Unit staff"
        desc="Lecturers and teachers appear here"
        className={""}
    >
        <Lecturers lecturers={lecturers}></Lecturers>
    </DropdownCard>
  );
}