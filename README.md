# Promise Pipeline

A trust primitive for commitment networks. Promise Pipeline applies Promise Theory to commitment tracking, auditing, and simulation across domains — from climate legislation to team accountability.

## What It Does

- **Map** commitments as typed promises with dependencies, verification, and polarity
- **Verify** promise status against evidence (filing, audit, sensor, self-report)
- **Simulate** cascade effects: when one promise fails, what breaks downstream?
- **Track** personal and team promises with the same universal schema

## Live Demos

- **Oregon HB 2021** — 20 promises, 11 agents, 7 domains, full cascade simulation
- **AI Safety** — Tracking voluntary safety commitments from frontier AI labs
- **Infrastructure SLAs** — Cloud provider uptime and sustainability promises
- **Supply Chain** — Labor, materials, and transparency across global brands

## Products

- **Promise Garden** — Personal promise tracker with rewilding visualization (free)
- **Teams** — Team promise network with capacity simulation and cascade analysis

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS
- Recharts
- Sanity CMS (blog)
- SVG network graph visualization
- Deterministic BFS cascade simulation engine

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` — Next.js pages and API routes
- `lib/types/` — Universal promise schema (v2.1)
- `lib/data/` — Typed data files for demo verticals
- `lib/simulation/` — Cascade engine, graph utilities, scoring
- `components/` — Reusable UI components
- `sanity/` — CMS schemas and configuration

## License

AGPL-3.0
