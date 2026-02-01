# CrisisAI: Real-Time Global Emergency Monitoring Platform

<div align="center">

🌍 **Turning awareness into action**: AI-powered crisis detection, verification, and humanitarian response routing built on [Solace Agent Mesh](https://github.com/SolaceLabs/solace-agent-mesh).

</div>

---

## The Problem

Every day, emergencies unfold across the globe — earthquakes level cities, floods displace millions, conflicts tear communities apart. Yet the people who want to help face a frustrating reality:

- **Information is fragmented.** Crisis updates are scattered across news outlets, social media, and government agencies with no single source of truth.
- **Urgency is unclear.** Not every headline is a critical emergency, and it's hard to know which situations need help the most right now.
- **Trust is uncertain.** When people want to donate, they often don't know which organizations are legitimate, actively responding, or making the biggest impact on the ground.

The result? Good intentions stall. Aid is delayed. People who genuinely want to make a difference don't know where to start.

**CrisisAI exists to close that gap.**

---

## What is CrisisAI?

CrisisAI is an AI-for-good platform that monitors the globe in real time, detects emerging emergencies, verifies them through multiple sources, scores their severity, and connects users directly to trusted humanitarian organizations where they can take action.

It is not just a news aggregator. It is an intelligent system that filters noise, prioritizes what matters most, and makes it effortless for everyday people to contribute to relief efforts anywhere in the world — whether that's an earthquake in Turkey, flooding in Pakistan, or a humanitarian crisis in Gaza.

The platform is built on **Solace Agent Mesh (SAM)**, an event-driven architecture that enables multiple AI agents to work in parallel, each with a focused role, communicating seamlessly through a real-time message broker. This architecture mirrors how modern emergency response systems operate — distributed, fast, and resilient.

---

## How AI Powers CrisisAI

CrisisAI uses four specialized AI agents that run in parallel and communicate through the Solace event mesh. Each agent has a single, well-defined responsibility, and together they form a pipeline that takes raw, unstructured data from the world and turns it into verified, actionable crisis information.

### 1. Crisis Detection Agent
The first line of awareness. This agent continuously monitors multiple data sources — global disaster databases, major news feeds, official government alerts, and social media — looking for signals that a crisis is emerging or escalating. It listens for patterns: a spike in earthquake-related posts, an official USGS alert, a breaking news report from Reuters. When it detects a potential crisis, it packages the raw information and publishes it to the Solace event mesh for the next stage of processing.

**Sources it monitors:** GDACS, USGS, NOAA, BBC, Reuters, Al Jazeera, Twitter/X trending topics.

### 2. Verification & Scoring Agent
Raw detections are noisy. Social media is full of rumors, and a single news headline doesn't confirm a crisis. This agent subscribes to everything the Detection Agent publishes and does the hard work of validation. It cross-references reports across multiple independent sources, filters out false alarms and duplicates, and only promotes a crisis as verified when at least two or more authoritative sources confirm it.

Once verified, it calculates a **severity score from 1 to 10** based on a weighted formula:
- Deaths reported (40%)
- Total population affected (30%)
- Infrastructure and economic damage indicators (15%)
- Ongoing vs. resolved status (15%)

This scoring is what powers the prioritization on the platform. A severity 9 crisis in Gaza sits above a severity 5 storm in a region with minimal casualties — not arbitrarily, but because the data says so.

### 3. NGO Matching Agent
This is where awareness becomes action. Once a crisis is verified and scored, this agent analyzes the type and location of the emergency and matches it to humanitarian organizations that are actively responding on the ground. It identifies verified NGO campaigns — from Islamic Relief and the Red Cross/Red Crescent to UNICEF, Doctors Without Borders, and Save the Children — and surfaces their direct donation links.

Every NGO and campaign link shown on the platform is verified. Users don't have to search, compare, or wonder. They see exactly which organizations are responding to which crisis, what they're doing (emergency shelter, medical aid, child support), and a single button to donate.

### 4. Update Monitor Agent
Crises are not static. A death toll rises. A new region is affected. Relief efforts scale up or fall short. This agent continuously monitors ongoing crises for new developments and pushes updates in real time. It also tracks whether a crisis is escalating (severity score increases) or resolving (aid efforts succeed, situation stabilizes), keeping the platform's data accurate and current.

### How the Agents Connect

```
[Crisis Detection Agent]
        ↓  publishes to → crisis/raw/*
[Verification & Scoring Agent]
        ↓  publishes to → crisis/verified/*
[NGO Matching Agent]
        ↓  publishes to → crisis/actionable/*
[Update Monitor Agent]
        ↓  publishes to → crisis/updates/*
[Frontend Platform]
        ↑  subscribes to → crisis/actionable/* + crisis/updates/*
```

Each arrow is a real-time message flowing through the Solace event mesh. When a new earthquake is detected, the entire pipeline — from raw signal to verified, scored, and actionable crisis with donation links — completes in seconds.

---

## Features

### 🌐 Interactive 3D Globe
The centerpiece of CrisisAI is a rotating 3D globe that displays every active crisis in the world simultaneously. Crisis locations are marked with color-coded, pulsing pins:

| Color | Severity | Meaning |
|-------|----------|---------|
| 🔴 Red | 9–10 | Critical — immediate, large-scale humanitarian emergency |
| 🟠 Orange | 7–8.9 | High — significant impact, active and worsening |
| 🟡 Yellow | 5–6.9 | Medium — notable crisis, situation being monitored |
| 🟢 Green | 3–4.9 | Low — emerging or contained situation |

Click any marker on the globe to instantly pull up the full crisis dashboard for that event.

### 📊 Crisis Dashboard
A detailed side panel that shows everything a user needs to understand a crisis and take action:

- **Crisis type and location** — clear, geographic context
- **Severity badge** — at-a-glance priority level
- **Status indicator** — ongoing, escalating, or resolved
- **Impact statistics** — deaths, injuries, displaced, total affected
- **Verification sources** — which agencies confirmed this crisis (USGS, BBC, UN, etc.)
- **Real-time updates** — latest developments as they happen
- **"How You Can Help" section** — the core value of the platform

### 💛 Verified Donation Links
The "How You Can Help" section is where CrisisAI delivers its real value. For every verified crisis, users see a curated list of humanitarian organizations actively responding. Each entry includes:

- Organization name with a **verified badge**
- What they are doing on the ground (e.g., "Emergency shelter, food, medical aid")
- A direct link to that organization's specific campaign page for this crisis

### 📡 Simulated Real-Time Updates
The platform simulates the experience of a live system. During a demo or live session, new crises can appear on the globe, and existing crises receive updates — casualty counts change, severity scores shift, new developments are reported. This demonstrates the power of the event-driven architecture underneath.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Event Mesh** | Solace Agent Mesh (SAM) — PubSub+ Event Broker |
| **AI Agents** | Python — 4 parallel agents communicating via Solace topics |
| **Frontend** | React, Tailwind CSS, Three.js (3D globe), Lucide React (icons) |

---

## Getting Started

### Prerequisites
- Node.js (18+) and npm
- Python 3.10+
- Access to Solace Cloud (free tier) or Docker for local broker

### 1. Run the Backend Agents
```bash
# Install dependencies
uv sync

# Start Solace Agent Mesh (runs orchestrator + all 4 agents)
uv run sam run configs/
```
The agent web UI is available at **http://localhost:8000**.

### 2. Run the Crisis API
```bash
# In a separate terminal
uv run python -m src.crisis_api
```
This starts the API on **port 8001**. The frontend proxies `/api` requests to it.

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The platform is available at **http://localhost:3000**.

---

## Why Solace Agent Mesh?

Solace Agent Mesh is the backbone of CrisisAI's architecture for several reasons:

- **Parallel processing.** All four agents run simultaneously and independently. A new crisis detected by the Detection Agent is immediately available to the Verification Agent — no waiting, no bottlenecks.
- **Decoupled design.** Each agent only knows about its own job. If one agent needs to be updated or replaced, the others keep running. This is how real emergency systems are built.
- **Event-driven scalability.** When a major disaster hits and dozens of sources report simultaneously, the event mesh handles the surge without dropping messages. Guaranteed delivery ensures no critical alert is lost.
- **Topic-based routing.** The `crisis/raw/*`, `crisis/verified/*`, `crisis/actionable/*` topic hierarchy gives the system a natural, readable structure. The frontend only subscribes to actionable, verified crises — it never sees raw, unverified noise.
- **Real-time updates.** The Update Monitor Agent can push changes to an existing crisis instantly, and the frontend receives them without polling. The platform stays current as situations evolve.

---

## Impact & Vision

CrisisAI is a proof of concept for how AI and event-driven architecture can be applied to one of humanity's most persistent challenges: getting help to people who need it, as fast as possible.

In its current hackathon form, it demonstrates the full pipeline — from detection to verified, actionable crisis information with trusted donation links — using simulated data. In a production environment, this same architecture could:

- Monitor thousands of data sources in real time across every continent
- Detect emerging crises minutes or hours before they make mainstream news
- Automatically route donations to the organizations best positioned to respond
- Provide multilingual crisis information to a global audience
- Scale instantly during large-scale disasters without infrastructure changes

The goal is simple: **make it easier for anyone, anywhere, to understand what is happening in the world and to do something about it.**

---

## Resources

- [Solace Agent Mesh Documentation](https://solacelabs.github.io/solace-agent-mesh/docs/documentation/getting-started/introduction/)