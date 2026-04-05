# HabitTracker

HabitTracker is a full-stack habit tracking app with a Spring Boot backend and a React (Vite + TypeScript) frontend. It supports account creation, JWT authentication, habit management, daily check-ins, and profile updates.

## Tech stack

- Backend: Spring Boot 4, Java 17, PostgreSQL, JWT
- Frontend: React 19, Vite 8, TypeScript, Zustand, Axios

## Features

- Auth: register, login, token validation
- Profile: username, email, date of birth, profile photo URL, end goal
- Habits: create, list, update, delete
- Entries: mark habits complete for a day, view daily history
- Dashboard: checklist view, progress, and computed stats
- Calendar: per-day status with entry details

## Project structure

- HabitTracker_Backend: Spring Boot API and database layer
- HabitTracker_Frontend: React UI
- FRONTEND_SPECIFICATION.md: design notes (currently empty)

## Quick start

### 1) Backend (Spring Boot)

Prerequisites:
- Java 17
- PostgreSQL running locally

Configure the database in `HabitTracker_Backend/src/main/resources/application.properties` or set environment variables to override it.

Run the backend:

```bash
cd HabitTracker_Backend
./mvnw spring-boot:run
```

The API runs on http://localhost:8080.

### 2) Frontend (React)

Prerequisites:
- Node.js 18+ (recommended)

Run the frontend:

```bash
cd HabitTracker_Frontend
npm install
npm run dev
```

The app runs on http://localhost:5173.

## Environment variables

### Backend

The backend reads values from `application.properties`:

- `spring.datasource.url` (PostgreSQL connection URL)
- `spring.datasource.username`
- `spring.datasource.password`
- `jwt.secret` (can be overridden via `JWT_SECRET`)
- `server.port` (default 8080)

### Frontend

The frontend uses the browser origin by default. Set a custom API base URL if needed:

```
VITE_API_BASE_URL=http://localhost:8080
```

Create a `.env` file inside HabitTracker_Frontend to set this.
For production, set it to your Render URL (example):

```
VITE_API_BASE_URL=https://habittracker-1-assk.onrender.com
```

## API overview

Base URL: `http://localhost:8080/api`

Auth:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/validate`

User profile:
- `GET /user`
- `PUT /user`
- `PUT /user/password`
- `DELETE /user`

Habits:
- `POST /habits`
- `GET /habits`
- `GET /habits/{habitId}`
- `PUT /habits/{habitId}`
- `DELETE /habits/{habitId}`

Entries:
- `POST /habits/{habitId}/entries`
- `GET /habits/{habitId}/entries`
- `GET /entries`

All protected routes require `Authorization: Bearer <token>`.

## Notes on stats

Dashboard and profile stats are computed on the frontend from entry history:
- Progress = completed habits for today / total habits
- Weekly average = average completion rate for the last 7 days
- Current streak = consecutive days with 100% completion

If you want a different streak rule or server-side stats, update the logic in the dashboard and profile pages.

## Troubleshooting

- 401 on login: ensure the user exists and you are logging in with email.
- CORS errors: backend CORS is controlled by `app.cors.allowed-origin-patterns` in the backend config.
- Calendar date mismatch: entries are stored using local date keys; clear old entries if needed.

## Additional docs

See the backend documentation in HabitTracker_Backend for architecture, security, and testing guides.
