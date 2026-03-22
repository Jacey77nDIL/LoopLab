"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/ide");
    } else {
      router.push("/signup");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--background)] text-[var(--color-arcade-neon)] tracking-widest font-mono text-xl uppercase">
      <div className="animate-pulse">Loading Workspace...</div>
    </div>
  );
}
