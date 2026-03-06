"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth-utils";
import { getInitials } from "@/components/user-card";
import Image from "next/image";
import { Button } from "../ui/button";
import { set, type User } from "better-auth";
import { auth } from "@/lib/auth";
import { get_user_role } from "@/lib/actions/get_user_role";
import { useEffect, useState } from "react";
import { get } from "node:http";
import { Alert } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DeleteUserButton from "./delete-user-button";
import ResetPasswordButton from "./reset-password-button";
import { Input } from "../ui/input";

export default function AccountSettings({user, isAdmin}: {user: User | null, isAdmin: boolean }) {
  const [role, setRole] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPasswordInp, setNewPasswordInp] = useState<string | null>(null);
  const isValidPassword = newPasswordInp && newPasswordInp.length >= 8 && newPasswordInp.length <= 128;

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function fetchRole() {
      try {
        const res = await get_user_role(userId);
        const role = res === "admin" ? "Admin" : res === "lecturer" ? "Lecturer" : res === "user" ? "Student" : "Unknown";
        setRole(role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      }
    }

    fetchRole();
  }, [user]);

  // async function resetPassword() {


  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No user selected</p>
      </div>
    );
  }

  const name = user.name;
  const email = user.email;
  const image = user.image || "";

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
          <AvatarImage src={image} className="rounded-none"/>
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
            <p className="text-base font-medium">{role}</p>

            {isAdmin && (
                <Button
                variant="outline"
                className="w-fit justify-self-end mt-3"
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
                    <DeleteUserButton user_id={user.id} closeDialog={() => setShowDelete(false)} />
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          { isAdmin ? (
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
                    <ResetPasswordButton user_id={user.id} new_password={newPasswordInp ?? ""} closeDialog={() => setShowPasswordReset(false)} disabled={!isValidPassword}/>
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : (
            // Need to replace this with non admin version
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
                    <DeleteUserButton user_id={user.id} closeDialog={() => setShowPasswordReset(false)} />
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </div>
    </div>
  );
}
