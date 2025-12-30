import type { PetAction, PetState, TickOutput, Emotion } from "./types";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function emotionFrom(state: PetState): Emotion {
  if (state.energy < 20) return "sleepy";
  if (state.mood < -40) return "grumpy";
  if (state.hunger > 70) return "sad";
  if (state.attachment > 70 && state.mood > 20) return "happy";
  return "neutral";
}

function maybeBubble(state: PetState): TickOutput["bubble"] {
  // 基础冒泡概率：很低，避免吵
  let p = 0.02;

  // 状态驱动提高概率
  if (state.hunger > 75) p += 0.08;
  if (state.boredom > 75) p += 0.06;
  if (Date.now() - state.lastInteractionAt > 1000 * 60 * 5) p += 0.05; // 5分钟没理

  if (Math.random() > p) return null;

  const emo = emotionFrom(state);

  const lines: Record<Emotion, string[]> = {
    happy: ["喵～我好喜欢你。", "你在我就安心。", "摸摸我嘛！"],
    neutral: ["喵。", "我在这儿陪你。", "要不要理理我？"],
    sad: ["我有点饿……", "可以给我点吃的吗？", "肚子咕咕叫。"],
    grumpy: ["哼……", "你刚才不理我。", "我有点不开心。"],
    sleepy: ["我先眯一会儿…", "喵…困困。", "我想睡觉。"],
    excited: ["走！玩一下！", "喵喵喵！", "我超有精神！"],
    shy: ["你、你别一直盯着我啦…", "喵…有点害羞。", "嗯…"],
    jealous: ["你是不是在看别的小猫？", "哼，我也要关注。", "喵…我吃醋了。"]
  };

  return { text: pick(lines[emo]), emotion: emo };
}

export function createPet(seed?: Partial<PetState>) {
  let state: PetState = {
    energy: 70,
    mood: 10,
    hunger: 20,
    boredom: 20,
    attachment: 40,
    trust: 40,
    lastInteractionAt: Date.now(),
    ...seed,
  };

  let workMode = false;

  function apply(action: PetAction) {
    const now = Date.now();
    state.lastInteractionAt = now;

    switch (action.type) {
      case "pet":
        state.mood = clamp(state.mood + 12, -100, 100);
        state.attachment = clamp(state.attachment + 2, 0, 100);
        state.boredom = clamp(state.boredom - 10, 0, 100);
        break;
      case "feed":
        state.hunger = clamp(state.hunger - 35, 0, 100);
        state.mood = clamp(state.mood + 6, -100, 100);
        state.energy = clamp(state.energy + 4, 0, 100);
        break;
      case "play":
        state.boredom = clamp(state.boredom - 35, 0, 100);
        state.energy = clamp(state.energy - 12, 0, 100);
        state.mood = clamp(state.mood + 10, -100, 100);
        break;
      case "work_mode_on":
        workMode = true;
        break;
      case "work_mode_off":
        workMode = false;
        break;
    }
  }

  function tick(dtSec = 1): TickOutput {
    // 基础代谢
    state.hunger = clamp(state.hunger + 2 * dtSec, 0, 100);
    state.boredom = clamp(state.boredom + 1.5 * dtSec, 0, 100);
    state.energy = clamp(state.energy - 1.2 * dtSec, 0, 100);

    // 心情受饥饿/无聊影响
    state.mood = clamp(
      state.mood
        - (state.hunger > 70 ? 1.6 * dtSec : 0)
        - (state.boredom > 75 ? 1.2 * dtSec : 0)
        + (state.energy > 60 ? 0.2 * dtSec : 0),
      -100,
      100
    );

    // 工作模式：更安静（大幅降低冒泡概率）
    const bubble = workMode ? (Math.random() < 0.005 ? maybeBubble(state) : null) : maybeBubble(state);

    return { state: { ...state }, bubble };
  }

  return { apply, tick, getState: () => ({ ...state }) };
}
