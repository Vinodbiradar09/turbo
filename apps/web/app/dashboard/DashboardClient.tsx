"use client";

import { signOut } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AuthSession } from "@repo/auth";

interface Props {
  session: AuthSession;
  initialUsers: any;
}

export default function DashboardClient({ session, initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [newName, setNewName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const fetchUsers = () => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/v1/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        setUsers(await res.json());
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users.");
      }
    });
  };

  const generateName = () => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/v1/users/name", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setNewName(data.name);
      } catch (err) {
        console.error(err);
        setError("Failed to generate name.");
      }
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Welcome, {session.user.name}!
          </h2>
          <p className="mt-2 text-gray-600">{session.user.email}</p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {users && (
          <div className="mt-4 rounded-lg bg-gray-100 p-4">
            <pre className="text-sm">{JSON.stringify(users, null, 2)}</pre>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchUsers}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Loading..." : "Refresh Users"}
          </button>

          <button
            onClick={generateName}
            disabled={isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? "Generating..." : "Generate Name"}
          </button>
        </div>

        {newName && (
          <div className="mt-4 rounded-lg bg-gray-100 p-4">
            <p className="font-medium">{newName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
