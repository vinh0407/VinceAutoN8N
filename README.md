# VinceAuto - Workflow Automation and AI Agent Orchestration Platform

VinceAuto is an extensible workflow automation and AI agent orchestration platform inspired by n8n architecture. It provides a visual DAG (Directed Acyclic Graph) canvas, multi-output execution routing, persistent background schedulers, real-time WebSocket monitoring, and native integrations for AI models, social platforms, and enterprise business tools.

---

## Architecture Overview

VinceAuto is built as a TypeScript monorepo comprising a decoupled backend engine and a reactive web canvas interface.

- **Backend (`/backend`)**:
  - Runtime: Node.js with TypeScript and Express.
  - Execution Engine: Topological DAG evaluator with support for data pinning, error handling, partial node retries, and variable proxy resolution (`$json`, `$node`).
  - Scheduling: In-memory and persistent cron scheduler powered by Croner, supporting daily recurring schedules, custom cron intervals, and ad-hoc task runners.
  - Real-Time Layer: Native WebSocket server (`/ws`) broadcasting node-level execution progress, durations, item counts, and streaming logs.
  - Storage Layer: File-backed persistent storage for workflows, projects, credentials, data tables, and version snapshots located in `/data`.

- **Frontend (`/frontend`)**:
  - Framework: React 19, TypeScript, and Vite.
  - Canvas: @xyflow/react (React Flow) customized with custom node types, dynamic multi-output handles (True/False branching, Switch cases, AI Agent sub-connections), and interactive sticky notes.
  - Styling: Tailwind CSS configured with a dark slate/zinc neutral theme.
  - Inspector: Three-column Node Details View (NDV) supporting parameter forms, input/output inspection, JSON schema exploration, and credential assignment.

---

## Key Capabilities

### 1. Visual Flow Canvas and Data Routing
- Multi-Output Nodes: Dedicated branch outputs for conditional nodes (`flow.if` with true/false handles, `flow.switch` with numbered case handles, and AI agents with memory/tool ports).
- Data Transformation Nodes:
  - Popular: Code (JavaScript and Python runtime), Date and Time manipulation, Edit Fields (Set).
  - Add or Remove Items: Filter, Limit, Remove Duplicates, Split Out arrays into individual items.
  - Combine Items: Aggregate, Merge streams, Summarize (count, sum, min, max, average).
  - Convert Data: File compression/decompression, JSON to Binary file conversion, Crypto utilities (SHA256, HMAC, MD5), Image operations (blur, resize, watermarks), HTML, Markdown, and XML parser.
  - Order and Clean: Rename Keys, Sort collections.
- Canvas Utilities: Topological auto-layout (Tidy Up) for aligning complex graphs, canvas sticky notes, and keyboard shortcuts (`Ctrl+C`, `Ctrl+V`, and `D` to toggle node disable state).

### 2. AI Agent and LLM Orchestration
- Model Providers: Native compatibility with OpenAI-compatible endpoints, Anthropic Claude, Google Gemini, Ollama local inference, and Opencode2 (`crouton-alpha-free`).
- AI Model Router: Automated cost-aware and latency-aware routing (`best_cost`, `fastest`, `highest_reasoning`).
- Prompt Templates: Built-in library of reusable node prompts and natural language generation for generating workflows from prompts.
- Self-Healing Execution: Automated diagnostic engine analyzing runtime step failures and proposing instant fixes.

### 3. Execution Engine and Developer Tools
- Data Pinning: Freeze and cache node output data to accelerate testing without repeatedly invoking third-party external APIs.
- Partial Execution: Retry failed workflows directly from the failing node using persisted intermediate results.
- Webhook Ingestion: Public webhook endpoints (`/webhook/:path`) supporting synchronous responses and background dispatch.

### 4. Task Scheduling and Recurring Automations
- Recurring Task Manager: Schedule automated tasks daily at exact times (e.g. 08:30, 12:00, 17:30), hourly, weekly, or on custom cron expressions.
- Dual Execution Target: Trigger complete workflows or directly assign natural language instructions to an AI Agent.
- Runtime Tracking: Next run time estimation, execution counters, manual execution triggers, and operational status logs.

