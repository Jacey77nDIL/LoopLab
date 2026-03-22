import React, { useRef, useEffect } from "react";

export default function MiniPreview({ code }: { code: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!code) return;

        // Create an isolated HTML document loading the current game JS
        // Note: the game might draw its own background, but we can set a light default body.
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Game Preview</title>
  <style>
    body { margin: 0; padding: 0; background: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
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
        document.body.innerHTML = '<div style="color:red; font-family:sans-serif; padding:20px;"><h2>Game Error</h2><pre>' + err.toString() + '</pre></div>';
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
    }, [code]);

    if (!code) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-arcade-panel)] border-2 border-dashed border-[var(--color-arcade-border)] w-full h-full p-4 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-arcade-cyan)] opacity-70"></div>
                <div className="text-[var(--color-arcade-cyan)] font-mono text-sm tracking-widest uppercase animate-pulse">
                    &gt; WAITING_FOR_DATA_STREAM...
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[var(--color-arcade-panel)] border-crt shadow-neon-cyan relative p-2 overflow-hidden w-full h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-arcade-cyan)] opacity-70 z-10"></div>

            <div className="flex-1 relative bg-white border border-[var(--color-arcade-border)] shadow-inner">
                <iframe
                    ref={iframeRef}
                    className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
                    title="Live Game Preview"
                    sandbox="allow-scripts"
                />
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-[var(--color-arcade-text)] font-mono uppercase tracking-widest px-2">
                <span className="text-[var(--color-arcade-neon)] animate-pulse shadow-neon-green drop-shadow-sm">[ MODULE_ONLINE ]</span>
                <button
                    onClick={() => {
                        if (iframeRef.current) {
                            iframeRef.current.src = iframeRef.current.src;
                        }
                    }}
                    className="hover:text-[var(--color-arcade-cyan)] hover:bg-[#e6f9ff] text-[var(--color-arcade-text)] transition-colors border border-[var(--color-arcade-border)] px-2 py-1"
                >
                    &gt; FLUSH_CACHE
                </button>
            </div>
        </div>
    );
}
