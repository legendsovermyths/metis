# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Metis

Metis is a Tauri 2 desktop app — an AI-powered tutoring system that turns PDF textbooks into structured learning journeys with dialogue-based teaching. The frontend is React/TypeScript (Vite), the backend is Rust, and the LLM provider is Google Gemini.

## Commands

```bash
# Frontend dev server (port 1420)
npm run dev

# Full desktop app (frontend + Rust backend)
npm run tauri dev

# Build production desktop app
npm run tauri build

# Lint frontend
npm run lint

# Tests
npm run test            # single run (vitest)
npm run test:watch      # watch mode
npx vitest run src/path/to/file.test.ts  # single test file
```

## Architecture

### Frontend → Backend bridge

All communication goes through a single Tauri command `handle_request`. The frontend's `src/lib/service.ts` wraps `invoke("handle_request", { request })` — every backend call flows through `callService()` which also auto-updates the global `AppContext` from the response.

Requests have two API types:
- `Service` — routed to `ServiceHandler` for CRUD operations (AnalyseBook, GenerateCourse, GetAllBooks, etc.)
- `UserMessage` — routed to `AgentHandler` which delegates to the active agent based on chat phase

### Rust backend (`service/src/`)

- **`app/`** — `App` struct holds shared `AppContext` (behind `Arc<Mutex>`), a `ServiceHandler`, and an `AgentHandler`. `AppContext` tracks selected book, chat phase, teaching state, and onboarding status.
- **`agent/`** — Three agents implementing the `Agent` trait (`generate()` method):
  - `onboarder` — profiles the user during first run
  - `advisor` — helps pick a book/chapter and plan a learning journey
  - `narrator` — delivers lessons as structured dialogues
- **`agent/handler.rs`** — Routes messages to the correct agent based on `ChatState.phase` (Idle, Onboarding, Advising, Teaching)
- **`llm_client/`** — Gemini API client with tool-use (function calling). Agents declare tools; the LLM client executes the tool loop.
- **`api/`** — Request/response types and `ServiceHandler` dispatch
- **`db/`** — SQLite via rusqlite with `OnceLock` singleton. Repos: `AppDataRepo`, `BooksRepo`, `JourneysRepo`, `DialogueRepo`. Migrations in `service/migrations/`.
- **`prompts/markdowns/`** — System prompts for each agent and utility task (book analysis, page-to-markdown conversion, etc.)
- **`utils/`** — PDF parsing (`pdf.rs`), shell commands (`cmd.rs`), formatting helpers

### Frontend (`src/`)

- **`pages/`** — Route-based: HomePage, ChatPage, LibraryPage, JourneysPage, JourneyDetailPage, TeachingPage
- **`context/`** — `AppContextProvider` holds global state; `BookUploadProvider` and `JourneyCreationProvider` manage multi-step flows
- **`lib/service.ts`** — All backend API calls. Types here mirror the Rust structs via Serde.
- **`components/ui/`** — shadcn/ui components (do not edit directly; regenerate with shadcn CLI)

### Data flow

1. Frontend calls a function from `service.ts` (e.g. `sendMessage()`)
2. Tauri invokes `handle_request` on the Rust side
3. `App.handle_request` routes to `ServiceHandler` or `AgentHandler`
4. Agents interact with Gemini via tool-use loops, modifying `AppContext` and DB
5. Response includes updated `AppContext`; frontend's `callService` pushes it to React context

### Database

SQLite stored at `../data/metis.db` (relative to `service/`). Four tables: `books`, `journeys`, `appdata` (key-value), `dialogues`.

## Key conventions

- Frontend import alias: `@/` maps to `src/`
- Rust types and frontend TypeScript types must stay in sync (serialized via Serde JSON)
- Agents use tool declarations (`tools.rs` in each agent directory) — adding a new tool means defining it in Rust and referencing it in the agent's system prompt
- The `.env` file in `service/` must contain `GEMINI_API_KEY`
- Books are stored as PDFs in `books/`, with extracted content in chapter subdirectories
