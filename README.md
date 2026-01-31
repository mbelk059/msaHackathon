# CrisisAI - Real-Time Global Emergency Monitoring

An AI-powered crisis monitoring platform built on [Solace Agent Mesh](https://github.com/SolaceLabs/solace-agent-mesh) (SAM). Detects global emergencies, verifies and scores severity, and connects users to verified humanitarian organizations for donations.

## Getting Started

1. [Get LLM API access](docs/llm-setup.md) (free options available)
2. Choose a [run method](#run--deploy)
3. Run the [frontend](frontend/) for the 3D globe and crisis dashboard

## Run & Deploy

| Platform | Guide                                           | When to Use                              |
| -------- | ----------------------------------------------- | ---------------------------------------- |
| Docker   | [Run with Docker](docs/deployment/docker.md)    | Quick start, no Python setup needed      |
| CLI      | [Run with CLI](docs/deployment/cli.md)          | Local dev, faster iteration (no rebuild) |
| Railway  | [Deploy to Railway](docs/deployment/railway.md) | Public deployment, sharing               |

For persistent storage across restarts, see [Persistent Storage with Supabase](docs/persistence.md).

## Agents (CrisisAI)

| Agent | Config | Role |
| ----- | ------ | ----- |
| **Orchestrator** | `configs/orchestrator.yaml` | Routes tasks to crisis agents |
| **Crisis Detection** | `configs/agents/crisis-detection-agent.yaml` | Monitors sources, publishes raw crises |
| **Verification & Scoring** | `configs/agents/crisis-verification-agent.yaml` | Verifies and scores severity (1–10) |
| **NGO Matching** | `configs/agents/crisis-ngo-agent.yaml` | Matches crises to verified NGO campaigns |
| **Update Monitor** | `configs/agents/crisis-update-agent.yaml` | Tracks ongoing crisis updates |

**Web UI (chat):** http://localhost:8000 — run `uv run sam run configs/` from the project root.

**If the chat still shows old/other agents:** Stop SAM, then delete the cached DBs in the project root and restart:
```bash
# From project root (where you run sam run configs/)
del platform.db webui-gateway.db
uv run sam run configs/
```
Then reload http://localhost:8000/#/chat — only the Orchestrator and the four CrisisAI agents will appear.

**Frontend (globe + dashboard):** `cd frontend && npm install && npm run dev` → http://localhost:3000.  
The frontend loads crisis data from the **crisis API** when it’s running; otherwise it uses static mock data. To run the crisis API (so the frontend uses the backend):
```bash
uv run python -m src.crisis_api
```
Runs the API on port 8001; the frontend dev server proxies `/api` to it. So:
- **Backend for chat:** `uv run sam run configs/` (port 8000)
- **Backend for globe data:** `uv run python -m src.crisis_api` (port 8001)
- **Frontend:** `cd frontend && npm run dev` (port 3000)

## Resources

- [CrisisAI project overview](CRISISAI_README.md)
- [Solace Agent Mesh Documentation](https://solacelabs.github.io/solace-agent-mesh/docs/documentation/getting-started/introduction/)
- [AGENTS.md](AGENTS.md) – agent/tool development guide
