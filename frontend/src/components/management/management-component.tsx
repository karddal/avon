"use client";

import type { User } from "better-auth/client";
import { useState } from "react";
import BulkDelete from "@/components/management/bulk-delete";
import BulkSwitch from "@/components/management/bulk-switch";
import ListMembers from "@/components/management/list-users";
import AccountSettings from "@/components/settings/account-settings";

export default function ManagementComponent({ isAdmin }: { isAdmin: boolean }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  return (
    <div className="mt-6 px-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Search
        </h3>
        <ListMembers
          key={searchRefreshKey}
          externalSetSelectedUser={setSelectedUser}
        />
      </div>
      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Account
        </h3>
        <AccountSettings
          user={selectedUser}
          isAdmin={isAdmin}
          settingsPage={false}
          onUserUpdated={setSelectedUser}
          onProfileImageUpdated={() =>
            setSearchRefreshKey((current) => current + 1)
          }
        />
      </div>
      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Bulk Delete Students
        </h3>
        <BulkDelete />
      </div>
      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Bulk Student Transfer
        </h3>
        <BulkSwitch />
      </div>
    </div>
  );
}
