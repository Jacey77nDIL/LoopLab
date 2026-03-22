import React, { useState } from "react";
import { Send } from "lucide-react";

export default function ChatPanel({ promptCount, promptLimit, onSend, isProcessing, history }: any) {
    const [input, setInput] = useState("");
    const isLimitReached = promptCount >= promptLimit;
    const disabled = isLimitReached || isProcessing;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <div className={`w-80 border-l border-gray-700 flex flex-col bg-gray-900 ${isLimitReached ? 'opacity-80' : ''}`}>
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <h2 className="font-semibold text-gray-200">AI Assistant</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.map((msg: any, i: number) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'} whitespace-pre-wrap`}>
                            {msg.content}
                        </div>
                        {msg.role === 'ai' && msg.summary && (
                            <div className="text-xs text-green-400 mt-1 pl-1">✓ {msg.summary}</div>
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex items-start">
                        <div className="bg-gray-800 text-gray-400 p-3 rounded-lg text-sm animate-pulse">
                            AI is writing code...
                        </div>
                    </div>
                )}
            </div>

            {isLimitReached && (
                <div className="px-4 py-2 bg-red-900/40 text-red-400 text-xs text-center border-t border-red-900/50">
                    Prompt limit reached. Editor is locked.
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={disabled}
                        placeholder={isLimitReached ? "Limit reached" : "Ask AI to change the game..."}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-10 text-sm text-gray-200 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        rows={3}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        className="absolute bottom-3 right-3 text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
