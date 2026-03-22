"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevents hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8 rounded-full border border-gray-500/30 animate-pulse bg-gray-500/10"></div>;

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center p-2 rounded-full border border-[var(--color-arcade-border)] text-[var(--color-arcade-text)] hover:text-[var(--color-arcade-cyan)] hover:border-[var(--color-arcade-cyan)] transition-colors shadow-neon-cyan bg-[var(--color-arcade-panel)]"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Arcade"}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
