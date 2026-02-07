import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth-utils";
import { getInitials } from "@/components/user-card";
import Image from "next/image";
import { Button } from "../ui/button";

export default async function AccountSettings() {
  const s = await requireSession();
  const image = s.user.image ?? "";
  const role = s.user.role === "admin" ? "Admin" : (s.user.role === "student" ? "Student" : "Lecturer")

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[5/1] overflow-hidden rounded-lg bg-muted">
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
            {getInitials(s.user.name)}
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
            <p className="text-base font-medium">{s.user.name}</p>
            </div>

            <div>
            <p className="text-sm text-muted-foreground">Email address</p>
            <p className="text-base font-medium">{s.user.email}</p>
            </div>

        </div>
        {/* <div className="mt-8 px-6"> */}
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Security
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
            Reset your password by email.
            </p>

            <Button
            variant="outline"
            className="mt-3 w-full sm:w-fit"
            // onClick={}
            >
            Reset Password
            </Button>
        </div>
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Role
            </h3>
            <p className="text-base font-medium">{role}</p>

            {role === "Admin" && (
                <Button
                variant="outline"
                className="w-fit justify-self-end mt-3"
                >
                Change Role
                </Button>
            )}
        </div>
        {role === "Admin" ? (
            <div className="rounded-md border border-border p-4">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Deletion
                </h3>   
                    <Button
                    variant="outline"
                    className="mt-3 w-full sm:w-fit"
                    // onClick={}
                    >
                    Delete User
                    </Button>
            </div>
        ) : (
            <></>
        )}
      </div>

    </div>
  );
}
