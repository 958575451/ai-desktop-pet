export type Emotion =
    | "happy"
    | "neutral"
    | "sad"
    | "grumpy"
    | "sleepy"
    | "excited"
    | "shy"
    | "jealous";

export type PetState = {
    energy: number;       // 0-100
    mood: number;         // -100..100
    hunger: number;       // 0-100 (越高越饿)
    boredom: number;      // 0-100
    attachment: number;   // 0-100
    trust: number;        // 0-100
    lastInteractionAt: number; // epoch ms
};

export type PetAction =
    | { type: "pet" }
    | { type: "feed" }
    | { type: "play" }
    | { type: "work_mode_on" }
    | { type: "work_mode_off" };

export type TickOutput = {
    state: PetState;
    // 低频冒泡：有就显示，没有就 null
    bubble: null | { text: string; emotion: Emotion };
};
