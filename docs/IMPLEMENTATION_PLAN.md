# Implementation Plan — LIFE-OS

This plan is intentionally incremental. Review and adjust it before implementation.

## Phase 0 — Foundation
- [ ] Confirm product and design spec.
- [ ] Scaffold React + TypeScript + Vite.
- [ ] Add formatting/linting, typecheck, test runner and a smoke test.
- [ ] Add GitHub Actions CI for install, typecheck, tests and production build.
- [ ] Configure a Pages-compatible base path and document deployment.

## Phase 1 — App shell and visual system
- [ ] Responsive navigation/sidebar and mobile navigation.
- [ ] Implement palette, typography, cards, buttons, form controls and decorative elements.
- [ ] Create dashboard with realistic sample data, clearly labeled as demo data.
- [ ] Verify layout at desktop and narrow mobile widths.

## Phase 2 — Fitness MVP (priority because of mobile use)
- [ ] Define and test workout/session/exercise/set types.
- [ ] Create/edit a gym session.
- [ ] Add/remove exercises and individual sets.
- [ ] Record weight, reps, optional RIR and notes per set.
- [ ] Save/reload locally for the first working vertical slice; isolate persistence behind an interface for later backend sync.
- [ ] Add previous-workout template and editable prefilled values.
- [ ] Add rest timer and unsaved-change recovery.
- [ ] Add cycling/running/swimming session forms.
- [ ] Test phone-sized layout and critical save/edit flows.

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
- [ ] Configure GitHub Pages workflow.
- [ ] Publish and test deployed URL on desktop and iPhone.
- [ ] Document install-to-home-screen steps and known limitations.

## Definition of done
A feature is done only when behavior is implemented, critical tests pass, mobile and desktop states are reviewed, and limitations are stated accurately.
