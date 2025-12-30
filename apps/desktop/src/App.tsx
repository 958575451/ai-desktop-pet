import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Bubble = { id: string; text: string };

export default function App() {
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

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

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragOffset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const x = e.clientX - dragOffset.current.dx;
    const y = e.clientY - dragOffset.current.dy;
    setPos({ x, y });
  };

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, pos.x, pos.y]);

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

  return (
    <div className="stage">
      <div
        className="pet"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onMouseDown={onMouseDown}
        onDoubleClick={popBubble}
        title="双击我喵～"
      >
        {bubble && <div className="bubble">{bubble.text}</div>}
        <div className="catFace" />
      </div>

      <div className="hint">
        双击小猫：说句话；拖拽：移动位置
      </div>
    </div>
  );
}
