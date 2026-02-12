# Agentic Zero — The Zero-Interaction Web Framework

<p align="center">
  <img src="https://raw.githubusercontent.com/riaz37/agentic-zero/main/apps/docs/public/logo.png" alt="Agentic Zero Logo" width="200" />
</p>

**Agentic Zero** is a powerful SDK designed to transform any website into an autonomous concierge experience. It provides a "brain" for your web applications, allowing an AI agent to navigate, narrate, and interact with your site on behalf of (or alongside) your users.

## 🚀 Vision: Zero-Interaction Web
The web shouldn't just be viewed; it should be experienced. Agentic Zero enables a future where websites can explain themselves, guide users through complex flows, and handle repetitive tasks autonomously, all while maintaining a premium, cinematic aesthetic.

## 🏗️ Monorepo Structure

| Path | Description |
| :--- | :--- |
| **`packages/core`** | The main SDK — hooks, components, and the XState-driven brain. |
| **`packages/create-agentic-zero`** | The CLI for bootstrapping new Agentic Zero projects. |
| **`apps/docs`** | The Nextra 4 documentation site (Next.js App Router). |
| **`examples/`** | Reference implementations and quick-start templates. |

## 🌟 Key Features

- **🛡️ Secure Narrative Bridge**: Server-side LLM processing to protect sensitive API keys.
- **🧠 Brain Protocol**: Sophisticated navigation and narration orchestration using XState.
- **🛡️ PII Sanitizer**: Automatic redaction of sensitive data before LLM transmission.
- **🎭 Visual Bridge**: Cinematic Three.js holographic avatars that respond to agent state.
- **👁️ Shadow Piercer**: Recursive DOM traversal that "sees" through Shadow DOM and Iframes.
- **🎥 Flight Recorder**: Full session telemetry for debugging and transparency.

## 📦 Installation

To get started with an existing project:

```bash
npm install @agentic-zero/core
```

Or bootstrap a new project:

```bash
npx create-agentic-zero init
```

## 📖 Documentation

Visit our full documentation at [agentic-zero.dev](https://agentic-zero.dev) (or run the local docs app).

## 🛠️ Development

This is a monorepo. To set up for development:

```bash
# Clone the repository
git clone https://github.com/riaz37/agentic-zero.git

# Navigate to the framework
cd framework

# Install dependencies (from root)
npm install
```

## 📄 License
MIT © [Agentic Zero Team](https://github.com/riaz37)
