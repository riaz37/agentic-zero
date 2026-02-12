# Agentic Zero (`@agentic-zero/core`)

> **The Zero-Interaction Web Framework.**

**[BETA v0.1.0-beta.1]**

A TypeScript framework for building "Zero-Interaction" web experiences. It allows AI agents to autonomously navigate, narrate, and interact with your DOM, providing a "Concierge" experience for your users.

![Agentic Console](./docs/console_preview.webp)

## ✨ Features

- **🧠 Agent State Machine**: Deterministic XState brain that manages navigation, narration, and interruption.
- **🌉 Bridge Protocol**: A robust layer that connects the LLM to the DOM.
  - **Self-Correction**: Automatically retries missed scrolls or clicks.
  - **Shadow Piercer**: Navigates through Shadow DOM and iframes.
  - **Tug-of-War**: Gracefully handles user interruptions (scroll/click) and re-engages.
- **🛡️ PII Sanitization**: Automatically redacts sensitive data (Credit Cards, Emails) before it touches the LLM.
- **🎥 Flight Recorder**: Black-box telemetry for debugging agent sessions.
- **🗣️ Narrative Engine**: Streaming commentary using Vercel AI SDK.

## 📦 Installation

```bash
npm install @agentic-zero/core
# or
npx create-agentic-zero my-site
```

## 🚀 Quick Start

Wrap your application in the `AgenticProvider`:

```tsx
import { AgenticProvider } from '@agentic-zero/core';

export default function RootLayout({ children }) {
  return (
    <AgenticProvider config={{ autoStart: false, debug: true }}>
      {children}
    </AgenticProvider>
  );
}
```

Mark "Checkpoints" in your UI using the `<AgentCheckpoint>` component or `data-agent-checkpoint` attributes:

```tsx
import { AgentCheckpoint } from '@agentic-zero/core';

export default function Hero() {
  return (
    <AgentCheckpoint id="hero" narrative="Welcome to the future of web browsing.">
      <section className="hero">
        <h1>Hello World</h1>
      </section>
    </AgentCheckpoint>
  );
}
```

## 🛠️ Developer Tools

### Agentic Console
Enable `debug: true` in your config to see the **Agentic Console** overlay. It visualizes:
- **State**: What is the agent thinking?
- **Timeline**: Where is it in the journey?
- **Context**: What DOM elements does it see?

### CLI
Scaffold new projects instantly:
```bash
npx create-agentic-zero my-new-site
```

## 🏗️ Architecture

The framework is built on a **Bridge Pattern**:

1.  **The Brain (XState)**: Decides *intent* (e.g., "Go to Pricing").
2.  **The Orchestrator**: Translates intent into *action* (e.g., "Scroll to #pricing").
3.  **The Bridge**: Executes action and *verifies* result (e.g., "Is #pricing visible?").

## 📄 License

MIT © Agentic Zero Framework
