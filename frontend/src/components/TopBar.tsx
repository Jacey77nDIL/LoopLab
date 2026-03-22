import React from "react";
import { LogOut, Play } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ promptCount, promptLimit, onRun, onLogout }: any) {
    const isLimitReached = promptCount >= promptLimit;

    return (
        <div className="h-16 bg-[var(--color-arcade-panel)] text-[var(--color-arcade-text)] flex items-center justify-between px-6 border-b-2 border-b-[var(--color-arcade-cyan)] shadow-neon-cyan relative z-10 transition-colors">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h1 className="font-mono text-xl font-bold tracking-widest text-[var(--color-arcade-heading)] drop-shadow-md">SYS.WORKSPACE //</h1>
                    <span className="text-[var(--color-arcade-cyan)] text-[10px] font-mono tracking-[0.2em] uppercase">Phase: Construction</span>
                </div>
                <div className="bg-[var(--color-arcade-active-bg)] border border-[var(--color-arcade-border)] text-[var(--color-arcade-neon)] font-mono text-xs px-3 py-1.5 flex items-center gap-2 shadow-neon-green">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-arcade-neon)] animate-pulse"></span>
                    ACTIVE_LINK
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 text-[var(--color-arcade-magenta)] font-mono font-bold text-2xl tracking-[0.3em] uppercase drop-shadow-md pointer-events-none whitespace-nowrap">
                TIC Tech Week
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center mr-4">
                    <ThemeToggle />
                </div>
                <div className="flex flex-col items-end font-mono">
                    <span className="text-[10px] text-[var(--color-arcade-text)] opacity-70 uppercase tracking-widest">Capacitor Charge</span>
                    <span className={`text-base font-bold tracking-widest ${isLimitReached ? 'text-[var(--color-arcade-warning)] animate-pulse' : 'text-[var(--color-arcade-magenta)] shadow-neon-magenta'}`}>
                        [{promptLimit - promptCount} CYCLES REMAINING]
                    </span>
                </div>

                <div className="flex items-center gap-4 border-l border-[var(--color-arcade-border)] pl-8">
                    <button
                        onClick={onRun}
                        className="flex items-center gap-2 bg-transparent border-2 border-[var(--color-arcade-neon)] text-[var(--color-arcade-neon)] hover:bg-[var(--color-arcade-neon)] hover:text-[var(--color-arcade-panel)] shadow-neon-green transition-all px-6 py-2 font-mono text-sm tracking-widest uppercase"
                    >
                        <Play size={14} className="fill-current" />
                        Execute
                    </button>

                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center p-2 text-gray-500 hover:text-[var(--color-arcade-warning)] transition-colors"
                        title="Disconnect"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
