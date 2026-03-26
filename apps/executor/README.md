# Executor

Runs workflows: polls DB for timer/schedule triggers, and exposes an HTTP API for the backend (Run button) and webhooks.

## Setup

- Create `.env` with `MONGO_URI` (same as backend).
- Optional: `EXECUTOR_PORT=4001` (default 4001).

## Run

```bash
bun install
bun run dev
# or: bun run src/index.ts
```

## End-to-end

1. **Backend** (e.g. port 2000): `npm run build && npm run start` from `apps/backend`. Set `EXECUTOR_URL=http://localhost:4001` if the executor runs elsewhere.
2. **Executor** (port 4001): `bun run dev` from `apps/executor`. Must use the same `MONGO_URI` as the backend.
3. **Client**: `npm run dev` from `apps/client`; open the app, create/edit a workflow, click **Update** to save, then **Run** to execute. The client calls the backend `/workflow/:id/execute`, which calls the executor at `POST /execute-workflow`.
