import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createPet, type PetAction, type PetState } from "core";
import "./App.css";

type Bubble = { id: string; text: string; emotion?: string };
type FaceMood = "happy" | "neutral" | "hungry" | "sleepy" | "grumpy" | "excited";
type BubbleSide = "left" | "right";

const appWindow = getCurrentWindow();

function faceFromState(s: PetState): FaceMood {
    if (s.energy < 22) return "sleepy";
    if (s.hunger > 75) return "hungry";
    if (s.mood < -35) return "grumpy";
    if (s.mood > 45 && s.energy > 55) return "happy";
    if (s.mood > 25 && s.boredom < 35) return "excited";
    return "neutral";
}

export default function App() {
    // ===== HUD toggles =====
    const [uiCompact, setUiCompact] = useState(true);
    const [showDebug, setShowDebug] = useState(false);

    // ===== window drag (threshold) =====
    const pointerDown = useRef(false);
    const dragStarted = useRef(false);
    const startPt = useRef<{ x: number; y: number } | null>(null);
    const DRAG_THRESHOLD_PX = 6;

    const startWindowDrag = async () => {
        try {
            await appWindow.startDragging();
        } catch (e) {
            console.error("startDragging failed:", e);
        }
    };

    // ===== core pet =====
    const petRef = useRef(createPet());
    const [state, setState] = useState<PetState>(petRef.current.getState());
    const [faceMood, setFaceMood] = useState<FaceMood>(faceFromState(state));
    const [workMode, setWorkMode] = useState(false);

    // bubble
    const [bubble, setBubble] = useState<Bubble | null>({
        id: "init",
        text: "喵…我醒着呢。你可以摸摸我～",
    });

    // 智能侧边：默认左侧；当 HUD 展开时更倾向左侧；否则也可随机一点
    const [bubbleSide, setBubbleSide] = useState<BubbleSide>("left");

    // auto hide bubble
    useEffect(() => {
        if (!bubble) return;
        const t = window.setTimeout(() => setBubble(null), 5500);
        return () => window.clearTimeout(t);
    }, [bubble?.id]);

    // tick loop
    useEffect(() => {
        const timer = window.setInterval(() => {
            const out = petRef.current.tick(1);
            setState(out.state);
            setFaceMood(faceFromState(out.state));

            if (out.bubble) {
                // 规则：HUD 如果展开（右上更宽），气泡优先左侧，避免遮挡
                const preferLeft = !uiCompact;
                const side: BubbleSide = preferLeft ? "left" : (Math.random() < 0.7 ? "left" : "right");
                setBubbleSide(side);

                setBubble({
                    id: crypto.randomUUID(),
                    text: out.bubble.text,
                    emotion: out.bubble.emotion,
                });
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [uiCompact]);

    const act = (action: PetAction, bubbleText?: string) => {
        petRef.current.apply(action);
        const s = petRef.current.getState();
        setState(s);
        setFaceMood(faceFromState(s));

        if (bubbleText) {
            setBubbleSide(!uiCompact ? "left" : (Math.random() < 0.7 ? "left" : "right"));
            setBubble({ id: crypto.randomUUID(), text: bubbleText });
        }
    };

    const meowOnDoubleClick = useMemo(
        () => ["喵！你叫我吗？", "在在在～", "嗯？怎么啦？", "我刚刚在想你。", "你忙完了吗？"],
        []
    );

    const popMeow = () => {
        const text = meowOnDoubleClick[Math.floor(Math.random() * meowOnDoubleClick.length)];
        setBubbleSide(!uiCompact ? "left" : (Math.random() < 0.7 ? "left" : "right"));
        setBubble({ id: crypto.randomUUID(), text });
    };

    return (
        <div className="stage">
            {/* ===== Cat (fixed position; bubble is absolute overlay; cat NEVER moves) ===== */}
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
                    popMeow();
                }}
                title="双击：叫我；按住拖动：移动窗口"
            >
                {/* Bubble: absolute overlay, does NOT affect layout */}
                {bubble && (
                    <div
                        className={`bubble bubbleTop bubble-${bubbleSide}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            popMeow();
                        }}
                    >
                        {bubble.text}
                        {bubble.emotion ? <span className="bubbleMeta"> ({bubble.emotion})</span> : null}
                    </div>
                )}

                {/* Cat face: fixed 160x160, never shifts */}
                <div className={`catFace face-${faceMood}`} />
            </div>

            {/* ===== Panel (top-right, compact by default) ===== */}
            <div className={`panel ${uiCompact ? "panelCompact" : ""}`} onPointerDown={(e) => e.stopPropagation()}>
                <button className="btn btnIcon" onClick={() => setUiCompact((v) => !v)} title={uiCompact ? "展开动作栏" : "收起动作栏"}>
                    {uiCompact ? "▸" : "▾"}
                </button>

                <button className="btn btnIcon" onClick={() => setShowDebug((v) => !v)} title={showDebug ? "隐藏状态" : "显示状态"}>
                    🧾
                </button>

                <button className="btn" onClick={() => act({ type: "pet" }, "喵～（被摸摸）")} title="抚摸：心情↑ 依恋↑ 无聊↓">
                    摸摸
                </button>
                <button className="btn" onClick={() => act({ type: "feed" }, "咕噜…谢谢！")} title="喂食：饥饿↓ 心情↑">
                    喂食
                </button>
                <button className="btn" onClick={() => act({ type: "play" }, "走！陪我玩！")} title="玩耍：无聊↓ 心情↑ 精力↓">
                    玩耍
                </button>

                <button
                    className="btn btnSecondary"
                    onClick={() => {
                        const next = !workMode;
                        setWorkMode(next);
                        act(
                            { type: next ? "work_mode_on" : "work_mode_off" },
                            next ? "我会乖乖陪你，不吵你。" : "那我可以黏你一点点吗？"
                        );
                    }}
                    title="陪工作：降低主动冒泡频率"
                >
                    {workMode ? "退出陪工" : "陪工作"}
                </button>
            </div>

            {/* ===== Debug (bottom-right) ===== */}
            {showDebug && (
                <div className="debug" onPointerDown={(e) => e.stopPropagation()}>
                    <div className="debugTitle">Miu 状态</div>
                    <div className="kv">energy: {Math.round(state.energy)}</div>
                    <div className="kv">mood: {Math.round(state.mood)}</div>
                    <div className="kv">hunger: {Math.round(state.hunger)}</div>
                    <div className="kv">boredom: {Math.round(state.boredom)}</div>
                    <div className="kv">attachment: {Math.round(state.attachment)}</div>
                    <div className="kv">trust: {Math.round(state.trust)}</div>
                </div>
            )}

            <div className="hint">双击小猫：说句话；按住拖动：移动窗口</div>
        </div>
    );
}
