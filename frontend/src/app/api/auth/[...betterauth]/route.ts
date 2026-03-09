// Disallow body parsing, we will parse it manually

import { auth } from "@/lib/auth";

export const GET = auth.handler;
export const POST = auth.handler;
