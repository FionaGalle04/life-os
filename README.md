# LIFE-OS ✦

A personal, installable web app for planning life in one place: calendar, university, fitness, finances, projects, and focus.

## Product direction

- **Visual style:** warm Soft Academia; cream backgrounds, dusty rose, mauve, sage, and Bordeaux accents.
- **Responsive first:** desktop dashboard plus a genuinely usable mobile experience, especially fast workout logging at the gym.
- **All sports are equal:** gym, cycling, running, and swimming are first-class activities.
- **Data:** plan for authenticated, cross-device sync; never put secrets or private user data in client-side source code.
- **Integrations:** calendar providers, Spotify, and Strava are later integrations requiring explicit user authorization.
- **No habit tracker** unless the product owner changes this requirement.

## Planned modules

1. Home dashboard, quick links, quote of the day.
2. Calendar: month/week/day, events, tasks, exams, workouts.
3. Fitness: workout history, goals, progress, and exercise-by-exercise gym logging (sets, weight, reps, optional RIR and notes).
4. University and study planning.
5. Finance: income, expenses, budgets, summaries.
6. Projects and tasks.
7. Focus: Pomodoro timer and music links.

## Proposed stack

- React + TypeScript + Vite
- Vitest + React Testing Library for unit/component tests
- GitHub Actions for checks and static deployment
- GitHub Pages for hosting the frontend
- Supabase (or another reviewed backend) for authentication and synchronized data

The backend provider and schema must be reviewed before storing real personal information. GitHub Pages serves static assets; it is not a private backend.

## Development workflow

Read [CLAUDE.md](./CLAUDE.md), [Product Spec](./docs/PRODUCT_SPEC.md), [Design System](./docs/DESIGN_SYSTEM.md), and [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) before implementation.

Follow the Superpowers-style sequence: clarify requirements, design, plan, implement in small testable slices, run tests, and verify the actual result. Keep changes focused and use branches/pull requests for parallel work.

## Status

Planning foundation. No functional app or integrations have been implemented yet.
