## Copilot instructions — Quick Commerce (OpenWork / Quikry)

Short: Help contributors make small, safe edits quickly. Focus on frontend Vite apps, the shared-ui pattern, and where backend stubs and sample data live.

Key places
- Frontend apps: `frontend/customer-app/`, `frontend/delivery-app/`, `frontend/seller-dashboard/`, `frontend/customer-service-dashboard/` (each is a Vite app; entry: `src/main.jsx`).
- Shared UI library: `frontend/shared-ui/src/` — always imported via relative paths (e.g. `../../../shared-ui/src/index.jsx`).
- Backend stubs & DB init: `backend/*/` and `backend/database/init-mongo.js` (sample data for Mongo `quick-commerce`).

Run & debug (quick)
- From repository root prefer root-level scripts (some scripts live in `openwork-platform/`):
  - `npm run dev` — starts `customer-app` locally (port 3000)
  - `npm run start:all` — attempts to start all web apps (requires `concurrently` installed at root)
  - `npm run start:delivery|seller|customer-service` — start individual apps (ports 5174, 5175, 5176)
- Mongo sample data: `mongo < openwork-platform/backend/database/init-mongo.js`

Conventions & gotchas (important for automated edits)
- Shared UI: Do NOT convert relative imports to workspace package imports — the repo relies on direct relative paths. Search for `shared-ui/src` when touching UI components.
- Entry files: Vite apps use `src/main.jsx` (not `index.js`). Ensure HMR-friendly exports (prefer named exports in shared components).
- Local state: Customer and delivery apps persist to `localStorage` (keys like `quikry_*` and `delivery_*`). When changing forms/state, update both in-memory state and localStorage usage.
- Maps: Project uses Leaflet + OSM Nominatim. When editing map code, preserve icon imports from `leaflet/dist/images/` to avoid broken markers.

Common tasks for AI edits (examples)
- Add a new shared component: place files under `frontend/shared-ui/src/`, export it from `index.jsx`, and update one consuming app `src/main.jsx` to import relatively.
- Wire a new API call: frontends currently use mock/hardcoded data — locate mock data in `src/components` or `backend/database` and add a thin fetch wrapper; don't assume an existing backend implementation.
- Update sample data: edit `openwork-platform/backend/database/init-mongo.js` and describe the schema (collections: `users, products, categories, inventory, orders, stores`).

Edge cases & safety checks
- Many backend services are stubs — avoid adding production backend wiring unless you update `init-mongo.js` and document expected collections.
- Tests: there are no automated tests in the repo. Prefer small, reversible changes and add a short manual verification note in the PR.

Search hint
- Use workspace search for these anchor files when exploring: `src/main.jsx`, `frontend/shared-ui/src/index.jsx`, `openwork-platform/backend/database/init-mongo.js`, `customer-app/src/components/Cart/Cart.js`, `delivery-app/web/src/DeliveryMap.jsx`.

If something seems missing
- Call out missing pieces in the PR description (e.g., "backend service X is a stub; front-end change uses mock data in Y").

If this file needs tweaks or more examples, tell me which area you want expanded (run commands, shared-ui examples, or DB schema).  

