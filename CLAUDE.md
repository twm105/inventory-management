# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Factory Inventory Management System Demo with GitHub integration - Full-stack application with Vue 3 frontend, Python FastAPI backend, and in-memory mock data (no database).

## Critical Tool Usage Rules

### Subagents
Use the Task tool with these specialized subagents for appropriate tasks:

- **vue-expert**: Use for Vue 3 frontend features, UI components, styling, and client-side functionality
  - Examples: Creating components, fixing reactivity issues, performance optimization, complex state management
  - **MANDATORY RULE: ANY time you need to create or significantly modify a .vue file, you MUST delegate to vue-expert**
- **code-reviewer**: Use after writing significant code to review quality and best practices
- **Explore**: Use for understanding codebase structure, searching for patterns, or answering questions about how components work
- **general-purpose**: Use for complex multi-step tasks or when other agents don't fit

### Skills
- **backend-api-test** skill: Use when writing or modifying tests in `tests/backend` directory with pytest and FastAPI TestClient
- **saas-redesign** skill: Use when redesigning the Vue 3 UI to a modern SaaS-style layout with a vertical sidebar, consistent spacing, and polished professional look

### MCP Tools
- **ALWAYS use GitHub MCP tools** (`mcp__github__*`) for ALL GitHub operations
  - Exception: Local branches only - use `git checkout -b` instead of `mcp__github__create_branch`
- **ALWAYS use Playwright MCP tools** (`mcp__playwright__*`) for browser testing
  - Test against: `http://localhost:3000` (frontend), `http://localhost:8001` (API)

## Stack
- **Frontend**: Vue 3 + Composition API + Vite (port 3000)
- **Backend**: Python FastAPI (port 8001) managed by `uv`
- **Data**: JSON files in `server/data/` loaded at startup via `server/mock_data.py`

## Commands

```bash
# Backend
cd server && uv run python main.py

# Frontend
cd client && npm install && npm run dev

# Backend tests (run from tests/ directory)
cd tests && uv run pytest backend/ -v

# Run a single test file
cd tests && uv run pytest backend/test_dashboard.py -v

# Run a single test
cd tests && uv run pytest backend/test_dashboard.py::TestDashboardEndpoints::test_name -v
```

## Architecture

**Filter System**: 4 shared filters (period, location/warehouse, category, status) managed as a singleton via `client/src/composables/useFilters.js`. All views import this composable — state is shared, not duplicated. Filter values flow as query params to FastAPI, which applies them via the shared `apply_filters()` utility in `server/main.py`.

**Data Flow**: Vue filter composable → `client/src/api.js` (axios, converts `'all'` to omitted params) → FastAPI → `apply_filters()` + optional month/quarter filtering → Pydantic validation → Vue refs → computed properties → template

**Reactivity Pattern**: Raw data stored in `ref()` (e.g., `allOrders`, `inventoryItems`). All derived/displayed data is in `computed()` properties. Never mutate the raw refs directly.

**Backend Data**: All data loaded from JSON at module import time in `mock_data.py` as module-level variables. No database, no persistence — all filtering is in-memory on list copies.

**i18n**: English/Japanese support via `client/src/composables/useI18n.js` and `client/src/locales/{en,ja}.js`. Use the composable for any user-visible strings.

## API Endpoints

| Endpoint | Filters |
|---|---|
| `GET /api/inventory` | `warehouse`, `category` |
| `GET /api/inventory/{item_id}` | — |
| `GET /api/orders` | `warehouse`, `category`, `status`, `month` (supports Q1–Q4) |
| `GET /api/orders/{order_id}` | — |
| `GET /api/dashboard/summary` | `warehouse`, `category`, `status`, `month` |
| `GET /api/demand` | — |
| `GET /api/backlog` | — |
| `GET /api/spending/summary` | — |
| `GET /api/spending/monthly` | — |
| `GET /api/spending/categories` | — |
| `GET /api/spending/transactions` | — |
| `GET /api/reports/quarterly` | — |
| `GET /api/reports/monthly-trends` | — |

`spending.json` has a nested structure (`spending_summary`, `monthly_spending`, `category_spending` keys) — update `mock_data.py` carefully if the schema changes.

## Common Issues
1. Use unique keys in `v-for` — use `sku`, `month`, etc., never array index
2. Validate dates before calling `.getMonth()` — data can have null dates
3. Update Pydantic models in `server/main.py` when changing JSON data structure
4. Inventory filters don't support `month` (no time dimension on inventory data)
5. Quarter filtering (`Q1`–`Q4`) is supported for orders via `QUARTER_MAP` in `main.py`; not available on inventory
6. Revenue goals: $800K/month (single month selected), $9.6M YTD (all months)

## Key File Locations
- Views: `client/src/views/*.vue`
- Reusable components: `client/src/components/*.vue`
- Shared state: `client/src/composables/useFilters.js`, `useAuth.js`, `useI18n.js`
- API client: `client/src/api.js`
- Backend: `server/main.py`, `server/mock_data.py`
- Mock data: `server/data/*.json`
- Tests: `tests/backend/` (conftest.py + test_*.py)
- Global styles: `client/src/App.vue`

## Design System
- Colors: Slate/gray (`#0f172a`, `#64748b`, `#e2e8f0`)
- Status colors: green/blue/yellow/red
- Charts: Custom SVG only — no charting library
- Layouts: CSS Grid
- No external CSS framework (no Tailwind, no Bootstrap)
- No emojis in UI
