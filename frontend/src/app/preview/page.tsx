"use client";

import { useEffect, useState, useRef } from "react";
import { fetchProject } from "@/lib/api";

export default function Preview() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadCode();
  }, []);

  const loadCode = async () => {
    try {
      const data = await fetchProject();
      setCode(data.game_file_content);
    } catch (err) {
      setError(true);
    }
  };

  useEffect(() => {
    if (code && iframeRef.current) {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Game Preview</title>
  <style>
    body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
    canvas { display: block; border: 1px solid #333; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script>
    // Create a safe environment block to hold the game content
    (function() {
      try {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ${code}
        
        // Bootstrapping the provided game structure
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
    }
  }, [code]);

  if (error) {
    return <div className="text-white bg-red-900 p-4">Error loading project preview. You might need to log in again.</div>;
  }

  if (!code) {
    return <div className="p-4 bg-gray-900 text-white h-screen flex text-center justify-center items-center">Loading Preview...</div>;
  }

  return (
    <div className="w-full h-screen bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none"
        title="Game Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
}
