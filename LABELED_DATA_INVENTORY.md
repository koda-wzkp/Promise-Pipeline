# Labeled Data Inventory

## HB 2021 (Oregon Clean Energy)
- **File**: `lib/data/hb2021.ts`
- **Promises**: 20
- **Agents**: 11
- **Domains**: 7 (Emissions, Planning, Verification, Equity, Affordability, Tribal, Workforce)
- **Dependency edges**: ~30
- **Threats**: 1 (Affordability cost cap)
- **Trajectories**: 2 (PGE, PacifiCorp emissions)
- **Insights**: 6 (including v2.1 types: IncompleteBinding, ScopeGap, DesignFlaw)
- **Schema version**: v2.1 (polarity, scope, origin, violationType fields populated)

## AI Safety Demo
- **File**: `lib/data/ai-demo.ts`
- **Promises**: 5
- **Agents**: 5
- **Domains**: 3

## Infrastructure SLA Demo
- **File**: `lib/data/infra-demo.ts`
- **Promises**: 5
- **Agents**: 4
- **Domains**: 2

## Supply Chain Demo
- **File**: `lib/data/supply-chain-demo.ts`
- **Promises**: 5
- **Agents**: 5
- **Domains**: 5

## Training Data (Annotation Tool Output)
- **Directory**: `data/training/`
- **Format**: JSON per bill, with manifest
- **Status**: Empty — populated via `/annotate` tool
