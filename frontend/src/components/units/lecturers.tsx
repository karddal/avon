import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { initials } from "@/components/units/unit_utils";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { get_username_from_id } from "@/lib/actions/get_username";
import { getRequestJWT } from "@/lib/auth-utils";

type Response = {
  lecturers: string[];
};

type Lecturer = {
  id: string;
  name: string;
  image: string;
};

export default async function Lecturers({ unit_id }: { unit_id: string }) {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/lecturers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const lecturerResponse: Response = await response.json();
  console.log(lecturerResponse.lecturers);
  const lecturers = lecturerResponse.lecturers;
  // filter to only those that are

  // for each lecturer, we convert into their name
  const results: Lecturer[] = [];
  for (const lecturer of lecturers) {
    console.log(lecturer);
    results.push({
      id: lecturer,
      name: (await get_username_from_id(lecturer)).name,
      image: await get_user_image_from_id(lecturer),
    });
  }

  return (
    <>
      {results.map((lecturer) => (
        <Card
          key={lecturer.id}
          className="p-0 bg-accent flex flex-row items-center gap-4"
        >
          <Avatar className="bg-slate-300 size-16 rounded-none">
            <AvatarImage src={lecturer.image} alt={"avatar"} />
            <AvatarFallback
              className={"rounded-none bg-foreground text-background"}
            >
              {initials(lecturer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-xl font-semibold">{lecturer.name}</div>
            {/*<div className="font-light">*/}
            {/*    Senior Lecturer, School of Computer Science*/}
          </div>
        </Card>
      ))}
    </>
  );
}
