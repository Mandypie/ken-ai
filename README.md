# Ken AI 🌌

> *"Explore anything."*

Ken AI is an original, space-inspired AI chat assistant front-end built from scratch with React, Vite, TypeScript, and Tailwind CSS. It features a cosmic glass aesthetic, fluid atmospheric starfield canvas, detached floating dock, rotating conic orbit ring on focus, and token-by-token streaming with markdown syntax highlighting.

---

## 🚀 Quick Start

### 1. Installation
```bash
cd "Ken AI"
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## ⚙️ OpenRouter API setup

Ken AI uses OpenRouter's [Free Models Router](https://openrouter.ai/openrouter/free), which automatically routes each chat to an available free model. Create an API key in [OpenRouter](https://openrouter.ai/keys), open Settings in the app, paste it into **OpenRouter API key**, and save. Free models can have usage limits or temporary availability changes.

The key is saved in this browser's local IndexedDB settings and sent directly to OpenRouter with chat requests. It is not sent to a Ken AI server or included in chat exports. Anyone using this browser profile can access it; remove it in Settings when finished. Do not deploy this browser-key version publicly.

---

## 🔌 Where to Plug in Your AI's API

OpenRouter request mapping and streaming live in:
👉 **`src/lib/api.ts`**

### `streamChat()` Function
```ts
export async function streamChat({
  messages,
  engine,
  apiKey,
  system,
  signal,
  onToken,
}: StreamChatParams): Promise<void>
```

Requests use the saved OpenRouter key and the `openrouter/free` model through OpenRouter's OpenAI-compatible Chat Completions API. Chat history remains in the browser's IndexedDB. Change the API client in `src/lib/api.ts` only when replacing OpenRouter with another provider.

Each request includes Ken AI's product identity and asks the selected model not to introduce or promote itself as another provider. If asked which model is answering, it explains that the free-model router can select different models.

---

## ⚡ How to Edit AI Engines

Engines are configured in:  
👉 **`src/config/engines.ts`**

Each engine defines:
- `id`: unique identifier passed to the API.
- `name`: display name in the chat composer.
- `description`: one-line summary of the routing behavior.
- `color`: accent indicator dot color.
- `model`: OpenRouter model ID used for API requests.

```ts
export const engines: Engine[] = [
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free',
    description: 'Automatically routes to an available free model',
    color: '#FF6FB5',
    model: 'openrouter/free',
  },
];
```

---

## 💡 How to Edit Suggestion Cards

Suggestion cards displayed on the home hero screen are configured in:  
👉 **`src/config/suggestions.ts`**

Each card contains an icon (from `lucide-react`), bold title, subtitle, and default prompt:

```ts
export const suggestions: Suggestion[] = [
  {
    icon: Hammer,
    title: 'Build',
    subtitle: 'Plan a small app from scratch',
    prompt: 'Help me plan and build a small app from scratch.',
  },
  {
    icon: GraduationCap,
    title: 'Learn',
    subtitle: 'Teach me any skill, step by step',
    prompt: 'Teach me a new skill step by step.',
  },
  {
    icon: PenLine,
    title: 'Write',
    subtitle: 'Draft a clear email or proposal',
    prompt: 'Help me draft a clear and professional email.',
  },
  {
    icon: Scale,
    title: 'Decide',
    subtitle: 'Weigh up a tough choice with me',
    prompt: 'Help me think through a tough decision by weighing the pros and cons.',
  },
];
```

---

## 🎨 Design Tokens & Theming

Tokens are declared in `src/index.css`:
- **Night (Dark, Default):**
  - Background: `#070812`
  - Surface: `#0E1020`
  - Surface 2: `#151833`
  - Border: `rgba(255, 255, 255, 0.08)`
  - Text: `#EEF0FA`
  - Muted: `#8D93B8`
- **Daybreak (Light):**
  - Background: `#F7F6FB`
  - Surface: `#FFFFFF`
  - Surface 2: `#EFEDF8`
  - Border: `rgba(20, 20, 60, 0.10)`
  - Text: `#14152B`
  - Muted: `#5D6086`
- **Core Glow Gradient:** `#7C5CFF` → `#FF6FB5` → `#FFC46B` (darker contrast stops `#5B3FE0` → `#D6338A` for text in Daybreak).
- **Glass panels:** `backdrop-filter: blur(16px)` + low-contrast 1px border.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | Insert newline |
| `Ctrl + K` / `Cmd + K` | Open Command Palette (jump to chat, change engine, toggle theme, open settings) |
| `Ctrl + Shift + O` / `Cmd + Shift + O` | Start a new chat |
| `Escape` | Stop generating or close any open drawer / modal |

---

## 🛡️ Accessibility & Performance

- **WCAG AA Compliant:** High contrast color stops, visible 2px focus rings (gold in Night, violet in Daybreak), `aria-live="polite"` on streaming tokens, accessible keyboard traversal.
- **Hardware & Battery Throttling:** Detects `prefers-reduced-motion`, `navigator.connection.saveData`, and low-power hardware (`hardwareConcurrency <= 4`) to pause or freeze star twinkling and orbit animations (configurable in Settings).
- **Bundle Optimization:** Code-split with manual chunks (`vendor`, `markdown`, `highlight.js/lib/common`) for lightning-fast loading on mobile and low-latency networks.
- **Storage:** Chat histories and user settings are persisted in IndexedDB via `idb-keyval` behind `src/lib/storage.ts`.
