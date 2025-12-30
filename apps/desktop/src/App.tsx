import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

type Bubble = { id: string; text: string };

const appWindow = getCurrentWindow();

export default function App() {
    const [bubble, setBubble] = useState<Bubble | null>({
        id: "init",
        text: "喵…你来啦！摸摸我～",
    });

    // 自动淡出气泡
    useEffect(() => {
        if (!bubble) return;
        const t = window.setTimeout(() => setBubble(null), 6000);
        return () => window.clearTimeout(t);
    }, [bubble?.id]);

    const meowLines = useMemo(
        () => [
            "喵喵！你终于理我了～",
            "我刚刚一直在等你诶…",
            "摸摸我嘛！",
            "我有点饿…可以给我点吃的吗？",
            "你工作的时候我会乖乖趴着陪你。",
        ],
        []
    );

    const popBubble = () => {
        const text = meowLines[Math.floor(Math.random() * meowLines.length)];
        setBubble({ id: crypto.randomUUID(), text });
    };

    // ====== 关键：只有“真的在拖动”才 startDragging ======
    const pointerDown = useRef(false);
    const dragStarted = useRef(false);
    const startPt = useRef<{ x: number; y: number } | null>(null);

    const startWindowDrag = async () => {
        try {
            await appWindow.startDragging();
        } catch (e) {
            console.error("startDragging failed:", e);
        }
    };

    const DRAG_THRESHOLD_PX = 6;

    return (
        <div className="stage">
            <div
                className="pet"
                onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    pointerDown.current = true;
                    dragStarted.current = false;
                    startPt.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerMove={(e) => {
                    if (!pointerDown.current || dragStarted.current || !startPt.current) return;

                    const dx = e.clientX - startPt.current.x;
                    const dy = e.clientY - startPt.current.y;
                    if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                        dragStarted.current = true;
                        // 一旦判定为“拖”，交给系统拖拽（这会中断 dblclick，但此时用户就是在拖）
                        startWindowDrag();
                    }
                }}
                onPointerUp={() => {
                    pointerDown.current = false;
                    dragStarted.current = false;
                    startPt.current = null;
                }}
                onPointerCancel={() => {
                    pointerDown.current = false;
                    dragStarted.current = false;
                    startPt.current = null;
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    popBubble();
                }}
                title="双击我喵～（按住并拖动=移动窗口）"
            >
                {bubble && (
                    <div
                        className="bubble"
                        onPointerDown={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => {
                            // 让双击气泡区域也能触发（可选）
                            e.stopPropagation();
                            popBubble();
                        }}
                    >
                        {bubble.text}
                    </div>
                )}
                <div className="catFace" />
            </div>

            <div className="hint">双击小猫：说句话；按住拖动：移动窗口</div>
        </div>
    );
}
