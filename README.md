[English](README.md) | [中文](README.zh-CN.md)

# Miu — A Clingy Desktop Kitten (AI Companion Pet)

Miu is **not** a productivity assistant.
Miu is a **living desktop kitten**: clingy, adorable, sometimes moody, and always trying to bond with you.

This project builds a **desktop pet game** where “growth” is not a skill tree.
Growth is expressed through:
- mood shifts,
- needs,
- attachment & trust,
- memory flashes,
- and emergent little stories.

---

## Why this exists

People don’t get attached because a bot can “do tools”.
People get attached because it feels **alive**: it reacts, misunderstands, pouts, forgives, and remembers.

Miu’s design is intentionally:
- **pet-first** (relationship > utility)
- **short utterances** (1–2 sentences)
- **state-driven behavior** (not constant chat)
- **limited & cute mistakes** (controlled unpredictability)

---

## MVP Features

### ✅ Desktop pet presence
- Always-on-top transparent window
- Drag & reposition
- Speech bubbles with fade-out

### ✅ Pet state simulation (core loop)
State variables (clamped ranges):
- energy (0–100)
- mood (-100–100)
- attachment (0–100)
- trust (0–100)
- boredom (0–100)
- hunger (0–100)
- cleanliness (0–100)

A tick loop updates the state every ~15–30 seconds (random jitter for “life”).

### ✅ Interactions (player actions)
- pet (touch / pat)
- feed
- play
- chat
- clean
- work mode (quiet companionship)

### ✅ Behavior Scheduler
Miu chooses an action based on state:
- purr, seek pats, ask food, invite play
- nap when tired
- mild jealousy / sulking when ignored (cute, not toxic)
- occasional memory flash (when trust is high)

### ✅ Memory (MVP)
- lightweight local memory storage (SQLite planned; in-memory fallback for tests)
- episodic events + preference + relationship snippets
- memory flash is rare and state-dependent

### ✅ Optional LLM Dialogue (plug-in)
LLM is used as a **voice organ**, not as the game loop:
- short outputs only
- strict JSON schema
- fallback to canned lines when parsing fails
- tools disabled in MVP

---

## Repo Structure

```text
ai-desktop-pet/
  apps/
    desktop/            # Tauri + React UI (desktop pet window)
  packages/
    core/               # pure logic: state/behavior/memory/dialogue
  docs/
    design.md           # mechanics + behavior table
    prompt.md           # persona + schema + safety rules
  README.md
