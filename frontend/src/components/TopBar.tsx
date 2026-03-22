import React from "react";
import { LogOut, Play } from "lucide-react";

export default function TopBar({ promptCount, promptLimit, onRun, onLogout }: any) {
    return (
        <div className="h-14 bg-gray-900 text-white flex items-center justify-between px-6 border-b border-gray-700">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold text-lg">AI Game Challenge</h1>
                <span className="bg-gray-800 text-gray-300 text-sm px-2 py-1 rounded">game.js</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-sm">
                    Prompts:
                    <span className={`ml-2 font-bold ${promptCount >= promptLimit ? 'text-red-400' : 'text-green-400'}`}>
                        {promptLimit - promptCount} remaining
                    </span>
                </div>

                <button
                    onClick={onRun}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition px-4 py-1.5 rounded-md font-medium text-sm"
                >
                    <Play size={16} />
                    Run
                </button>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
}
