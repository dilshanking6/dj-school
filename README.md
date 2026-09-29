# Digital Janta Portal — Janta +2 High School, Khalari

A school management portal for students, teachers, the principal's office and the administrator.
Attendance, results, study material, notices, events, complaints and school chat in one place,
built mobile-first so it works well on a phone.

## What is in the box

- **Student** — own attendance, results, class material, notices, events, complaints, class chat.
- **Teacher** — mark attendance and upload results for their own class, share material, run class channels.
- **Principal** — whole-school view, complaint queue, staff directory, school-wide announcements.
- **Administrator** — account approval and suspension, school-wide overview, portal health.

Data is stored in a Google Sheet that is written to by a Google Apps Script web app. The Node/Express
server is the only thing that talks to Apps Script — browsers never receive the Apps Script URL.

## Requirements

- Node.js 18 or newer
- A Google Sheet with the tabs listed below
- A deployed Google Apps Script web app (execute as the sheet owner, anyone with the link can call it)
- A Gmail account with an App Password if you want email one-time codes in production (see
  [Verification codes](#verification-codes-otp))
- A free SMS provider (2Factor, Fast2SMS or a webhook) if you want phone one-time codes in production

## Install

```bash
npm run install-all
```

## Configure

Create `server/.env`:

```ini
PORT=5000
JWT_SECRET=<long random string>
APPS_SCRIPT_URL=https://script.google.com/macros/s/<id>/exec

# Verification codes: email (Gmail SMTP + App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.school@gmail.com
SMTP_PASS=<16 char Google app password>

# Verification codes: mobile (one free provider)
SMS_PROVIDER=2factor
SMS_API_KEY=<provider api key>

# Production only — deployed frontend origin(s), comma separated
CLIENT_ORIGIN=https://portal.your-school.example
```

- `JWT_SECRET` must be set. If it is missing the server refuses to verify sessions and logs a warning at boot.
- Without SMTP and SMS keys, verification codes are printed to the server console and work **only** in
  development. In production each endpoint returns a clear error naming the missing setting, and the
  register/login screens hide the channel that cannot work.
- Without `CLIENT_ORIGIN`, production CORS allows no browser origins. Development defaults to
  `localhost:5173` and `127.0.0.1:5173`.

Never commit `server/.env`. It is already in `.gitignore`.

`server/.env.example` lists every setting with a short note on what it does.

## Verification codes (OTP)

Accounts and phone sign-in are gated behind a one-time code, delivered over one of two channels.
Whichever channels the server can actually deliver are the ones the UI shows.

| Channel | Needs | Env |
| --- | --- | --- |
| Email | Gmail SMTP + Google App Password | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `MAIL_FROM` |
| Mobile | a free SMS provider | `SMS_PROVIDER` + `SMS_API_KEY` (or `SMS_WEBHOOK_URL`) |

`GET /api/auth/otp-channels` is public and reports only whether each channel works, so the frontend
can offer just those. `GET /api/status` additionally carries the provider names and the `reason` a
channel is unavailable, which is what an operator needs — those env var names stay in the status
endpoint, the boot log and `npm run check:otp`, never in a page a user sees.

When a channel cannot deliver, the browser gets a plain sentence ("Abhi email par code nahi bhej pa
rahe. Mobile number se verify karo."). The technical reason is logged server-side instead of being
pushed at the person signing up.

### Email: Gmail App Password, step by step

1. Sign in to the Gmail account that will send the codes (a dedicated school account is best).
2. Open <https://myaccount.google.com/security> and turn on **2-Step Verification** (Google requires it
   before app passwords exist). Verify with a phone number or a backup code if prompted.
3. Back on that page, open **App passwords**. If the entry is missing, 2-Step Verification was not
   genuinely enabled — enable it, sign out, sign back in, and check again.
4. Name the app anything (e.g. `Digital Janta OTP`), set the app to **Mail**, and press **Create**.
5. Google shows a **16-character password once**. Copy it immediately; it cannot be viewed again.
6. Paste it into `server/.env` without quotes and without spaces:

   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your.school@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   ```

   On Render and other hosts set the same values as environment variables, quoting nothing.
7. Confirm the setup with `npm run check:otp -- your.school@gmail.com` from the `server` folder
   (see below). It logs in over SMTP and sends one real test code.

Common failures, all reported verbatim in the app instead of a generic 500:

- `535 5.7.8 Username and Password not accepted` — the 16-character app password was not used, 2-Step
  Verification is off, or the account is a Workspace account whose admin has disabled app passwords.
- `ECONNECTION` / timeout — the host is blocking outbound port 587. Try a host that allows SMTP, or
  keep codes in development mode while the office sorts it out.
- Mail lands in spam — add the sending address to the recipient's contacts, and set `MAIL_FROM` to the
  same address you authenticate with.

### Mobile: a free SMS provider

Three providers are supported; pick one and set `SMS_PROVIDER` to match.

**2Factor** (easiest, free trial credits)

1. Sign up at <https://2factor.in>.
2. Copy the API key from the dashboard ("API Key" section).
3. `SMS_PROVIDER=2factor` and `SMS_API_KEY=<key>`. The server calls the `AUTOTP` route, which sends
   our own code, so verification stays in our hands.

**Fast2SMS** (free signup credits, Indian numbers)

1. Sign up at <https://www.fast2sms.com/dev-api> with a mobile number.
2. Copy the API token from the developer dashboard.
3. `SMS_PROVIDER=fast2sms` and `SMS_API_KEY=<token>`. The default route `q` is Quick SMS, which needs no
   DLT registration. If you do have a DLT sender ID and template, set `SMS_F2S_ROUTE=dlt` plus
   `SMS_F2S_SENDER_ID` and `SMS_F2S_TEMPLATE`.

**Webhook** (any gateway you already have)

1. Set `SMS_PROVIDER=webhook` and `SMS_WEBHOOK_URL=https://...`.
2. The server POSTs `{ to, message, code }` and treats HTTP 200 with a truthy `error` field as a
   failure. `to` is already in country-code form (`919876543210`).

Numbers are 10 digits (`9876543210`); the server adds `91`. Free tiers are limited to a few hundred
messages per account, which is enough for a school signup day — top up or swap providers when needed.

### Checking the setup

```bash
cd server
npm run check:otp                                 # config only, nothing is sent
npm run check:otp -- your.school@gmail.com        # + sends a real email code
npm run check:otp -- your.school@gmail.com 9876543210   # + a real SMS
```

The script uses the same mailer and SMS code the app uses, prints `OK`/`FAIL` per step, never prints a
key or password, and exits with the provider's own error message when a send fails. When
`NODE_ENV=development` it also notes that codes are visible in the API response, which is how you test
without spending SMS credits.

### Development without any provider

In development the server returns the code as `devCode` and the register screen shows a "click to fill"
button, so no SMTP or SMS account is needed to build the flow. `NODE_ENV=production` (or any deployment
without the keys) disables this entirely — `ALLOW_DEV_EMAIL_CODE=true` re-enables it deliberately, and
must never be set on a public server.

## Google Sheet tabs

The Apps Script web app must expose these actions. Every tab keeps its header in row 1.

| Tab | Columns |
| --- | --- |
| `Users` | name, email, password hash, role, class, detail JSON (holds `status`), user id, avatar, phone, subject, degree, experience, first name, last name, section, mother name, father name |
| `Attendance` | date, class, student id, student name, status, marked by, row id |
| `Results` | class, student id, student name, subject, marks, total, exam, uploaded by, row id, created at |
| `Notes` | date, author id, author name, title, subject, class, file link or data, row id, type, description, file name |
| `Events` | row id, title, date, time, venue, description, created by, created at |
| `Announcements` | row id, title, message, audience, created by, created at |
| `Complaints` | date, student id, student name, subject, description, status, row id |
| `Ratings` | date, student id, teacher id, teacher name, rating, comment, row id |
| `ChatRooms` | room id, name, type, class, members, created by, created by name, created at |
| `RoomMembers` | room id, user id, name, role, joined at |
| `Messages` | time, sender id, room id, content, sender role, message id, sender id, type, sender name, attachment |
| `StudyContent` | id, class, subject, title, points (`;`-separated), details (`;;`-separated), updated at, updated by |

A user `status` of `active`, `pending` or `banned` lives inside the `detail` JSON column. New students are
`active`; new teachers are `pending` until the administrator approves them.

## Study Hub and the AI tutor

- `client/public/study/` is a self-contained, offline-capable app (classes 9–12) with its own service
  worker (`/study/sw.js`) and locked class links (`/study/?class=N&locked=1`) used from dashboards.
- Base chapter notes and questions are **in this repository** (`client/public/study/js/notes.js`,
  generated by `server/scripts/buildStudyBundle.js`). The class-10 board question bank is read from
  `client/public/study/js/data.js`. Subjects, chapters and question counts are static.
- Principal/admin edits go to the `StudyContent` sheet via the content manager (`/admin/study-content`).
  Those edits are merged on top of the base notes on every read; a delete reverts to the base content.
- `GET /api/study/outline?class=N` is the light path the homepage and landing page use (counts only),
  so no 1.65 MB bundle is downloaded just to show stats.
- The AI tutor (`POST /api/ai/chat`, no login needed) answers chapter questions, maths and practice
  questions in Hindi/English from the same content. Without `AI_API_KEY` it is fully local and keeps
  answers syllabus-bound. Guest rate limits are per-IP; signed-in users have their own bucket.
- Copy `server/.env.example` for the full list of supported settings (AI provider, sheet timeouts,
  OTP TTL, rate limits).

## Run

```bash
npm run dev      # server on :5000, client on :5173
```

The Vite dev server proxies `/api` and `/socket.io` to the backend, so the browser talks to one origin.

```bash
npm run build    # build the client into client/dist
npm start        # production: server serves the API and client/dist together
```

In production set `NODE_ENV=production`, `CLIENT_ORIGIN`, the SMTP block and one SMS provider. The
server then serves `client/dist` and only the API responds to unknown `/api/*` paths.

At boot the server prints one line per channel, so a missing key is visible immediately:

```
[config] Email OTP ready (smtp).
[config] Mobile OTP is NOT configured (SMS_API_KEY is missing). ...
```

## First accounts

- Students and teachers can register themselves from the portal, after verifying either their email or
  their mobile number. Whichever channel the server has configured is the one offered.
- A new teacher account is `pending` until the administrator approves it in the admin dashboard.
- Principal and administrator accounts must be added to the `Users` tab by the school office, with a
  bcrypt hash in the password column. There is deliberately no public "create admin" endpoint.

## How access control works

- Sessions are JWTs in `localStorage.dj_user`; the same token authenticates the Socket.IO handshake.
- `req.user` carries `id`, `role` and `class`. Teachers are limited to their own class for attendance,
  results, user lists and class channels.
- Private chat requires membership. Public class channels reject students of other classes.
- Complaint and notice events are sent to personal or role socket rooms, never broadcast to everyone.
- The landing page reads only `/api/public/portal-stats` and `/api/public/top-teachers`, which return
  aggregate numbers and never personal records. Teacher rankings need at least three ratings to appear.

## Checks

```bash
# verification delivery: config check, then a real send to your own inbox/phone
cd server
npm run check:otp
npm run check:otp -- you@gmail.com 9876543210

# backend: every module must load without error
node -e "const fs=require('fs'),p=require('path');const s=new Set(['node_modules','.git','dist']);const w=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(s.has(e.name)?[]:w(p.join(d,e.name))):(e.name.endsWith('.js')?[p.join(d,e.name)]:[]));const f=w('.').filter(x=>!x.endsWith('index.js'));let ok=0,b=[];for(const x of f){try{require(p.resolve(x));ok++}catch(e){b.push(x+' -> '+e.message)}}console.log('LOADED',ok+'/'+f.length);if(b.length)console.log(b.join('\n'));process.exit(0);"

# frontend: must build clean
cd client && npm run build
```

## Not built yet

- No automated test suite. Changes should be checked in a browser on a phone-sized screen.
- The SPA portal needs a working connection; the **Study Hub** (`/study/`) is the only offline-cached part
  (its service worker caches notes, bundle and app shell).
- No push notifications. Notices arrive over the open socket while the portal is in use.

## Troubleshooting

**`Storage service timed out` or `Storage service rejected the request`**
The Apps Script web app is the real datastore, and it is the most likely thing to be unhealthy — the
Node server is only a client of it. Open the Apps Script project and run it once from the editor to see
the real error. Common causes:

- The daily execution quota for the script's Google account is used up. Apps Script shows this on the
  Executions page. Free accounts get a small daily budget; a school portal can exceed it.
- The script is still deploying an older version. Redeploy: Deploy → Manage deployments → edit → New
  version, and make sure `APPS_SCRIPT_URL` points at that version.
- A tab was renamed or deleted. The tab names in the table above must match exactly.

Reads can take 15–30 seconds on a cold start. `SHEET_READ_TIMEOUT` and `SHEET_WRITE_TIMEOUT` raise
those limits if your deployment is slower.

**`/api/status` says `storage: not-configured`**
`APPS_SCRIPT_URL` is missing from `server/.env`.

**Sign-in says codes are temporarily unavailable**
No SMS provider is set while `NODE_ENV=production`. Set `SMS_PROVIDER` + `SMS_API_KEY` (or
`SMS_WEBHOOK_URL`), or ask users to use email and password. `GET /api/auth/otp-channels` names the
missing setting.

**A verification code never arrives in email**
Run `npm run check:otp -- you@gmail.com` from `server`. It verifies the SMTP login and prints the
provider's own error (for example `535 ... Password not accepted`), which is why the app shows that
message instead of a generic failure. See
[Email: Gmail App Password](#email-gmail-app-password-step-by-step).

**The register screen shows only one verification option**
The UI only offers channels the server reports as available. Boot logs and `/api/status` say which
setting is missing for the other one.

**A teacher sees nothing for their class**
The teacher's `class` column in the `Users` tab is `N/A`. Set it to `9`, `10`, `11` or `12`.

