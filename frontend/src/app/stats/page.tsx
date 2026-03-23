"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Users, Code, Cpu } from "lucide-react";
import { fetchPlatformStats } from "@/lib/api";

// Animated Counter Hook/Component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const targetValue = value;

    useEffect(() => {
        if (targetValue === 0 && countRef.current === 0) return;

        const startTime = performance.now();
        const startValue = countRef.current;
        const change = targetValue - startValue;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.floor(startValue + change * easeProgress);
            setCount(currentCount);
            countRef.current = currentCount;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(targetValue);
                countRef.current = targetValue;
            }
        };

        requestAnimationFrame(animate);
    }, [targetValue, duration]);

    return <span>{count.toLocaleString()}</span>;
}

export default function StatsPage() {
    const [stats, setStats] = useState({ users: 0, prompts: 0, lines_of_code: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStats = async () => {
        try {
            const data = await fetchPlatformStats();
            setStats(data);
            setError("");
        } catch (err: any) {
            setError(err.message || "Failed to establish uplink");
            // Auto clear error if it's transient
            setTimeout(() => setError(""), 10000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[var(--background)] relative transition-colors">
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-5xl bg-[var(--color-arcade-panel)] border-crt rounded-none shadow-neon-cyan p-8 md:p-12 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-arcade-cyan)] opacity-70"></div>

                <div className="text-center space-y-2 mb-16">
                    <h1 className="text-5xl font-mono tracking-widest text-[var(--color-arcade-cyan)] shadow-neon-cyan drop-shadow-md uppercase">
                        SYS.TELEMETRY
                    </h1>
                    <p className="text-[var(--color-arcade-text)] font-sans text-sm uppercase tracking-widest opacity-80 mt-4">
                        Global Platform Metrics
                    </p>
                </div>

                {error && (
                    <div className="bg-[var(--color-arcade-warning-bg)] border-y-2 border-[var(--color-arcade-warning)] text-[var(--color-arcade-warning)] text-sm px-6 py-3 text-center font-mono font-bold tracking-widest uppercase animate-pulse mb-8 z-20 shadow-neon-magenta transition-colors">
                        [SYS_ERROR] {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Users Stat */}
                    <div className="flex flex-col items-center justify-center p-10 bg-[var(--color-arcade-dark)] border border-[var(--color-arcade-border)] relative group transition-all hover:border-[var(--color-arcade-magenta)] hover:shadow-neon-magenta">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-arcade-magenta)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Users className="text-[var(--color-arcade-magenta)] mb-6" size={48} />
                        <h2 className="text-6xl font-mono text-[var(--color-arcade-text)] font-bold mb-4 tracking-wider">
                            {loading ? "---" : <AnimatedCounter value={stats.users} />}
                        </h2>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">
                            Registered Operators
                        </span>
                    </div>

                    {/* Prompts Stat */}
                    <div className="flex flex-col items-center justify-center p-10 bg-[var(--color-arcade-dark)] border border-[var(--color-arcade-border)] relative group transition-all hover:border-[var(--color-arcade-cyan)] hover:shadow-neon-cyan">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-arcade-cyan)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Cpu className="text-[var(--color-arcade-cyan)] mb-6 animate-pulse" size={48} />
                        <h2 className="text-6xl font-mono text-[var(--color-arcade-text)] font-bold mb-4 tracking-wider">
                            {loading ? "---" : <AnimatedCounter value={stats.prompts} />}
                        </h2>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">
                            AI Cycles Executed
                        </span>
                    </div>

                    {/* Lines of Code Stat */}
                    <div className="flex flex-col items-center justify-center p-10 bg-[var(--color-arcade-dark)] border border-[var(--color-arcade-border)] relative group transition-all hover:border-[var(--color-arcade-neon)] hover:shadow-neon-green">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-arcade-neon)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Code className="text-[var(--color-arcade-neon)] mb-6" size={48} />
                        <h2 className="text-6xl font-mono text-[var(--color-arcade-text)] font-bold mb-4 tracking-wider">
                            {loading ? "---" : <AnimatedCounter value={stats.lines_of_code} />}
                        </h2>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">
                            Constructed Logic Lines
                        </span>
                    </div>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-arcade-neon)] uppercase tracking-widest animate-pulse drop-shadow-sm shadow-neon-green mb-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-arcade-neon)]"></span>
                        LIVE UPLINK ACTIVE
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest">
                        REFRESH FREQUENCY: 15 SECONDS
                    </span>
                </div>
            </div>
        </div>
    );
}
