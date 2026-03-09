"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import UserCard from "@/components/user-card";
import { get_unit_users } from "@/lib/actions/get_unit_users";
import { get_username_from_id } from "@/lib/actions/get_username";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { Spinner } from "@/components/ui/spinner";

interface OmittedUsersProps {
  users: UserInfo[];
  loading: boolean;
  omittedMembersIds: string[];
}

type UserInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function ListOmittedusers({ users, loading, omittedMembersIds }: OmittedUsersProps) {
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      omittedMembersIds.includes(user.id)
    );
  }, [users, omittedMembersIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-2 overflow-y-scroll max-h-60 bg-accent p-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div className="group relative w-full" key={user.id}>
              <UserCard
                id={user.id}
                name={user.displayName}
                image={user.src}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm max-h-60 h-full">
            No users selected
          </div>
        )}
      </div>
    </div>
  );
}