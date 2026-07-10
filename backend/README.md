# Origin Backend — Deadline Email Alerts

Standalone Node.js/Express service that scans the `applications` Firestore
collection daily and emails users when a tracked deadline is 7, 3, or 1
day(s) away.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — Gmail address + an
  [App Password](https://myaccount.google.com/apppasswords) (not your normal password).
- `FIREBASE_SERVICE_ACCOUNT_KEY` — full service-account JSON as one line, **or**
  drop the file as `backend/serviceAccountKey.json` for local dev (gitignored).

## Run

```bash
npm run dev     # nodemon, auto-restart
npm start        # plain node
```

Server starts on `http://localhost:4000` (configurable via `PORT`).

## Endpoints

- `GET /health` — liveness check.
- `POST /run-deadline-check` — manually trigger a scan + send, without
  waiting for the cron. Useful for testing.

## Schedule

Runs automatically via `node-cron` using `DEADLINE_CHECK_CRON`
(default `0 8 * * *` — every day at 08:00 server time).

## How it avoids duplicate emails

Each `applications` document gets a `sentAlerts: number[]` field
(e.g. `[7, 3]`) recording which thresholds have already been emailed.
The checker only sends an alert for a threshold not yet in that array.

## Skipped statuses

Applications already in a terminal stage (`Rejected`, `Selected`,
`Offer Received`, `Joined`, `Ongoing`, `Completed`, `Winner`) are skipped —
no point alerting on those.
