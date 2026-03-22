import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

export default function CodeViewer({ code }: { code: string }) {
    const handleEditorDidMount = (editor: any, monaco: any) => {
        // We could add custom theme or behavior here.
        // For now, it's strictly read-only as required.
    };

    return (
        <div className="flex-1 h-full w-full">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code || "// Loading..."}
                onMount={handleEditorDidMount}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "solid",
                    matchBrackets: "never",
                    renderLineHighlight: "none",
                }}
            />
        </div>
    );
}
