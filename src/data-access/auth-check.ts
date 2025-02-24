import "server-only";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

export async function authCheck(): Promise<Session | null> {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return session;
}
