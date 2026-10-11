# Product Specification — LIFE-OS

## Product goal
Create a beautiful, practical personal life dashboard that works on Windows desktop and iPhone as an installable responsive web app.

## Users and usage
Single-person personal productivity app initially. Users should be able to capture data quickly on mobile and review it comfortably on desktop. Authenticated cross-device synchronization is required before relying on the app for long-term records.

## Visual direction
Warm Soft Academia with generous decorative detail. Cream paper-like backgrounds; Bordeaux accents; dusty rose and mauve cards; sage for positive status; dark plum-brown text. Rounded cards, elegant serif headings, small icons, subtle dividers, carefully selected illustrations. Mobile layout stacks cards and uses compact navigation.

## Core modules
### Dashboard
- Welcome header and date-aware overview.
- Today's calendar, tasks, next workout, quick actions.
- Quote of the day with attribution/source.
- Navigation to every module.

### Calendar and planning
- Month, week, and day views.
- Events, tasks, exams, projects, and workouts.
- Create/edit/delete events; clear categories and colors.
- Design the data model so external calendar sync can be added later. Do not claim iCloud sync exists until implemented and authorized.

### Fitness
- Equal first-class activities: Gym, cycling, running, swimming.
- Training history, goals, progress summaries and useful filters.
- Mobile-first workout entry with large tap targets and minimal typing.
- Gym session contains multiple exercises; each exercise contains multiple sets.
- Set fields: set number, weight (kg), repetitions, optional RIR, optional notes; allow warm-up/back-off set labels if practical.
- Add/remove exercises and sets; edit prior sessions; save drafts and recover from accidental navigation where feasible.
- Reuse previous workout as a template; prefill last values as editable suggestions.
- Rest timer accessible during a session.
- Endurance activity fields: date, duration, distance, elevation, intensity/effort, notes, optional external Strava activity URL.
- Strava import is a later integration requiring OAuth/authorization and mapping; never assume it is connected.

### University and study
- Courses/subjects, deadlines, exams, tasks, study sessions.
- Calendar-linked deadlines and study blocks.
- Later extension point for flashcards.

### Finance
- Income/expense transactions, categories, date, amount, notes.
- Monthly summary and category breakdown.
- Avoid claiming bank integration; manual entry first.

### Projects and tasks
- Projects with status, next action, deadline, related tasks.
- Task list and calendar views.

### Focus
- Pomodoro timer with configurable focus/break durations.
- Sound/music shortcuts; Spotify integration later and user-authorized.
- Quote of the day.

## Non-functional requirements
- Responsive, accessible controls, keyboard navigation and readable contrast.
- Clear loading, empty, error, and success states.
- Data validation and safe persistence.
- Authentication and row-level access control before storing private data in a hosted backend.
- Never expose backend service-role keys or secrets in frontend code.
- Performance suitable for mobile; avoid large decorative assets.
- Tests for critical workflows, especially creating/editing/saving workout sets.

## MVP acceptance criteria
1. App builds and runs locally with documented commands.
2. Responsive dashboard follows the approved palette.
3. Navigation to all planned modules exists; modules not yet implemented are clearly marked as planned rather than faked.
4. Fitness MVP can create a session, add exercises and sets, edit weight/reps, and persist/reload data.
5. Mobile workout form is usable at narrow widths and has large controls.
6. Tests cover the workout data model and main editing/save flow.
7. GitHub Actions checks build/tests.
8. Deployment configuration is documented; publishing is not described as live until verified.
