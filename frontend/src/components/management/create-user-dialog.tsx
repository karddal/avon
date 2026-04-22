"use client";

import { AlertCircle, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, startTransition, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserCard from "@/components/user-card";
import {
  type CreateManagedUserRole,
  create_user,
} from "@/lib/actions/auth/create_user";
import ProfileImageUploader from "./profile-image-uploader";

type CreateUserDialogProps = {
  onUserCreated?: () => void;
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  role: "user" as CreateManagedUserRole,
  imageUrl: "",
};

const INITIAL_CREATED_USER = {
  fullName: "",
  email: "",
  roleLabel: "",
  temporaryPassword: "",
  imageUrl: "",
};

export default function CreateUserDialog({
  onUserCreated,
}: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState(INITIAL_CREATED_USER);

  const isValid = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.email.trim().length > 0
    );
  }, [form]);

  function updateField<K extends keyof typeof INITIAL_FORM>(
    field: K,
    value: (typeof INITIAL_FORM)[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
  }

  function resetSuccessState() {
    setShowTemporaryPassword(false);
    setCreatedUser(INITIAL_CREATED_USER);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && !submitting) {
      resetForm();
      resetSuccessState();
    }
  }

  async function handleCopyTemporaryPassword() {
    try {
      await navigator.clipboard.writeText(createdUser.temporaryPassword);
      toast.success("Temporary password copied");
    } catch {
      toast.error("Failed to copy temporary password");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || submitting) {
      return;
    }

    setSubmitting(true);

    const result = await create_user(form);

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to create user");
      return;
    }

    startTransition(() => {
      onUserCreated?.();
    });

    setCreatedUser({
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim().toLowerCase(),
      roleLabel: form.role === "lecturer" ? "Lecturer" : "Student",
      temporaryPassword: result.temporaryPassword ?? "",
      imageUrl: form.imageUrl,
    });
    setShowTemporaryPassword(false);
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        Create user
      </Button>

      <DialogContent className="sm:max-w-[640px]">
        {createdUser.temporaryPassword ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>User created</DialogTitle>
              <DialogDescription>
                Save the temporary password now. Treat it like a one-time
                credential.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-destructive">
                    Important
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    This temporary password is only shown here after account
                    creation. Make sure it is copied and shared securely with
                    the user.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <UserCard
                id="created-user-preview"
                name={createdUser.fullName}
                image={createdUser.imageUrl}
                email={createdUser.email}
                user_role={createdUser.roleLabel === "Lecturer"}
              />
              <p className="text-sm text-muted-foreground">
                Role:{" "}
                <span className="font-medium text-foreground">
                  {createdUser.roleLabel}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temporary-password">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="temporary-password"
                  type={showTemporaryPassword ? "text" : "password"}
                  value={createdUser.temporaryPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => void handleCopyTemporaryPassword()}
                  aria-label="Copy temporary password"
                >
                  <Copy />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setShowTemporaryPassword((current) => !current)
                  }
                  aria-label={
                    showTemporaryPassword
                      ? "Hide temporary password"
                      : "Show temporary password"
                  }
                >
                  {showTemporaryPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  resetSuccessState();
                }}
              >
                Create another user
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create user</DialogTitle>
              <DialogDescription>
                Add a new management user account.
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-6"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-user-first-name">First Name</Label>
                  <Input
                    id="create-user-first-name"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    placeholder="Jane"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-user-last-name">Last Name</Label>
                  <Input
                    id="create-user-last-name"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    placeholder="Doe"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-user-email">Email</Label>
                  <Input
                    id="create-user-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="jane.doe@bris.ac.uk"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-user-role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value: CreateManagedUserRole) =>
                      updateField("role", value)
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="create-user-role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <ProfileImageUploader
                  imageUrl={form.imageUrl}
                  name={`${form.firstName || "New"} ${form.lastName || "User"}`.trim()}
                  buttonLabel="Upload profile picture"
                  disabled={submitting}
                  onUploaded={async (imageUrl) => {
                    updateField("imageUrl", imageUrl);
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid || submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create user"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
