# Implementation Plan — LIFE-OS

Current usable slice: see [USABLE_MVP.md](./USABLE_MVP.md) and README. The first fitness workflows are implemented and automatically checked; live Supabase and physical iPhone verification remain open.

## Phase 0 — Foundation
- [ ] Confirm product and design spec.
- [x] Scaffold React + TypeScript + Vite.
- [x] Add formatting/linting, typecheck, test runner and a smoke test.
- [x] Add GitHub Actions CI for install, typecheck, tests and production build.
- [x] Configure a Pages-compatible base path and document deployment.

## Phase 1 — App shell and visual system
- [x] Responsive navigation/sidebar and mobile navigation.
- [x] Implement palette, typography, cards, buttons, form controls and decorative elements.
- [x] Create dashboard backed by actual saved workouts; start empty without demo records.
- [x] Verify layout at desktop and narrow mobile widths.

## Phase 2 — Fitness MVP (priority because of mobile use)
- [x] Define and test workout/session/exercise/set types.
- [x] Create/edit a gym session.
- [x] Add/remove exercises and individual sets.
- [x] Record weight, reps, optional RIR and notes per set.
- [x] Save/reload locally for the first working vertical slice; isolate persistence behind an interface for later backend sync.
- [x] Add previous-workout template and editable prefilled values.
- [x] Add rest timer and unsaved-change recovery.
- [x] Add cycling/running/swimming session forms.
- [x] Test phone-sized layout and critical save/edit flows.

## Phase 3 — Calendar and tasks
- [ ] Month/week/day calendar views.
- [ ] CRUD events and tasks; category colors and filters.
- [ ] Connect workouts, study deadlines and projects to calendar records.

## Phase 4 — Study, projects, finance and focus
- [ ] Subjects, exams, study blocks and tasks.
- [ ] Project boards and next actions.
- [ ] Manual transaction tracking and summaries.
- [ ] Pomodoro timer and quote of the day.

## Phase 5 — Persistence and integrations
- [ ] Choose/configure hosted backend and authentication.
- [ ] Design schema, access policies and backup/export approach.
- [ ] Migrate from local prototype to authenticated cross-device sync.
- [ ] Evaluate calendar/iCloud, Strava and Spotify integrations individually; implement only with supported APIs and user consent.

## Phase 6 — Release
- [ ] Accessibility, responsive and regression checks.
- [ ] Verify CI.
- [x] Configure GitHub Pages workflow.
- [ ] Publish and test deployed URL on desktop and iPhone.
- [ ] Document install-to-home-screen steps and known limitations.

## Definition of done
A feature is done only when behavior is implemented, critical tests pass, mobile and desktop states are reviewed, and limitations are stated accurately.
