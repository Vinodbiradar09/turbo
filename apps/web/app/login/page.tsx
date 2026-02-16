"use client";
import { signIn } from "@repo/auth/client";
import { useState } from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL:`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`,
      });
    } catch (error) {
      console.log("error in google signin", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL:`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`,
      });
    } catch (error) {
      console.log("error in github", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in</h2>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full rounded-lg bg-white px-4 py-2 text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            Continue with Google
          </button>
          <button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white shadow hover:bg-gray-800 disabled:opacity-50"
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
