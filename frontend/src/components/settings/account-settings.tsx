"use client";

import type { User } from "better-auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/components/user-card";
import { update_user_profile_image } from "@/lib/actions/auth/update_user_profile_image";
import { get_user_role } from "@/lib/actions/get_user_role";
import { authClient } from "@/lib/auth-client";
import ChangeRoleButton from "../management/change-role-button";
import ProfileImageUploader from "../management/profile-image-uploader";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import DeleteUserButton from "./delete-user-button";
import ResetPasswordButtonAdmin from "./reset-password-button-manage";
import ResetPasswordButtonSettings from "./reset-password-button-settings";

// This page is used for both settoings and management pages, when settingsPage is true then the compoennt is used for settings page, otherwise it's used in management
export default function AccountSettings({
  user,
  isAdmin,
  settingsPage,
  onProfileImageUpdated,
}: {
  user: User | null;
  isAdmin: boolean;
  settingsPage: boolean;
  onProfileImageUpdated?: () => void;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [role, setRole] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPasswordInp, setNewPasswordInp] = useState<string | null>(null);
  const [OldPasswordInpStudent, setOldPasswordInpStudent] = useState<
    string | null
  >(null);
  const [NewPasswordInpStudent, setNewPasswordInpStudent] = useState<
    string | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [updatedImage, setUpdatedImage] = useState<{
    userId: string;
    imageUrl: string;
  } | null>(null);
  const isValidPassword =
    newPasswordInp &&
    newPasswordInp.length >= 8 &&
    newPasswordInp.length <= 128;
  const isValidPasswordStudent =
    OldPasswordInpStudent &&
    NewPasswordInpStudent &&
    OldPasswordInpStudent.length >= 8 &&
    OldPasswordInpStudent.length <= 128 &&
    NewPasswordInpStudent.length >= 8 &&
    NewPasswordInpStudent.length <= 128;
  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "lecturer"
        ? "Lecturer"
        : role === "user"
          ? "Student"
          : "Unknown";
  const ROLES = [
    { value: "lecturer", label: "Lecturer" },
    { value: "user", label: "Student" },
  ];
  const hasRoleChanged = selectedRole && role !== selectedRole;
  const activeUser = settingsPage ? session?.user : user;

  useEffect(() => {
    if (!activeUser) return;
    const userId = activeUser.id;

    async function fetchRole() {
      try {
        const res = await get_user_role(userId);
        setRole(res);
        setSelectedRole(res);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      }
    }

    fetchRole();
  }, [activeUser]);

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  if (settingsPage && isPending) {
    return <div className="p-4">Loading...</div>;
  }

  if (!activeUser) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No user selected</p>
      </div>
    );
  }

  const name = activeUser.name;
  const email = activeUser.email;
  const image =
    updatedImage?.userId === activeUser.id
      ? updatedImage.imageUrl
      : (activeUser.image ?? "");

  return (
    <div className="w-full">
      <div className="relative w-full aspect-5/1 overflow-hidden rounded-lg bg-muted">
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/campus.jpg`}
          alt="Campus"
          fill
          className="object-cover object-[50%_65%]"
          priority
        />
      </div>

      <div className="-mt-12 sm:-mt-10 md:-mt-12 lg:-mt-14 flex justify-center">
        <Avatar className="size-16 sm:size-20 md:size-24 lg:size-28 border-4 border-background bg-background rounded-none">
          <AvatarImage src={image} className="rounded-none" />
          <AvatarFallback className="rounded-none">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-6 px-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Profile
          </h3>

          <div>
            <p className="text-sm text-muted-foreground">Full name</p>
            <p className="text-base font-medium">{name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email address</p>
            <p className="text-base font-medium">{email}</p>
          </div>

          {isAdmin && !settingsPage ? (
            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Update the selected user's profile picture.
              </p>
              <ProfileImageUploader
                imageUrl={image}
                name={name}
                buttonLabel="Upload new profile picture"
                onUploaded={async (imageUrl) => {
                  const result = await update_user_profile_image(
                    activeUser.id,
                    imageUrl,
                  );

                  if (!result.success) {
                    throw new Error(
                      result.error ?? "Failed to update profile image",
                    );
                  }

                  setUpdatedImage({
                    userId: activeUser.id,
                    imageUrl,
                  });
                  onProfileImageUpdated?.();
                }}
              />
            </div>
          ) : null}
        </div>
        {/* <div className="mt-8 px-6"> */}
        <div className="rounded-md border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Security
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Reset your password.
          </p>

          <Button
            variant="outline"
            className="mt-3 w-full sm:w-fit"
            onClick={() => setShowPasswordReset(true)}
          >
            Reset Password
          </Button>
        </div>
        <div className="rounded-md border border-border p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Role
          </h3>
          <p className="text-base font-medium">{roleLabel}</p>

          {isAdmin && !settingsPage && (
            <Button
              variant="outline"
              className="w-fit justify-self-end mt-3"
              onClick={() => setShowRoleChange(true)}
            >
              Change Role
            </Button>
          )}
        </div>
        {isAdmin ? (
          <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Deletion
            </h3>
            <Button
              variant="destructive"
              className="mt-3 w-full sm:w-fit"
              onClick={() => setShowDelete(true)}
            >
              Delete User
            </Button>
          </div>
        ) : (
          <></>
        )}
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <span>This will delete the user and all their data:</span>
                  <div className="mt-1 font-bold text-foreground">
                    {name} ({email})
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              <DeleteUserButton
                user_id={activeUser.id}
                closeDialog={() => setShowDelete(false)}
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRoleChange} onOpenChange={setShowRoleChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Role Change</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Selected User</span>

                    <span className="font-bold text-foreground">
                      {name} ({email})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Role</span>

                    <Select
                      value={selectedRole ?? undefined}
                      onValueChange={(value) => setSelectedRole(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>

                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              <ChangeRoleButton
                user_id={activeUser.id}
                closeDialog={() => {
                  setShowRoleChange(false);
                  setRole(selectedRole);
                }}
                newRole={selectedRole ?? ""}
                disabled={!hasRoleChanged}
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={showPasswordReset}
          onOpenChange={setShowPasswordReset}
        >
          {isAdmin && !settingsPage ? (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Password Reset</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2">
                      <span>Reset the password for user:</span>
                      <div className="font-bold text-foreground">
                        {name} ({email})
                      </div>
                    </div>
                    <Input
                      className="w-full"
                      placeholder="New Password"
                      onChange={(e) => {
                        // setOffset(0);
                        setNewPasswordInp(e.target.value);
                      }}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
                <ResetPasswordButtonAdmin
                  user_id={activeUser.id}
                  new_password={newPasswordInp ?? ""}
                  closeDialog={() => setShowPasswordReset(false)}
                  disabled={!isValidPassword}
                />
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : (
            // Need to replace this with non admin version
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Password Reset</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-4">
                    <Input
                      className="w-full"
                      placeholder="Current Password"
                      onChange={(e) => {
                        // setOffset(0);
                        setOldPasswordInpStudent(e.target.value);
                      }}
                    />
                    <Input
                      className="w-full"
                      placeholder="New Password"
                      onChange={(e) => {
                        // setOffset(0);
                        setNewPasswordInpStudent(e.target.value);
                      }}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
                <ResetPasswordButtonSettings
                  old_password={OldPasswordInpStudent ?? ""}
                  new_password={NewPasswordInpStudent ?? ""}
                  closeDialog={() => setShowPasswordReset(false)}
                  disabled={!isValidPasswordStudent}
                />
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </div>
    </div>
  );
}
