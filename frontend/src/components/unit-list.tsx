// import axios from "axios";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
// import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Unit from "@/components/unit";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
};

type UnitListProps = {
  currentYear: number;
  finished: boolean;
  token?: string;
};

export default async function UnitList({ currentYear, finished, token }: UnitListProps) {
  // const [data, setData] = useState<UnitData[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   axios
  //     .get(`${process.env.NEXT_PUBLIC_API_URL}/me/units`, {
  //       withCredentials: true,
  //     })
  //     .then((response) => {
  //       console.log(response.data);
  //       const result = Array.isArray(response.data)
  //         ? response.data
  //         : response.data.units;
  //       setData(result || []);
  //     })
  //     .catch((err) => {
  //       console.error("Failed to fetch units:", err);
  //       setData([]);
  //     })
  //     .finally(() => setLoading(false));
  // }, []);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/units`,
    {
      method: "GET",
      headers: {
        Cookie: `access_token=${token}`,
        "Content-Type": "application/json",
      }
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch units")
  }

  const unitListData: UnitData[] = await response.json()

  //  academic year window: Sept 1 -> Aug 31
  const start = new Date(currentYear, 8, 1); // Sept = month 8
  const end = new Date(currentYear + 1, 7, 31, 23, 59, 59, 999);

  const filtered = unitListData.filter((unit) => {
    const created = new Date(unit.creation_date);
    const inRange = created >= start && created <= end;
    if (finished) {
      return created < start; // anything before this year
    }
    return inRange; // ongoing = within this year
  });

  return (
    <>
      <Link href="/units/create">
        <Card className="bg-muted/50 flex flex-row p-5 h-full items-center hover:bg-foreground/10">
          <PlusIcon size={50}></PlusIcon>
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium">Add new Unit</CardTitle>
            <CardDescription>Create a new unit here.</CardDescription>
          </div>
        </Card>
      </Link>
      {filtered.length > 0 &&
        filtered.map((unit) => <Unit key={unit.id} props={unit} />)}
    </>
  );
}