### 5. Built-in Data Tables and Version Control
- Data Tables: Embedded spreadsheet-like key-value store for anti-duplication, state caching, and lightweight CRM data without requiring an external database.
- Workflow Version History: Automatic and manual snapshot creation with change summaries, allowing complete rollback to earlier graph revisions.

---

## Directory Structure

```
VinceAuto/
├── backend/
│   ├── src/
│   │   ├── api/             # Express routes, WebSockets, and webhook listeners
│   │   ├── engine/          # Node execution logic, DAG resolver, and types
│   │   ├── scheduler/       # Cron task manager and recurring daily workers
│   │   ├── storage/         # File persistence layer for workflows and tables
│   │   └── index.ts         # Server bootstrap
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai-builder/  # AI Workflow Assistant and prompt generator
│   │   │   ├── canvas/      # Custom React Flow nodes, handles, toolbar
│   │   │   ├── header/      # Workflow control header and actions
│   │   │   ├── ndv/         # Node Details View modal (Parameters and Output)
│   │   │   ├── node-creator/# Searchable category panel for all node types
│   │   │   ├── sidebar/     # Projects, workflows, and chat navigation
│   │   │   ├── tables/      # Built-in Data Tables modal
│   │   │   └── tasks/       # Recurring task scheduler modal
│   │   ├── data/            # Catalogs for all apps, actions, and triggers
│   │   ├── types/           # Frontend TypeScript data interfaces
│   │   ├── App.tsx          # Main application coordinator
│   │   └── main.tsx         # React root
│   ├── vite.config.ts
│   └── package.json
├── data/                    # Local storage (ignored in version control)
├── .env.example             # Template for environment configuration
├── pnpm-workspace.yaml      # Monorepo configuration
└── package.json
```

---

## Prerequisites

- Node.js: Version 18.x, 20.x, or 22.x LTS.
- Package Manager: `pnpm` (version 9.x recommended).
- Git: For version control.

---

## Installation and Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/vinh0407/VinceAutoN8N.git
   cd VinceAutoN8N
   ```

2. Install dependencies for all workspace packages:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy the example environment configuration file:
   ```bash
   cp .env.example .env
   ```
   Fill in optional API credentials as needed:
   ```env
   PORT=5678
   OPENCODE2_API_KEY=
   OPENCODE2_BASE_URL=https://opencode.ai/zen/v1
   OPENCODE2_MODEL=crouton-alpha-free
   OPENAI_API_KEY=
   TELEGRAM_BOT_TOKEN=
   ```

4. Build all packages:
   ```bash
   pnpm run build
   ```

5. Start the development environment:
   ```bash
   pnpm run dev
   ```
   - Frontend UI: `http://localhost:3000`
   - Backend API: `http://localhost:5678`
   - WebSocket Server: `ws://localhost:5678/ws`

---

## Production Deployment

### Option A: Process Manager (PM2 / Systemd on a Linux VPS)

1. Build production bundles:
   ```bash
   pnpm --filter vinceauto-backend build
   pnpm --filter vinceauto-frontend build
   ```

2. Run backend via PM2:
   ```bash
   pm2 start backend/dist/index.js --name vinceauto-backend
   ```

3. Serve frontend assets via Nginx or caddy reverse proxy pointing to `http://127.0.0.1:5678` for `/api` and `/ws`.

### Option B: Cloud Container Deployment (Railway / Render / Fly.io)

1. Connect your repository to Railway or Render.
2. Configure build command:
   ```bash
   pnpm install && pnpm run build
   ```
3. Configure start command:
   ```bash
   node backend/dist/index.js
   ```
4. Attach a persistent disk or volume to the `/data` folder to ensure workflows and data tables remain intact across container restarts.

---

## Security Practices

- Secrets Isolation: All secret credentials, tokens, and OAuth keys are kept out of Git repositories. Local runtime configurations reside inside the `/data` directory, which is excluded by `.gitignore`.
- Sandboxed Execution: Script nodes are executed with strict timeout boundaries to prevent blocking the main process event loop.
- Sensitive Variables: Set all production secrets via environment variables in your deployment platform.

---

## License

This project is licensed under the MIT License.
