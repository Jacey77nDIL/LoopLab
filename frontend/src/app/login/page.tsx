"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        router.prefetch("/ide");
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await loginUser(email, password);
            router.push("/ide");
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[var(--background)]">
            <div className="w-full max-w-md bg-[var(--color-arcade-panel)] border-crt rounded-none shadow-neon-cyan p-8 relative overflow-hidden">
                {/* Decorative retro elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-arcade-cyan)] opacity-70"></div>

                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-mono tracking-widest text-[var(--color-arcade-cyan)] shadow-neon-cyan drop-shadow-sm">
                        SYS.LOGIN
                    </h1>
                    <p className="text-[var(--color-arcade-text)] font-sans text-sm uppercase tracking-widest opacity-80">
                        Authenticate to enter workspace
                    </p>
                </div>

                {error && (
                    <div className="bg-[#ffe6e6] border-l-4 border-l-[var(--color-arcade-warning)] text-[var(--color-arcade-warning)] px-4 py-3 font-mono text-sm mb-6 animate-pulse">
                        &gt; {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[var(--color-arcade-text)] uppercase tracking-wider">
                            Identify (Email)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--color-arcade-dark)] border-b-2 border-b-[var(--color-arcade-border)] text-[var(--color-arcade-text)] font-mono focus:outline-none focus:border-b-[var(--color-arcade-cyan)] transition-colors"
                            placeholder="admin@arcade.net"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[var(--color-arcade-text)] uppercase tracking-wider">
                            Passphrase
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--color-arcade-dark)] border-b-2 border-b-[var(--color-arcade-border)] text-[var(--color-arcade-text)] font-mono tracking-widest focus:outline-none focus:border-b-[var(--color-arcade-cyan)] transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-transparent border-2 border-[var(--color-arcade-cyan)] text-[var(--color-arcade-cyan)] font-mono tracking-widest uppercase hover:bg-[var(--color-arcade-cyan)] hover:text-white py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-neon-cyan"
                    >
                        {loading ? "[ AUTHENTICATING... ]" : "[ INITIATE LINK ]"}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs font-mono text-[var(--color-arcade-text)] uppercase">
                    New operator?{" "}
                    <Link href="/signup" className="text-[var(--color-arcade-magenta)] hover:text-[var(--color-arcade-cyan)] transition-colors">
                        Register Code
                    </Link>
                </div>
            </div>
        </div>
    );
}
