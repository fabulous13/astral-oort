# PROMPT: Build "Truth.AI" - The Advanced Fidelity Testing Agent

You are an expert AI software engineer specializing in high-end, futuristic web applications with complex real-time AI integrations. Your task is to build **Truth.AI**, a platform where users can deploy an AI agent to test their partner's fidelity via a phone call.

## 1. Core Concept & Branding
- **Name**: Truth.AI
- **Mission**: Reveal the hidden truth in relationships through advanced conversational AI.
- **Aesthetic (2026 Standards)**:
  - **Theme**: "Dark Cyberpunk Luxury". Deep blacks (`#050505`), glassmorphism, neon accents (Electric Violet `#7c3aed`, Cyber Cyan `#06b6d4`, Hot Pink `#ec4899`).
  - **Typography**: `Outfit` for headings (bold, futuristic), `Inter` for UI text (clean, readable), `JetBrains Mono` for data logs.
  - **Feel**: Fluid, mysterious, premium, and dangerously intelligent. High usage of `backdrop-filter: blur`, subtle gradients, and micro-interactions.

## 2. Tech Stack Requirements
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion (for complex animations).
- **Backend**: Next.js Server Actions or Python FastAPI (if heavy processing needed).
- **Database**: Supabase (PostgreSQL + Realtime).
- **AI/Voice**: 
  - **ElevenLabs API** for ultra-realistic voice synthesis (latency optimized).
  - **OpenAI GPT-4o** for conversational intelligence and "seduction/investigation" logic.
  - **Twilio** for telephony handling (making/receiving calls).
- **State Management**: Zustand.
- **Payments**: Stripe (subscription or per-call credits).

## 3. Key Features & User Flow

### Phase 1: The "Setup" (Dashboard)
- **Agent Configuration**:
  - **Voice Selection**: Toggle between "Siren" (Female, various accents) and "Titan" (Male, various accents). Preview audio with a waveform visualization.
  - **Persona Slider**: Adjust the agent's approach from "Friendly/Innocent" to "Flirty/Direct" to "Aggressive/Tempting".
  - **Target Info**: Input phone number, name, and "Context Notes" (e.g., "He likes football," "Meeting at a bar").
- **Payment Gate**: Users must buy "Credits" to initiate a mission.

### Phase 2: The "Mission" (Live Interface)
- **Real-Time Visualization**:
  - **The Wave**: A central, pulsating 3D-like waveform (using Canvas or SVG) that reacts to the AI's voice and the target's voice.
  - **Live Transcript**: A scrolling chat log of the conversation as it happens (Speech-to-Text).
  - **Sentiment Analysis**: A dynamic "Fidelity Meter" that shifts based on the target's responses (e.g., if he says "I'm single," the meter spikes to Red/Danger).

### Phase 3: The "Verdict" (Report)
- **Analysis Summary**: A generated report card.
  - **Fidelity Score**: 0-100% (Safety Rating).
  - **Key Moments**: Highlighted clips where the target lied or remained faithful.
  - **Shareable Proof**: Audio recording export.

## 4. Technical Implementation Steps (The "Prompt" to Execute)

### Step 1: Foundation
Initialize a **Next.js 14** project with **TailwindCSS**. Configure the `globals.css` to implement the "Dark Cyberpunk Luxury" variables. Install `framer-motion`, `lucide-react`, and `zustand`.

### Step 2: UI Components (The "2026 Look")
Create a reusable Design System:
- `GlassCard`: A container with `bg-white/5 backdrop-blur-xl border-white/10`.
- `NeonButton`: A button with a glow effect on hover (`shadow-[0_0_20px_var(--primary)]`).
- `GlitchText`: A typography component for titles.

### Step 3: API Integration (The "Brain")
- **Twilio**: Set up a route to handle incoming/outgoing calls via WebSocket (for low latency).
- **OpenAI + ElevenLabs**:
  - Create a "Conversation Loop": Speech -> Text (Whisper) -> GPT-4o -> Text -> Audio (ElevenLabs) -> Stream to Twilio.
  - **Latency Optimization**: This is critical. Use standard WebSocket streams to ensure the AI responds in <800ms.

### Step 4: The Logic (The "Trap")
- **System Prompting**: Design a sophisticated system prompt for GPT-4o.
  - *Example*: "You are 'Sarah'. You found this number in your old phone. You are flirty but subtle. Your goal is to see if the target agrees to meet up. If he mentions a girlfriend, press him gently to see if he denies it."

## 5. Coding Constraints & Rules
- **Code Quality**: Strict TypeScript, modular components.
- **Responsiveness**: Mobile-first design (users will likely use this on phones).
- **Error Handling**: Graceful degradation if the call drops or APIs fail.

---
**INSTRUCTION**: Start by scaffolding the project and implementing the `AgentSetup` component with the specified mesmerizing UI.
