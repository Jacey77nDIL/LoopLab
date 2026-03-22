"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProject, sendPrompt, logoutUser } from "@/lib/api";
import TopBar from "@/components/TopBar";
import CodeViewer from "@/components/CodeViewer";
import ChatPanel from "@/components/ChatPanel";

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

    const handleRun = () => {
        window.open("/preview", "_blank");
    };

    const handleLogout = () => {
        logoutUser();
        router.push("/login");
    };

    if (!project) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
            <TopBar
                promptCount={project.prompt_count}
                promptLimit={project.prompt_limit}
                onRun={handleRun}
                onLogout={handleLogout}
            />

            {error && (
                <div className="bg-red-600 text-white text-sm px-4 py-2 text-center">
                    {error}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 bg-[#1e1e1e] relative">
                    <CodeViewer code={project.game_file_content} />
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
