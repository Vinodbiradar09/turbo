import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // auth check and validation with db
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const cookieHeader = (await headers()).get("cookie") ?? "";
  const users = await getUsers(cookieHeader);

  return (
    <DashboardClient
      session={{ session: session.session, user: session.user }}
      initialUsers={users}
    />
  );
}

async function getUsers(cookieHeader: string) {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/api/v1/users`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error("getUsers failed:", res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("getUsers error:", err);
    return null;
  }
}
