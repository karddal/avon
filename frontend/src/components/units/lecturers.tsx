import UserCard from "@/components/user-card";
import { get_username_from_id } from "@/lib/actions/auth/get_username";
import { get_user_image_from_id } from "@/lib/actions/coursework/get_image";
import { get_owner_of_unit } from "@/lib/actions/unit/get_owner_of_unit";
import { getRequestJWT } from "@/lib/auth-utils";

type Response = {
  lecturers: string[];
};

type Lecturer = {
  id: string;
  name: string;
  image: string;
  role: boolean;
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
  const lecturers = lecturerResponse.lecturers;

  const owner = await get_owner_of_unit(unit_id);
  console.log("OWNER", owner);

  if (lecturers === undefined) {
    return <></>;
  }

  const results: Lecturer[] = [];
  for (const lecturer of lecturers) {
    results.push({
      id: lecturer,
      name: await get_username_from_id(lecturer),
      image: await get_user_image_from_id(lecturer),
      role: lecturer === owner,
    });
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {results.map((lecturer) => (
        <UserCard
          key={lecturer.id}
          name={lecturer.name}
          id={lecturer.id}
          image={lecturer.image}
          user_role={lecturer.role}
        ></UserCard>
      ))}
    </div>
  );
}
