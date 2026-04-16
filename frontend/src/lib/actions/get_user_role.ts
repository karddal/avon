"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { getRequestJWT } from "../auth-utils";

interface AuthUser {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: string; // optional fotr casting, but should always be there in the db
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | Date | null;
}

// Escentially it returns the role, but the interface that it returns is to trestrivctive so, cast to new type / interface and access it then
// But that means that this new interface can have role as null or undefined (in order to do the cast), so we need to handle it in return (should never happend tho cos role is always there in the db)
export async function get_user_role(userId: string): Promise<string> {
  await getRequestJWT();
  try {
    const response = await auth.api.getUser({
      query: {
        id: userId,
      },
      headers: await headers(),
    });
    const newUserInterface: AuthUser = response;
    return newUserInterface.role ?? "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "error";
  }
}
