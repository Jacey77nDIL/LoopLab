"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { fetchPublicGame } from "@/lib/api";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";

export default function PlayGamePage() {
    const params = useParams();
    const username = params.username as string;

    const [code, setCode] = useState<string | null>(null);
    const [error, setError] = useState("");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { theme, resolvedTheme } = useTheme();

    useEffect(() => {
        if (!username) return;
        fetchPublicGame(username)
            .then(data => setCode(data.game_file_content))
            .catch(err => setError(err.message));
    }, [username]);

    useEffect(() => {
        if (!code) return;

        const isDark = (theme === "dark" || resolvedTheme === "dark");
        const bgColor = isDark ? "#000000" : "#ffffff";
        const txtColor = isDark ? "#ffffff" : "#000000";

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${username}'s Simulation</title>
  <style>
    body { margin: 0; padding: 0; background: ${bgColor}; color: ${txtColor}; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; transition: background-color 0.3s; }
    canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script>
    (function() {
      try {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ${code}
        
        if (typeof config !== 'undefined') {
          canvas.width = config.width || 800;
          canvas.height = config.height || 600;
        }

        let lastTime = 0;
        function loop(timestamp) {
          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;
          
          if (typeof update === 'function') update();
          if (typeof render === 'function') render(ctx);
          if (typeof drawHUD === 'function') drawHUD(ctx);
          
          requestAnimationFrame(loop);
        }
        
        requestAnimationFrame(loop);
      } catch (err) {
        console.error("Game Execution Error:", err);
        document.body.innerHTML = '<div style="color:red; font-family:sans-serif; padding:20px;"><h2>System Collapse</h2><pre>' + err.toString() + '</pre></div>';
      }
    })();
  </script>
</body>
</html>
        `;
        const blob = new Blob([html], { type: 'text/html' });
        if (iframeRef.current) {
            iframeRef.current.src = URL.createObjectURL(blob);
        }
    }, [code, theme, resolvedTheme, username]);

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center font-mono text-[var(--color-arcade-warning)] animate-pulse p-8 text-center text-xl tracking-widest uppercase">
                <div className="shadow-neon-magenta p-8 border border-[var(--color-arcade-warning)] bg-[var(--color-arcade-warning-bg)]">
                    [ FATAL ERROR ]<br /><br />{error}
                </div>
            </div>
        );
    }

    if (!code) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-mono text-[var(--color-arcade-cyan)] animate-pulse p-8 text-xl tracking-widest uppercase shadow-neon-cyan">
                INITIALIZING SIMULATION ENVIRONMENT...
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-[var(--background)] relative transition-colors">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0 absolute inset-0"
                title={`${username}'s Game`}
                sandbox="allow-scripts"
            />
        </div>
    );
}
