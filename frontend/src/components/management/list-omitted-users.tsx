"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/user-card";

interface OmittedUsersProps {
  users: UserInfo[];
  loading: boolean;
  omittedMembersIds: string[];
  setOmittedUserIds: (ids: string[]) => void;
}

type UserInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function ListOmittedusers({
  users,
  loading,
  omittedMembersIds,
  setOmittedUserIds,
}: OmittedUsersProps) {
  const filteredUsers = useMemo(() => {
    return users.filter((user) => omittedMembersIds.includes(user.id));
  }, [users, omittedMembersIds]);

  async function safeDelete(id: string) {
    setOmittedUserIds(omittedMembersIds.filter((memberId) => memberId !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div
        className={`flex flex-col gap-2 bg-accent p-2 ${filteredUsers.length === 0 ? "flex-1" : ""}`}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div className="group relative w-full" key={user.id}>
              <UserCard id={user.id} name={user.displayName} image={user.src} />
              <div className="absolute top-2 right-2 w-8 h-8">
                <button
                  type="button"
                  onClick={() => safeDelete(user.id)}
                  className="w-full h-full flex items-center justify-center bg-card/80 shadow border hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center my-auto items-center justify-center text-muted-foreground text-sm">
            No users selected
          </div>
        )}
      </div>
    </div>
  );
}
