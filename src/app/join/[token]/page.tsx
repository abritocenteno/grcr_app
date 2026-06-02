"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupInfo = useQuery(
    api.groups.getGroupByToken,
    isAuthenticated ? { token } : "skip"
  );
  const joinByToken = useMutation(api.groups.joinByToken);

  // Redirect to sign-in if not authenticated, preserving the return URL
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/sign-in?redirect_url=/join/${token}`);
    }
  }, [authLoading, isAuthenticated, token, router]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await joinByToken({ token });
      router.replace("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setJoining(false);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-bg dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
      </div>
    );
  }

  if (groupInfo === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-bg dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
      </div>
    );
  }

  if (groupInfo === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-warm-bg dark:bg-gray-950 px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-base font-bold text-warm-text dark:text-gray-100">Invalid invite link</p>
        <p className="text-sm text-warm-subtle dark:text-gray-500 mt-2">This link may have expired or doesn't exist.</p>
        <button
          onClick={() => router.replace("/")}
          className="mt-6 px-6 h-12 rounded-2xl bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900 font-bold text-sm"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-warm-bg dark:bg-gray-950 px-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center mb-5">
        <svg className="w-12 h-12 text-warm-subtle dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>

      <p className="text-xl font-extrabold text-warm-text dark:text-gray-100">
        Join {groupInfo.name}
      </p>
      <p className="text-sm text-warm-subtle dark:text-gray-500 mt-2">
        {groupInfo.memberCount} member{groupInfo.memberCount !== 1 ? "s" : ""} · shared grocery lists
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 w-full mt-8 max-w-xs">
        <button
          onClick={handleJoin}
          disabled={joining}
          className={[
            "w-full h-14 rounded-2xl font-bold text-sm",
            "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
            "transition-all duration-150 active:scale-[0.98]",
            "disabled:opacity-50",
          ].join(" ")}
        >
          {joining ? "Joining…" : `Join ${groupInfo.name}`}
        </button>
        <button
          onClick={() => router.replace("/")}
          className="text-sm text-warm-subtle dark:text-gray-500 font-medium h-10"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
