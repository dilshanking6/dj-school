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
| Email (free — works on Render free plan) | a separate mail-only Apps Script web app | `MAIL_TRANSPORT=apps-script`, `APPS_SCRIPT_MAIL_URL`, `APPS_SCRIPT_MAIL_TOKEN` |
| Email (SMTP) | Gmail SMTP + Google App Password — **blocked on Render's free plan** | `MAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `MAIL_FROM` |
| Mobile | a free SMS provider | `SMS_PROVIDER` + `SMS_API_KEY` (or `SMS_WEBHOOK_URL`) |

`MAIL_TRANSPORT` says which of the two email paths is the real one:

| Value | Meaning |
| --- | --- |
| `apps-script` | Only the Apps Script path. **Use this on Render's free plan.** |
| `smtp` | Only Gmail SMTP. Use this on a paid Render plan or any other host. |
| `auto` (default) | Whichever is configured — Apps Script first, SMTP as fallback. |

Why this matters: **Render's free plan blocks outbound traffic to SMTP ports
`25`, `465` and `587`** (Render docs, since September 2025). The credentials can be
perfectly correct and every mail still dies on a connection timeout, because the TCP
connection is never allowed to open. SMS works because providers talk HTTPS (port
443), which is not blocked.

Earlier the server only checked "are the env vars filled in", so `/api/status` and
`/api/auth/otp-channels` reported `available: true` for a channel that could never
send anything — the UI then offered email sign-up that always failed with a 503
after an 11-second wait. On boot the server now **actually opens a socket to the
SMTP host's port** and remembers whether it connected (`probeSmtp()` in
`server/utils/mailer.js`). The answer feeds `available`, the transport fallback
list, and the boot log:

- port reachable → SMTP stays available and is used as the fallback
- port blocked → SMTP is dropped from the fallback list and email reports
  `available: false`, so the UI stops offering a channel that cannot work

The result is automatic — no env var has to be declared by hand. On a paid plan or
any normal host the probe succeeds and email keeps working exactly as before.

`GET /api/auth/otp-channels` is public and reports only whether each channel works, so the frontend
can offer just those. `GET /api/status` additionally carries the provider names and the `reason` a
channel is unavailable, which is what an operator needs — those env var names and the provider name
stay in the status endpoint, the boot log and `npm run check:otp`, never in a page a user sees.

