"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchPublicGames } from "@/lib/api";
import { Terminal, Play } from "lucide-react";

export default function GamesGallery() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchPublicGames();
                setGames(data);
            } catch (err: any) {
                setError(err.message || "Failed to establish connection to public archive");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const launchGame = (username: string) => {
        window.open(`/play/${username}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 transition-colors">
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <div className="max-w-6xl mx-auto space-y-8">
                <header className="border-b-2 border-[var(--color-arcade-border)] pb-6 mb-8 mt-12">
                    <h1 className="text-4xl font-mono text-[var(--color-arcade-cyan)] shadow-neon-cyan uppercase">
                        PUBLIC_ARCHIVE
                    </h1>
                    <p className="text-[var(--color-arcade-text)] opacity-70 font-mono mt-2 tracking-widest text-sm">
                        Browse and execute operator simulations.
                    </p>
                </header>

                {loading ? (
                    <div className="text-center text-[var(--color-arcade-cyan)] animate-pulse font-mono py-20 tracking-widest">
                        &gt; SCANNING_NETWORK...
                    </div>
                ) : error ? (
                    <div className="text-center text-[var(--color-arcade-warning)] font-mono py-20 animate-pulse tracking-widest shadow-neon-magenta">
                        [ERROR] {error}
                    </div>
                ) : games.length === 0 ? (
                    <div className="text-center text-[var(--color-arcade-text)] opacity-60 font-mono py-20">
                        No operators found in the registry.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {games.map((g, i) => (
                            <div key={i} className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] p-6 flex flex-col hover:border-[var(--color-arcade-neon)] hover:shadow-neon-green transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Terminal className="text-[var(--color-arcade-text)] opacity-50 group-hover:text-[var(--color-arcade-neon)] transition-colors" />
                                    <h2 className="text-xl font-mono text-[var(--color-arcade-text)] tracking-wider truncate">
                                        {g.username}
                                    </h2>
                                </div>
                                <div className="text-xs font-mono text-[var(--color-arcade-text)] opacity-60 mb-6 tracking-widest">
                                    CYCLES EXPENDED: <span className="text-[var(--color-arcade-cyan)]">{g.prompt_count}</span>
                                </div>

                                <button
                                    onClick={() => launchGame(g.username)}
                                    className="mt-auto w-full bg-[var(--color-arcade-dark)] border border-[var(--color-arcade-border)] text-[var(--color-arcade-text)] font-mono py-3 flex items-center justify-center gap-2 hover:bg-[var(--color-arcade-neon)] hover:text-black transition-colors uppercase tracking-widest"
                                >
                                    <Play size={16} /> [ EXECUTE ]
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
