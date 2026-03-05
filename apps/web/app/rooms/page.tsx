import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { redirect } from "next/navigation";
import RoomsDashboard from "./RoomDashboard";
import { Metadata } from "next";

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const cookieHeader = (await headers()).get("cookie") ?? "";

  return (
    <RoomsDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      cookieHeader={cookieHeader}
    />
  );
}

export const metadata: Metadata = {
  title: "Circl — Your Radius",
  description: "Create or discover anonymous rooms near you.",
};
