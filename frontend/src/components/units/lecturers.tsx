import UserCard from "@/components/user-card";
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

  const lecturers = lecturerResponse.lecturers;
  if (lecturers === undefined) {
    return (
      <></>
    )
  }
  const results: Lecturer[] = [];
  for (const lecturer of lecturers) {
    console.log(lecturer);
    results.push({
      id: lecturer,
      name: await get_username_from_id(lecturer),
      image: await get_user_image_from_id(lecturer),
    });
  }

  return (
    <>
      {results.map((lecturer) => (
        <UserCard
          key={lecturer.id}
          name={lecturer.name}
          id={lecturer.id}
          image={lecturer.image}
        ></UserCard>
      ))}
    </>
  );
}
