"use client";

import { useSession, signOut } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isPending && !session) {
        console.log("session" , isPending , session);
      router.push("/login");
    }
  }, [session, isPending, router]);

  const Data = async () => {
    if (!session) return;
    console.log("debug");
    console.log("debug session" , session);
    try {
      const response = await fetch("http://localhost:4000/api/v1/users", {
        method : "GET",
        credentials : "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();
      setData(res);
    } catch (error) {
      console.log("error in data fetching", error);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    <div>
        Session not found
    </div>
    return null;
  }

    return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
        
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
          <p className="mt-2 text-gray-600">{session.user.email}</p>
        </div>

        <div className="mt-4">
          <button
            onClick={Data}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Test API Call
          </button>
          
          {data && (
            <div className="mt-4 rounded-lg bg-gray-100 p-4">
              <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
