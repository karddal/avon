import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type UserCardProps = {
  id: string;
  name: string;
  image: string | null | undefined;
  email?: string | undefined;
  role?: string | undefined;
};

export function getInitials(name: string) {
  if (!name || typeof name !== "string") return "?";
  const allNames = name.trim().split(" ");
  if (allNames.length === 0) return "?";

  const first = allNames[0].charAt(0);
  const last =
      allNames.length > 1 ? allNames[allNames.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export default function UserCard(props: UserCardProps) {
  return (
    <Card
      key={props.id}
      className="hover:shadow-md transition-shadow p-0 overflow-hidden flex-1"
    >
      <CardContent className="flex w-full gap-4 p-0 items-start flex-row justify-between">
        <div className="flex flex-row gap-2 items-center">
          <Avatar className="h-12 w-12 border rounded-none shrink-0">
            <AvatarImage
              src={props.image ? props.image : " "}
              alt={props.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-none">
              {getInitials(props.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium text-sm md:text-base">
              {props.name}
            </span>
            <span className="font-mono text-accent-foreground/60 text-xs flex flex-row gap-2">
              {props.role} {props.email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
