# Content Operations and Analytics Dashboard

## Overview

A full-stack content operations dashboard for creators and media teams to manage their publishing pipeline, track analytics, and plan their content calendar.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/content-dashboard) at `/`
- **API framework**: Express 5 (artifacts/api-server) at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Build**: esbuild (CJS bundle)

## Features

- Content planning calendar (monthly view)
- Video/post publishing tracker with status pipeline
- Analytics dashboard with monthly trends
- Metrics tracking: views, engagement, retention, upload consistency
- Charts for monthly performance trends
- Category/tag performance analysis
- Search and filtering in content library
- Responsive dashboard-focused layout

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Project Structure

- `artifacts/content-dashboard/` — React+Vite frontend (previewPath: `/`)
- `artifacts/api-server/` — Express REST API (previewPath: `/api`)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/db/` — Drizzle ORM schema + database connection

## Database Schema

- `content` — content items (videos, posts, reels, stories, shorts) with metrics
- `calendar_events` — scheduled events, milestones, and planning entries
- `categories` — content categories with color coding

## API Routes

- `GET/POST /api/content` — list and create content
- `GET/PATCH/DELETE /api/content/:id` — content CRUD
- `PATCH /api/content/:id/metrics` — update analytics metrics
- `GET/POST /api/calendar` — calendar events
- `PATCH/DELETE /api/calendar/:id` — calendar CRUD
- `GET/POST /api/categories` — category management
- `DELETE /api/categories/:id` — delete category
- `GET /api/analytics/summary` — overall stats
- `GET /api/analytics/trends` — monthly performance trends
- `GET /api/analytics/categories` — category performance breakdown
- `GET /api/analytics/consistency` — upload consistency by week
- `GET /api/analytics/top-content` — top performing content

## Notes

- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export errors from Orval split mode
- `orval.config.ts` has `indexFiles: false` for the zod output to prevent auto-generated barrel overwriting

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
