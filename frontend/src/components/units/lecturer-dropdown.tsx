"use client";

import { Menu, Siren, SquarePen, SquareX, Users } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerGroup,
  DropDrawerItem,
  DropDrawerLabel,
  DropDrawerSeparator,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";
import DeleteUnitButton from "@/components/units/delete-unit-button";
import EditUnit from "@/components/units/edit-unit";
import ListMembers from "@/components/units/list-members";
import SendNotification from "@/components/units/send-notification";

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function LecturerDropdown({
  slug,
  me,
  unit_update_data,
  scopes,
}: {
  slug: string;
  me: string;
  unit_update_data: UnitUpdateData;
  scopes: Set<string>;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSendNotif, setShowSendNotif] = useState(false);

  const hasReadScope = scopes.has("unit:read");
  const hasEnrollScope = scopes.has("unit:enroll");
  const hasManageScope = scopes.has("unit:manage");
  const hasNotificationScope = scopes.has("unit:send_notification");
  const hasDeleteScope = scopes.has("unit:delete");
  const hasEntries =
    hasReadScope ||
    hasEnrollScope ||
    hasManageScope ||
    hasNotificationScope ||
    hasDeleteScope;

  if (!hasEntries) {
    return null;
  }

  return (
    <div className="aspect-square">
      <DropDrawer>
        <DropDrawerTrigger
          id="unit-dropdown"
          className="border hover:bg-accent hover:transition p-2"
        >
          <Menu size={32} />
        </DropDrawerTrigger>
        <DropDrawerContent align="end">
          <DropDrawerLabel>Unit Options</DropDrawerLabel>
          {hasReadScope && (
            <DropDrawerGroup>
              <DropDrawerLabel>Members</DropDrawerLabel>
              <DropDrawerItem
                onSelect={() => setShowMembers(true)}
                icon={<Users />}
              >
                View members
              </DropDrawerItem>
            </DropDrawerGroup>
          )}

          {hasManageScope && (
            <>
              {hasReadScope && <DropDrawerSeparator />}
              <DropDrawerGroup>
                <DropDrawerLabel>Manage</DropDrawerLabel>
                <DropDrawerItem
                  onSelect={() => setShowEdit(true)}
                  icon={<SquarePen />}
                >
                  Edit unit
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}

          {hasNotificationScope && (
            <>
              {(hasReadScope || hasManageScope) && <DropDrawerSeparator />}
              <DropDrawerGroup>
                <DropDrawerLabel>Notifications</DropDrawerLabel>
                <DropDrawerItem
                  onSelect={() => setShowSendNotif(true)}
                  icon={<Siren />}
                >
                  Send notification
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}

          {hasDeleteScope && (
            <>
              {(hasReadScope || hasManageScope || hasNotificationScope) && (
                <DropDrawerSeparator />
              )}
              <DropDrawerGroup>
                <DropDrawerLabel>Destructive options</DropDrawerLabel>
                <DropDrawerItem
                  onSelect={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                  icon={<SquareX className="text-destructive" />}
                >
                  Delete unit
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}
        </DropDrawerContent>
      </DropDrawer>

      {hasReadScope && (
        <ListMembers
          canManageEnrollment={hasEnrollScope}
          openState={showMembers}
          setOpenState={setShowMembers}
          unit_id={slug}
          me={me}
        />
      )}

      {hasManageScope && (
        <EditUnit
          unit_update_data={unit_update_data}
          open_state={showEdit}
          set_open_state={setShowEdit}
        />
      )}

      {hasNotificationScope && (
        <SendNotification
          unit_id={slug}
          openState={showSendNotif}
          setOpenState={setShowSendNotif}
        />
      )}

      {hasDeleteScope && (
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent className="flex flex-col gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                unit and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-10 w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <DeleteUnitButton className="w-full sm:w-auto" unitId={slug} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
