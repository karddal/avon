"use server"

import Unit from "@/components/unit";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {headers} from "next/headers";
import {toast} from "sonner";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BookDashed, CloudAlert, CloudAlertIcon} from "lucide-react";

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
};

async function getData(currentYear:number, finished: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login")
  }

  const token = session.session.token;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store"
  });
  let unitListData: UnitData[];
  if (!response.ok) {
    throw new Error("Failed to fetch units");
  }
  else {
    unitListData = await response.json();
  }
  //  academic year window: Sept 1 -> Aug 31
  const start = new Date(currentYear, 8, 1); // Sept = month 8
  const end = new Date(currentYear + 1, 7, 31, 23, 59, 59, 999);

  const filtered = unitListData.filter((unit) => {
    const created = new Date(unit.creation_date);
    const inRange = created >= start && created <= end;
    if (finished) {
      return created < start;
    }
    return inRange;
  });
  return filtered
}

export default async function UnitList({
  currentYear,
  finished,
}: UnitListProps) {
  try {
    const filtered = await getData(currentYear, finished)
    return (
        <>
          {filtered.length > 0 &&
              filtered.map((unit) => <Unit key={unit.id} props={unit} />)}
          {filtered.length == 0 &&
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookDashed />
                  </EmptyMedia>
                  <EmptyTitle>No units.</EmptyTitle>
                  <EmptyDescription>
                    No units were found that you are connected to.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
          }
        </>
    );
  } catch (error) {
    return (
        <>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CloudAlertIcon />
              </EmptyMedia>
              <EmptyTitle>Oops, something went wrong.</EmptyTitle>
              <EmptyDescription>
                Couldn't fetch units.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </>
    )
  }

}
