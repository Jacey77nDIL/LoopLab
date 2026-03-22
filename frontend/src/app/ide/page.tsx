"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProject, sendPrompt, logoutUser } from "@/lib/api";
import TopBar from "@/components/TopBar";
import dynamic from "next/dynamic";

const MiniPreview = dynamic(() => import("@/components/MiniPreview"), {
    loading: () => <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse bg-black">Booting Workspace...</div>,
    ssr: false
});

const ChatPanel = dynamic(() => import("@/components/ChatPanel"), {
    loading: () => <div className="w-80 border-l border-gray-700 bg-gray-900 flex items-center justify-center text-gray-500 animate-pulse">Initializing Comm Link...</div>,
    ssr: false
});

export default function IDE() {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const data = await fetchProject();
            setProject(data);

            // Hydrate local chat history matching this user's project
            try {
                const storedHistory = localStorage.getItem(`chat_history_${data.id}`);
                if (storedHistory) {
                    setHistory(JSON.parse(storedHistory));
                }
            } catch (e) {
                console.error("Failed to parse local history");
            }
        } catch (err) {
            router.push("/login");
        }
    };

    const handleSendPrompt = async (promptMsg: string) => {
        if (!project || project.prompt_count >= project.prompt_limit) return;

        setHistory((prev: any[]) => [...prev, { role: "user", content: promptMsg }]);
        setIsProcessing(true);
        setError("");

        try {
            const data = await sendPrompt(promptMsg);
            setProject((prev: any) => ({
                ...prev,
                game_file_content: data.game_file_content,
                prompt_count: data.prompt_count
            }));
            setHistory((prev: any[]) => [...prev, { role: "ai", content: "Updates applied.", summary: data.summary }]);
        } catch (err: any) {
            setError(err.message || "Failed to contact AI.");
            setHistory((prev: any[]) => [...prev, { role: "ai", content: "Error: " + (err.message || "Unknown") }]);
            // Reload project to get correct prompt count if it was incremented
            await loadProject();
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto-save history when it updates
    useEffect(() => {
        if (project?.id && history.length > 0) {
            localStorage.setItem(`chat_history_${project.id}`, JSON.stringify(history));
        }
    }, [history, project?.id]);

    const handleRun = () => {
        window.open("/preview", "_blank");
    };

    const handleLogout = () => {
        logoutUser();
        router.push("/login");
    };

    if (!project) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--background)] text-[var(--color-arcade-neon)] font-mono text-xl animate-pulse tracking-widest uppercase">
                &gt; INITIALIZING_WORKSPACE...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden">
            <TopBar
                promptCount={project.prompt_count}
                promptLimit={project.prompt_limit}
                onRun={handleRun}
                onLogout={handleLogout}
            />

            {error && (
                <div className="bg-[#ffe6e6] border-y-2 border-[var(--color-arcade-warning)] text-[var(--color-arcade-warning)] text-sm px-6 py-2 text-center font-mono font-bold tracking-widest uppercase animate-pulse z-20 shadow-[0_0_15px_#ff0000]">
                    [SYS_ERROR] {error}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative p-4 gap-4">
                <main className="flex-1 bg-transparent relative flex">
                    <MiniPreview code={project.game_file_content} />
                </main>

                <ChatPanel
                    promptCount={project.prompt_count}
                    promptLimit={project.prompt_limit}
                    onSend={handleSendPrompt}
                    isProcessing={isProcessing}
                    history={history}
                />
            </div>
        </div>
    );
}
