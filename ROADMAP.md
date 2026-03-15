# Promise Pipeline — Roadmap

## Current Status: Phase 2

The v2 build delivers the dependency graph and deterministic cascade simulation engine. The universal promise schema (v2.1) supports polarity, scope, origin, violation types, and threats.

## Phase 1: Foundation (Complete)
- Promise schema definition and type system
- HB 2021 data with all 20 promises
- Status tracking and verification fields
- Landing page and basic UI

## Phase 2: Simulation Engine (Current — v2)
- Dependency graph with edges between promises
- Deterministic BFS cascade propagation
- What If interaction: change a promise's status, see downstream effects
- Threat modeling: lateral cascade across domains
- Network health scoring
- SVG graph visualization
- v2.1 schema additions: polarity, scope, origin, violationType, Threat type
- Promise Garden (personal tracker)
- Team promise app with capacity simulation
- Sanity CMS for blog content

## Phase 3: Machine Learning (Next)
- NLP extraction of promises from legislative text
- Promise annotation tool for training data
- Learned edge weights from historical fulfillment patterns
- Probabilistic cascade prediction
- Mean Time to Keep a Promise (MTKP) trending

## Phase 4: Platform
- Supabase authentication and database migration
- Multi-tenant team workspaces
- Real-time collaboration
- API for third-party integrations
- Automated sensor verification (EPA AirNow, utility filings)

## Phase 5: Scale
- Promise Garden native app (iOS/Android via Capacitor)
- Enterprise features and subscription tiers
- Data contribution ecosystem with sovereignty controls
- Cross-vertical promise networks
- Public accountability API