When a channel cannot deliver, the browser gets a plain sentence ("Abhi email par code nahi bhej pa
rahe. Mobile number se verify karo."). The technical reason is logged server-side instead of being
pushed at the person signing up.

### Email: Apps Script over HTTPS (free — no SMTP ports needed)

The whole setup is in [`server/scripts/appsScriptMail.gs`](server/scripts/appsScriptMail.gs); the
short version:

1. <https://script.google.com> → **New project** → paste that entire file.
2. Set `MAIL_TOKEN` to any long random string (40+ characters).
3. **Deploy → New deployment → Web app**; *Execute as* = **Me**, *Who has access* = **Anyone**.
   Deploy and copy the `/exec` URL.
4. On Render set `APPS_SCRIPT_MAIL_URL` to that URL, `APPS_SCRIPT_MAIL_TOKEN` to the same
   `MAIL_TOKEN`, and `MAIL_TRANSPORT=apps-script`.
5. **Manual Deploy → Deploy latest commit** (env changes never auto-deploy by themselves).
6. Verify: `npm run check:otp -- your.school@gmail.com`.

Free Gmail allows about 100 recipients a day through `MailApp`, which is plenty for a school's
sign-ups. The script checks the shared token on every call and keeps an hourly cap, so the URL
cannot be abused as an open relay by anyone who finds it.

### Email: Gmail App Password, step by step

Skip this section if you are on the Apps Script path above — on Render's free plan SMTP is blocked
no matter how correct these credentials are.

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

Three providers are supported; pick one and set `SMS_PROVIDER` to match. They differ in what number
format they want, so do not copy a 10-digit number into a provider expecting country code — the server
handles each one, but it helps to know.

**2Factor** (easiest, free trial credits)

1. Sign up at <https://2factor.in> with your mobile number.
2. Copy the API key from the dashboard (the **API Key** box).
3. `SMS_PROVIDER=2factor` and `SMS_API_KEY=<key>`.

The server calls `GET https://2factor.in/API/V1/<key>/SMS/919876543210/AUTOTP/123456`. The `AUTOTP`
route sends *our* code rather than generating its own, which is why verification stays in our store and
never depends on the provider's session API.

**Fast2SMS** (free signup credits, Indian numbers)

1. Sign up at <https://www.fast2sms.com/dev-api> with a mobile number.
2. Copy the **API Authorization Key** from the Dev API dashboard.
3. `SMS_PROVIDER=fast2sms` and `SMS_API_KEY=<token>`. Keep the default `SMS_F2S_ROUTE=q`.

`q` is **Quick SMS**: no DLT registration, free text, works on a free account. The server posts to
`/dev/bulkV2` with the key in the `Authorization` header and the number in plain 10-digit form
(`9876543210`) — Fast2SMS rejects country-coded numbers on this route.

Only move to `SMS_F2S_ROUTE=dlt` when you have a registered DLT header and template. That route sends
`SMS_F2S_TEMPLATE` as the template ID and the OTP as `variables_values`; without an approved template
the message is rejected. Leave it at `q` unless the office actually holds DLT registration.

**Webhook** (any gateway you already have)

1. Set `SMS_PROVIDER=webhook` and `SMS_WEBHOOK_URL=https://...`.
2. The server POSTs `{ to, message, code }` and treats HTTP 200 with a truthy `error` field as a
   failure. `to` is in country-code form (`919876543210`).

Numbers are entered as 10 digits (`9876543210`); the server strips a leading `0` or `91` if present and
converts per provider. Free tiers are limited to a few hundred messages per account, which is enough
for a school signup day — top up or swap providers when needed.

### SMS not arriving? Read this first

If the phone gets nothing but the app reports success, it is almost always one of these:

- **Wrong number format reaching the provider.** Already handled per provider above; if you swapped
  providers, the code handles it too.
- **Fast2SMS `route=d` without a registered template.** Quick SMS (`q`) is the free path. Put `q` back.
- **Free credits khatam.** Both providers stop sending silently once the trial is over. Check the
  provider dashboard balance.
- **2Factor free tier per-number limit.** A number can only receive a limited number of OTPs per day on
  the trial. Test with a different number before assuming the key is wrong.
- **The code was rate limited.** The OTP request endpoint allows 6 requests per 15 minutes per IP. The
  app says "Please wait N seconds" — wait it out rather than retrying.

### Checking the setup

```bash
cd server
npm run check:otp                                 # config only, nothing is sent
npm run check:otp -- your.school@gmail.com        # + sends a real email code
npm run check:otp -- your.school@gmail.com 9876543210   # + a real SMS

# live deployment par kya set hai (bahut zaroori — local .env ≠ deployed env)
npm run check:otp -- --url https://your-app.onrender.com
```

The first form uses the same mailer and SMS code the app uses, prints `OK`/`FAIL` per step, never prints
a key or password, and exits with the provider's own error message when a send fails.

The `--url` form asks the deployed server itself, which is the one that matters when codes are not
arriving for real users. It reads `/api/status` (operator view, so the `reason` is included) and prints
which channel is missing what. Local `.env` being filled in does **not** configure the deployment —
on Render/Railway the environment variables are set separately in the dashboard and need a redeploy.

**"Abhi email par code nahi bhej pa rahe" / "Abhi mobile par code nahi bhej pa rahe"**
That message means the server has no working provider for that channel. Run the `--url` check above
against the live site to see exactly which setting is missing.

### Testing without any provider

Codes are only returned in the API response when `ALLOW_DEV_EMAIL_CODE=true` **and**
`NODE_ENV=production`. That is a deliberate choice: a real deployment without SMTP/SMS keys otherwise
cannot verify anybody, so with the flag off the server says so plainly instead of pretending.

For local work, keep `ALLOW_DEV_EMAIL_CODE=true` in `server/.env` — the register screen then shows a
"tap to fill" button with the code and the whole flow works with no provider at all. Turn it off (or
`NODE_ENV=development`) once you are testing real delivery.

Never set `ALLOW_DEV_EMAIL_CODE=true` on a public school server: anyone could register with any email
or mobile number and bypass verification.

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

## Deploy on Render

Render par poori app ek hi service hai: Node server, jo `client/dist` bhi khud serve karta hai.
Sirf environment variables set karne padte hain — koi alag frontend host nahi.

`render.yaml` is repository me hai, so the deploy is one click. Secrets usme khud se bhare jaate hain,
kabhi git me nahi jaate.

### Step 1 — Email OTP ka free raasta bana lo

Render **free** plan par SMTP ports blocked hain, isliye mail ke liye ek chhota
mail-only Apps Script banana padta hai (5 minute, ek hi baar):

1. <https://script.google.com> kholo → **New project**.
2. [`server/scripts/appsScriptMail.gs`](server/scripts/appsScriptMail.gs) ka poora content paste
   karo.
3. Usi file me `MAIL_TOKEN` ki value apni koi bhi lambi random string (40+ char) se badal do.
4. **Deploy → New deployment**; Type = **Web app**, *Execute as* = **Me**, *Who has access* =
   **Anyone** → **Deploy**.
5. Jo `/exec` URL mile aur wahi `MAIL_TOKEN` — agle step me chahiye.

> Gmail App Password banane ka purana tareeka (2-Step Verification → App passwords) tab hi chahiye
> jab tum **paid** Render plan ya koi doosra host use karo. Uska section neeche hai.

### Step 2 — Render me service banao

1. <https://render.com> kholo aur login (GitHub se best hai).
2. Left menu → **New** → **Blueprint**.
3. **Connect repository** se `dilshanking6/dj-school` chuno aur **Apply**.
4. Render ne Blueprint detect kar liya, ab wo green values dikha raha hai. Ye **4 jagah** khali hain,
   inhe abhi bharenge:

   | Variable | Kahan se laana hai |
   | --- | --- |
   | `APPS_SCRIPT_URL` | Sheet wala Apps Script → Deploy → New deployment → Web app → URL |
   | `APPS_SCRIPT_MAIL_URL` | Step 1 ka mail wala Apps Script URL (alag script hai) |
   | `APPS_SCRIPT_MAIL_TOKEN` | Step 1 me rakha wahi `MAIL_TOKEN` |
   | `SMS_API_KEY` | 2Factor/Fast2SMS ki key (neeche Step 3) — SMS nahi chahiye to chhod do |

   `MAIL_TRANSPORT` (`apps-script`) aur `JWT_SECRET` blueprint khud set kar leta hai.
   **Agar `JWT_SECRET` tumne manually koi chhota/routine string kar diya hai to use abhi badal
   do** — usse session token forge ho jaate hain.
5. **Apply** dabao. Build ~2-3 minute lega.

> `SMTP_USER` / `SMTP_PASS` free plan par bharna **kaam nahi karta** — Render un port ko hi block
> kar deta hai. Wo sirf paid plan (`MAIL_TRANSPORT=smtp`) ke liye hain.

### Step 3 — Mobile OTP (optional; email se kaam chal jaata hai)

Mobile number se OTP bhi chahiye ho to ye karo. Setup 2Factor me:

1. <https://2factor.in> par apne mobile number se signup karo.
2. Login karke dashboard me **API Key** wala box dhundho aur wo key copy karo.
3. Render dashboard me apni service kholo → **Environment** → teen rows:

   | Key | Value |
   | --- | --- |
   | `SMS_PROVIDER` | `2factor` |
   | `SMS_API_KEY` | jo abhi copy ki |
   | `SMS_WEBHOOK_URL` | khaali chhod do |

4. **Save Changes** → phir **Manual Deploy → Deploy latest commit** (env change se auto deploy nahi
   hota).
5. <https://2factor.in> ka free plan shuru me kuch sau free OTP deta hai — pehli baar me 10-digit
   Indian number (`9876543210`) daal kar test karo, country code nahi.

Fast2SMS chahiye to wahi tarika: <https://www.fast2sms.com/dev-api> par signup, **API Authorization
Key** copy karo, aur `SMS_PROVIDER=fast2sms`. `SMS_F2S_ROUTE` ko `q` hi chhod do — ye Quick SMS hai,
DLT registration nahi maangta.

### Step 4 — Verify karo ki sach me chal raha hai

Ye sabse zaroori step hai. Local `.env` bharne se Render par kuch nahi hota — variables wahan
alag se set karne padte hain.

Apne computer par (repo clone hai to):

```bash
cd server
npm run check:otp -- --url https://smart-janta.onrender.com
```

Output me dono channels `available` dikhne chahiye, aur Email wali line me `transport = apps-script`
ya `transport = smtp`. `NOT configured` aaye to usi channel ki wajah wahi line me likhi hogi.

Ya seedha browser me kholo:

```
https://smart-janta.onrender.com/api/status
```

`verification.email.available: true` aur `verification.sms.available: true` hona chahiye.

### Step 5 — Badlav ke baad

Har git push par Render apne aap redeploy karta hai (`autoDeploy: true`). Sirf environment variable
badla ho to **deploy nahi hota** — manually **Manual Deploy → Deploy latest commit** dabao.

### Render par galtiyan jo log karte hain

**App khulta hi "Something went wrong" / blank page**
Build me `client` install ya build nahi hua. `render.yaml` ka `buildCommand` teenon install karta hai
(`npm install` → `server` → `client` + build). Ye theek hai; apne existing service me command
manually set karna ho to wahi copy kar lo.

**Cold start me 30-50 second lagte hain**
Free plan me service idle ho to sleep ho jaati hai. Pehla request slow hoga, uske baad theek chalega.

**`SHEET_READ_TIMEOUT` errors**
Google Apps Script free quota khatam ho sakta hai. Apps Script → Executions page dekho. Timeout
`SHEET_READ_TIMEOUT=90000` tak barha sakte ho.

**Email nahi ja rahi — abhi `available: false` dikha raha hai (ya 503 aa raha hai)**

Pehle ye dekho ki Render **free** plan par to nahi ho. Render free outbound SMTP ports `25`, `465`
aur `587` **block** karta hai (official docs, Sep 2025 se). Us case me `SMTP login verified` wali
galti kabhi nahi aati — connection banti hi nahi, aur na koi `535` error milta hai.

Server boot par khud ye check kar leta hai. Render ke **Logs** tab me dekho:

```
[config] SMTP port UNREACHABLE: smtp.gmail.com:587 blocked (timeout) — email will not work over SMTP on this host.
[config] Email OTP NOT configured (...)
```

Ye matlab SMTP raasta dead hai. Fix: ek mail-only Apps Script banao aur
`APPS_SCRIPT_MAIL_URL` / `APPS_SCRIPT_MAIL_TOKEN` bharo (Step 1 dekho). Probe ki
wajah se status `available: true` bol kar dhoka nahi karta — email option tab tak
UI me dikhta hi nahi.

```bash
npm run check:otp -- --url <tera-render-url>     # transport + available dikhega
npm run check:otp -- aapka@gmail.com             # ek asli test mail bhejta hai
```

Agar **paid** plan (ya koi doosra host) par ho to boot log me `SMTP port reachable`
aana chahiye. Uske baad bhi `SMTP login verified` fail ho raha hai to App Password
galat hai ya 2-Step Verification off hai — asli error Render ke **Logs** tab me
(`[email-otp] send failed ...`) likha hua milega.

**SMS nahi ja rahi**
Do alag alag cheezein alag se check karni hain — config set hai ya nahi, aur phir delivery.

1. Live server par kya set hai:

```bash
npm run check:otp -- --url https://aapki-site.onrender.com
```

`Mobile: available | provider: 2factor` aana chahiye. (`--url` sirf config dikhata hai — usse SMS
kahin nahi jata. Asli test agle step me hai.)

2. Real delivery test: website kholo, apna 10-digit number daal kar **Send code** dabao, aur phone
   par SMS ka intezaar karo.

Agar yahan tak SMS nahi aayi:

- `SMS_PROVIDER` aur `SMS_API_KEY` dono Render me set hain ye check karo, aur env change ke baad
  **Manual Deploy** zaroor kiya hai (auto deploy env change par nahi chalta).
- Provider ka free credits khatam to nahi hua — provider dashboard ka balance dekho.
- 2Factor ke trial me ek number par din me limited OTP hoti hai; dusra number se test karo.
- Fast2SMS use kar rahe ho to `SMS_F2S_ROUTE` `q` hona chahiye, `dlt` nahi (bina DLT template ke
  message reject hota hai).
- Number 10 digit Indian format me daalo, `+91` ya `91` ke saath nahi.
- Render ke **Logs** tab me asli provider error likha milega — wahan `SMS_ERROR` dekho.

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
# verification delivery: local config, then the real deployment
cd server
npm run check:otp
npm run check:otp -- you@gmail.com 9876543210
npm run check:otp -- --url https://your-app.onrender.com

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

**Every sign-in fails with 502 / 503 and the log says `Unauthorized`**
`APPS_SCRIPT_URL` is pointing at the wrong Apps Script — most often the mail or the Drive helper instead of
the sheet one. Both live on `script.google.com`, so the mistake is easy to make and the whole portal goes
down with it (every read fails, so even `/api/auth/login` cannot look the user up).

Open the URL by hand to see which script answers:

```
curl "https://script.google.com/macros/s/<id>/exec"
```

The mail helper answers `{"ok":true,"service":"Digital Janta mail"}`. The sheet script answers with the
school data. The server names the wrong script in its error message, so the login screen itself tells you
what is wired up. Put the sheet script's `/exec` URL in `APPS_SCRIPT_URL` and redeploy.

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

