# create-agentic-app

> **Scaffold a new Agentic Website in seconds.**

The official CLI tool for the Agentic Web Framework. Sets up a production-ready Next.js application with `@agentic-web/core` pre-configured.

## 🚀 Usage

Run the following command to create a new project:

```bash
npx create-agentic-app my-app
```

Or specify the template directly:

```bash
npx create-agentic-app my-app --template nextjs
```

## 📦 Templates

### `nextjs` (Recommended)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Features**: 
  - `AgenticProvider` configured in `layout.tsx`
  - Example `AgentCheckpoint` implementation
  - Pre-configured TypeScript

### `vite` (Coming Soon)
- Minimal SPA setup for React + Vite.

## 🛠️ Development

If you are contributing to the framework:

1.  Clone the monorepo.
2.  Run `npm install`.
3.  Build the CLI:
    ```bash
    cd packages/create-agentic-app
    npm run build
    ```
4.  Test locally:
    ```bash
    node bin/cli.js test-app
    ```

## 📄 License

MIT © Agentic Web Framework
