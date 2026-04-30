"use client";

import type { User } from "better-auth";
import { Eye, Info, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  clearStoredImpersonationActive,
  clearStoredImpersonationTransition,
  clearStoredReturnTransition,
  setStoredImpersonationActive,
  setStoredImpersonationTransition,
} from "@/components/impersonation-banner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { impersonate_managed_user } from "@/lib/actions/auth/impersonation";
import { update_managed_user } from "@/lib/actions/auth/update_managed_user";
import { update_user_profile_image } from "@/lib/actions/auth/update_user_profile_image";
import { change_role } from "@/lib/actions/change_role";
import { get_user_role } from "@/lib/actions/get_user_role";
import { authClient } from "@/lib/auth-client";
import EditUserFieldButton from "../management/edit-user-field-button";
import ProfileImageUploader from "../management/profile-image-uploader";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import DeleteUserButton from "./delete-user-button";
import ResetPasswordButtonAdmin from "./reset-password-button-manage";
import ResetPasswordButtonSettings from "./reset-password-button-settings";

// This page is used for both settoings and management pages, when settingsPage is true then the compoennt is used for settings page, otherwise it's used in management
export default function AccountSettings({
  user,
  isAdmin,
  settingsPage,
  onUserUpdated,
  onProfileImageUpdated,
}: {
  user: User | null;
  isAdmin: boolean;
  settingsPage: boolean;
  onUserUpdated?: (user: User | null) => void;
  onProfileImageUpdated?: () => void;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [role, setRole] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
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
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isImpersonatingUser, setIsImpersonatingUser] = useState(false);
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
    role === "admin" ? "Admin" : role === "lecturer" ? "Lecturer" : "Student";

  const ROLES = [
    { value: "lecturer", label: "Lecturer" },
    { value: "user", label: "Student" },
  ];
  const activeUser = settingsPage ? user || session?.user : user;
  const trimmedDraftName = draftName.trim();
  const normalizedDraftEmail = draftEmail.trim().toLowerCase();
  const hasNameChanged = Boolean(
    activeUser && trimmedDraftName !== activeUser.name,
  );
  const hasEmailChanged = Boolean(
    activeUser && normalizedDraftEmail !== activeUser.email,
  );
  const isSelectedUserCurrentUser = activeUser?.id === session?.user.id;

  const handleImpersonateUser = async () => {
    if (!activeUser) return;

    try {
      setIsImpersonatingUser(true);
      clearStoredImpersonationActive();
      clearStoredReturnTransition();
      setStoredImpersonationTransition("impersonating");

      const result = await impersonate_managed_user(activeUser.id);

      if (result?.success === false) {
        throw new Error(result.error);
      }

      setStoredImpersonationActive(result.userName ?? activeUser.name);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start impersonation",
      );
      clearStoredImpersonationTransition();
      setIsImpersonatingUser(false);
    }
  };

  const ImpersonationLoadingOverlay = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-sky-500 p-3 text-white dark:bg-sky-950">
      <div className="absolute inset-3 rounded-xl border border-white/30 shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.25)_inset] animate-in fade-in-0 zoom-in-95 duration-300" />
      <div className="absolute inset-x-3 top-3 h-12 rounded-t-xl border-b border-white/30 bg-white/10 animate-in slide-in-from-top-2 fade-in-0 duration-300" />
      <div className="relative flex flex-col items-center gap-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex size-14 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-lg">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">Loading impersonation view...</p>
          <p className="text-sm text-white/80">
            Opening as {activeUser?.name ?? "selected user"}
          </p>
        </div>
      </div>
    </div>
  );

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

  useEffect(() => {
    if (!activeUser) {
      setDraftName("");
      setDraftEmail("");
      setIsEditingName(false);
      setIsEditingEmail(false);
      return;
    }

    setDraftName(activeUser.name);
    setDraftEmail(activeUser.email);
    setIsEditingName(false);
    setIsEditingEmail(false);
  }, [activeUser]);

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

  const syncActiveUser = (changes: Partial<User>) => {
    const updatedUser = {
      ...activeUser,
      ...changes,
    };
    onProfileImageUpdated?.();

    onUserUpdated?.(updatedUser);
  };

  return (
    <div className="w-full">
      {isImpersonatingUser ? <ImpersonationLoadingOverlay /> : null}
      <div
        className={`mt-6 px-6 grid grid-cols-1 gap-4 ${
          settingsPage ? "" : "md:grid-cols-2"
        }`}
      >
        <div
          className={`w-full rounded-md border border-border p-4 ${
            settingsPage ? "" : "md:col-span-2"
          } ${settingsPage ? "" : "@container/profile"}`}
        >
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Profile
          </h3>
          <div
            className={`${
              settingsPage
                ? ""
                : "flex flex-col gap-4 @lg/profile:flex-row @lg/profile:items-center"
            }`}
          >
            <div
              className={`w-full ${
                settingsPage
                  ? "max-w-full"
                  : "@lg/profile:h-full @lg/profile:w-fit"
              }`}
            >
              <ProfileImageUploader
                imageUrl={image}
                name={name}
                buttonLabel="Upload new profile picture"
                disabled
                layout="stacked"
                className={settingsPage ? undefined : "@lg/profile:h-full"}
                previewWrapperClassName={
                  settingsPage ? undefined : "@lg/profile:h-full"
                }
                imageSizeClassName={
                  settingsPage
                    ? "aspect-square h-auto"
                    : "aspect-square h-auto @lg/profile:h-full @lg/profile:w-auto @lg/profile:max-w-48"
                }
                showButton={false}
                onUploaded={() => {}}
              />
            </div>

            <div
              className={`${settingsPage ? "space-y-4 my-2" : "min-w-0 space-y-4"}`}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Full name</p>
                {isEditingName ? (
                  <div className="space-y-2">
                    <Input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Full name"
                    />
                    <EditUserFieldButton
                      actionLabel="Save name"
                      successMessage="Name updated successfully"
                      errorMessage="Failed to update name"
                      disabled={
                        !hasNameChanged || trimmedDraftName.length === 0
                      }
                      onCancel={() => {
                        setDraftName(name);
                        setIsEditingName(false);
                      }}
                      onSuccess={() => {
                        syncActiveUser({ name: trimmedDraftName });
                        setIsEditingName(false);
                      }}
                      onSubmit={async () => {
                        const result = await update_managed_user({
                          userId: activeUser.id,
                          name: trimmedDraftName,
                        });

                        return result.success;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 text-base font-medium break-words">
                      {name}
                    </p>
                    {isAdmin && !settingsPage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          setDraftName(name);
                          setIsEditingName(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email address</p>
                {isEditingEmail ? (
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      placeholder="Email address"
                    />
                    <EditUserFieldButton
                      actionLabel="Save email"
                      successMessage="Email updated successfully"
                      errorMessage="Failed to update email"
                      disabled={
                        !hasEmailChanged || normalizedDraftEmail.length === 0
                      }
                      onCancel={() => {
                        setDraftEmail(email);
                        setIsEditingEmail(false);
                      }}
                      onSuccess={() => {
                        syncActiveUser({ email: normalizedDraftEmail });
                        setIsEditingEmail(false);
                      }}
                      onSubmit={async () => {
                        const result = await update_managed_user({
                          userId: activeUser.id,
                          email: normalizedDraftEmail,
                        });

                        if (!result.success && result.error) {
                          toast.error(result.error);
                        }

                        return result.success;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 text-base font-medium break-all">
                      {email}
                    </p>
                    {isAdmin && !settingsPage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          setDraftEmail(email);
                          setIsEditingEmail(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div
                  className={`flex gap-2 ${
                    settingsPage
                      ? "flex-col"
                      : "flex-col sm:flex-row sm:items-center"
                  }`}
                >
                  {isAdmin && !settingsPage ? (
                    <ProfileImageUploader
                      imageUrl={image}
                      name={name}
                      buttonLabel="Upload new profile picture"
                      showPreview={false}
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
                  ) : (
                    <ProfileImageUploader
                      imageUrl={image}
                      name={name}
                      buttonLabel="Upload new profile picture"
                      disabled
                      showPreview={false}
                      onUploaded={() => {}}
                    />
                  )}
                  {!settingsPage ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label="Profile image requirements"
                        >
                          <Info className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={8}>
                        JPG, PNG, GIF or WebP up to 5MB.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      JPG, PNG, GIF or WebP up to 5MB.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-8 px-6"> */}
        <div className="w-full rounded-md border border-border p-4 @container/role">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Role
          </h3>
          <div className="space-y-2">
            {isAdmin && !settingsPage ? (
              <div className="flex flex-col gap-2 @lg/role:flex-row">
                <Select
                  value={selectedRole ?? undefined}
                  onValueChange={async (value) => {
                    setSelectedRole(value);

                    if (value === role) {
                      return;
                    }

                    const result = await change_role(activeUser.id, value);

                    if (!result.success) {
                      toast.error("Failed to update role");
                      setSelectedRole(role);
                      return;
                    }

                    setRole(value);
                    toast.success("Role updated successfully");
                  }}
                >
                  <SelectTrigger className="w-full">
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full @lg/role:w-fit"
                  onClick={handleImpersonateUser}
                  disabled={isImpersonatingUser || isSelectedUserCurrentUser}
                >
                  <Eye />
                  {isImpersonatingUser ? "Opening..." : "View as"}
                </Button>
              </div>
            ) : (
              <p className="text-base font-medium">{roleLabel}</p>
            )}
          </div>
        </div>
        {isAdmin ? (
          <div className="w-full rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Security
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                className="w-full sm:w-fit"
                onClick={() => setShowPasswordReset(true)}
              >
                Reset Password
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-fit"
                onClick={() => setShowDelete(true)}
              >
                Delete User
              </Button>
            </div>
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
                    <div className="flex flex-row flex-wrap gap-2">
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
