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

export default function Lecturers({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <div className="flex flex-col gap-2 h-full">
      {lecturers.map((lecturer) => (
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
