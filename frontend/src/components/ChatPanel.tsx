import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

export default function ChatPanel({ promptCount, promptLimit, onSend, isProcessing, history }: any) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLimitReached = promptCount >= promptLimit;
    const isOverLimit = input.trim().length > 400;
    const disabled = isLimitReached || isProcessing || isOverLimit;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isProcessing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <div className={`w-96 border-l-2 border-l-[var(--color-arcade-cyan)] flex flex-col bg-[var(--color-arcade-panel)] relative z-10 ${isLimitReached ? 'opacity-90 grayscale-[0.5]' : ''}`}>

            {/* Header */}
            <div className="p-4 border-b border-[var(--color-arcade-border)] bg-[#f0f0f0]">
                <h2 className="font-mono font-bold tracking-widest text-[var(--color-arcade-magenta)] shadow-neon-magenta text-sm bg-[#ffeeff] inline-block px-3 py-1">
                    [ AI.TERMINAL ]
                </h2>
            </div>

            {/* Readout Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent font-mono text-sm">
                {history.length === 0 && (
                    <div className="text-gray-500 italic text-xs tracking-widest uppercase">
                        &gt; AWAITING INSTRUCTIONS...
                    </div>
                )}
                {history.map((msg: any, i: number) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'user' && (
                            <span className="text-[10px] text-gray-500 tracking-widest mb-1">OPERATOR</span>
                        )}
                        {msg.role === 'ai' && (
                            <span className="text-[10px] text-[var(--color-arcade-magenta)] tracking-widest mb-1">SYS.AI</span>
                        )}
                        <div className={`max-w-[90%] p-3 border-crt ${msg.role === 'user' ? 'bg-[#e6f9ff] text-[var(--color-arcade-cyan)] border-[var(--color-arcade-cyan)] shadow-neon-cyan' : 'bg-[#ffeeff] text-[#990099] border-[var(--color-arcade-magenta)]'} whitespace-pre-wrap tracking-wide leading-relaxed`}>
                            {msg.content}
                        </div>
                        {msg.role === 'ai' && msg.summary && (
                            <div className="text-[10px] text-[var(--color-arcade-neon)] tracking-widest mt-2 px-2 border-l-2 border-[var(--color-arcade-neon)] uppercase">
                                + {msg.summary}
                            </div>
                        )}
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex flex-col items-start mt-4">
                        <span className="text-[10px] text-[var(--color-arcade-magenta)] tracking-widest mb-1">SYS.AI</span>
                        <div className="bg-[#ffeeff] text-[var(--color-arcade-magenta)] border-crt border-[var(--color-arcade-magenta)] p-3 tracking-widest animate-pulse">
                            COMPILING_DATA...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Status Warning */}
            {isLimitReached && (
                <div className="px-4 py-3 bg-[#ffe6e6] text-[#ff0000] text-xs text-center border-t border-[#ffcccc] border-b border-[#ffcccc] font-mono tracking-widest uppercase font-bold animate-pulse">
                    &gt; MAX CAPACITY REACHED &lt;
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t-2 border-[var(--color-arcade-cyan)] bg-[#f0f0f0]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={disabled}
                        placeholder={isLimitReached ? "SYSTEM LOCKED" : "Input override command..."}
                        className="w-full bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] p-4 pr-12 pb-8 text-sm text-[var(--color-arcade-text)] font-mono tracking-wide resize-none focus:outline-none focus:border-[var(--color-arcade-cyan)] focus:shadow-neon-cyan disabled:opacity-50 transition-all"
                        rows={4}
                        maxLength={400}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />

                    {/* Character Counter */}
                    <div className={`absolute bottom-3 left-4 text-[10px] font-mono font-bold tracking-widest uppercase ${input.length >= 400 ? 'text-[#ff0000] shadow-neon-magenta' : 'text-gray-500'}`}>
                        CHAR_COUNT: [{input.length}/400]
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        className="absolute bottom-3 right-3 text-[var(--color-arcade-cyan)] hover:text-black disabled:text-gray-400 transition-colors p-2"
                    >
                        <Send size={18} />
                    </button>

                    {/* Visual Decorator */}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-arcade-cyan)] opacity-50"></div>
                </div>
            </form>
        </div>
    );
}
