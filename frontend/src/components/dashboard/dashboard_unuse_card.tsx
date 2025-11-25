import { Edit, Flag, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function Dashboard_unuse() {
  return (
    <Card className="flex flex-row xl:flex-col xl:w-full col-span-3 lg:col-span-3 xl:col-span-1">
      <CardContent className="flex flex-wrap flex-row xl:flex-col gap-4 m-0 h-full justify-evenly w-full">
        <Link
          href="/create/coursework"
          className="hover:bg-green-400/10 w-full"
        >
          <Card className="bg-green-400/10 p-2">
            <CardContent className="flex flex-row p-0 items-center gap-4">
              <Plus className="xl:size-12 p-0"></Plus>
              <p className="font-medium xl:text-lg">Create coursework</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/create/unit" className="hover:bg-green-400/10 w-full">
          <Card className="bg-green-400/10 p-2">
            <CardContent className="flex flex-row p-0 items-center gap-4">
              <Plus className="xl:size-12 p-0"></Plus>
              <p className="font-medium xl:text-lg">Create unit</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/edit" className="hover:bg-amber-400/10 w-full">
          <Card className="bg-amber-400/10 p-2">
            <CardContent className="flex flex-row p-0 items-center gap-4">
              <Edit className="xl:size-12 p-0"></Edit>
              <p className="font-medium xl:text-lg">Edit Deadline</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/end" className="hover:bg-red-400/10 w-full">
          <Card className="bg-red-400/10 p-2">
            <CardContent className="flex flex-row p-0 items-center gap-4">
              <Flag className="xl:size-12 p-0"></Flag>
              <p className="font-medium xl:text-lg">End submissions</p>
            </CardContent>
          </Card>
        </Link>
      </CardContent>
    </Card>
  );
}
