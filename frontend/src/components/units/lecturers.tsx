import UserCard from "@/components/user-card";

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
