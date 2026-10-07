# HANDOFF — Digital Janta Portal (agla session yahan se shuru karo)

> **Ye file kis liye hai:** agar naya session shuru ho jaye aur tumhe poora
> context dobara samjhana pade, to bas ye file ka content paste kar do.
> Isme secrets NAHI hain — sirf env var ke naam aur unka kaam.
>
> Last updated: 7 Oct 2026

---

## 1. Project kya hai

**Digital Janta Portal** — Janta +2 High School, Khalari ka school management portal.

- **Repo:** `github.com/dilshanking6/dj-school`
- **Live:** `https://smart-janta.onrender.com` (Render free plan, Singapore)
- **Stack:** React 19 + Vite (client/) · Node + Express (server/) · Google Sheets = database
  (Google Apps Script web app ke through) · Socket.IO for chat · JWT auth
- **Roles:** student, teacher, principal, admin
- **Code size:** client ~7000 LOC, server ~5760 LOC
- **Tests:** `cd server && npm test` → 29 tests (node --test)
- **Lint:** `cd client && npm run lint` (0 errors, 10 warnings — sab react-hooks/exhaustive-deps)
- **Build:** `cd client && npm run build`

Data kabhi browser tak nahi jaata — sirf Node server Apps Script ko call karta hai.
`APPS_SCRIPT_URL` browser me kabhi expose nahi hota.

---

## 2. Deploy kaise hota hai

`render.yaml` (Blueprint) repo me hai → Render me **New > Blueprint** se banti hai.

- `autoDeploy: true` → **har git push par apne aap redeploy**
- Env var **badalne par auto deploy NAHI hota** → **Manual Deploy > Deploy latest commit**
- Build: `npm install && server && client && npm run build` (~2-3 min)
- Free plan: cold start 30-60s, 15 min idle par sleep, 750 hrs/mahina

### Render par set env vars (naam — value yahan mat likho)

| Var | Status | Kya hai |
|---|---|---|
| `JWT_SECRET` | ⚠️ **BADALNA HAI** | Session signing key — abhi bahut kamzor hai, neeche dekho |
| `STATUS_TOKEN` | ✅ set | `/api/status` ka operator detail kholta hai |
| `APPS_SCRIPT_URL` | ✅ set | Sheet wala Apps Script (database) |
| `APPS_SCRIPT_MAIL_URL` | ❌ **bharna hai** | Naya mail-only Apps Script (free email ke liye) |
| `APPS_SCRIPT_MAIL_TOKEN` | ❌ **bharna hai** | Us script ka shared secret |
| `MAIL_TRANSPORT` | ✅ `apps-script` | Kaun sa mail raasta use hoga |
| `SMTP_USER` / `SMTP_PASS` | set par **free plan par bekaar** | SMTP ports blocked hain |
| `SMS_PROVIDER=2factor` + `SMS_API_KEY` | ✅ set | Mobile OTP |
| `ALLOW_DEV_EMAIL_CODE` | ❌ (sahi hai) | Prod me KABHI mat lagana |

---

## 3. 🔴 URGENT — jo abhi tak nahi hua

### 3.1 JWT_SECRET rotate karo (CRITICAL)

Ek session me user ne apna `JWT_SECRET` chat me paste kar diya tha — wo ek chhoti
routine string thi (bahut guessable). Usse **admin token forge karke 200 OK
milaya gaya** — yaani koi bhi banda `/api/school/dashboard`, user list, sab khol
sakta tha. Value yahan likhna bhi sahi nahi hai (repo public ho sakta hai).

**Karna:** Render > service > Environment > `JWT_SECRET` > ek naya lamba random
string (40+ char) > Save > **Manual Deploy**.

> Side effect: isse sabhi logged-in users logout ho jayenge — wo normal hai.

Saath me `SMTP_PASS` aur `SMS_API_KEY` bhi chat me gaye the → provider
dashboards se bhi rotate kar lena.

### 3.2 Email OTP — free fix ready hai, deploy baaki

**Problem:** Render ka free plan outbound SMTP ports `25/465/587` block karta hai
(Render docs, Sep 2025). Isliye `POST /api/auth/email-otp/request` → `503` after
~11s (`connectionTimeout: 10000`). Config bilkul theek tha, connection hi nahi
banti thi. SMS isliye chalta hai kyunki 2factor HTTPS (443) use karta hai.

**Fix banaya (code ready, push hone wala hai):**

1. `server/scripts/appsScriptMail.gs` — **standalone** mail-only Apps Script.
   `MailApp.sendEmail` use karta hai (HTTPS, free). Token check + hourly quota hai.
2. `server/utils/mailer.js` — naya `MAIL_TRANSPORT` (`auto` | `apps-script` | `smtp`)
   aur `APPS_SCRIPT_MAIL_URL` / `APPS_SCRIPT_MAIL_TOKEN` support.
3. **Availability ab jhooth nahi bolta:** `mailStatus()` `MAIL_TRANSPORT` dekhta hai,
   sirf "env var bhar gaye" nahi. `otp-channels` se `provider` naam bhi hata diya.

**Abhi user ko karna hai (5 min):**

1. script.google.com → New project → `appsScriptMail.gs` ka poora content paste
2. `MAIL_TOKEN` me apni random string daalo
3. Deploy > New deployment > Web app > Execute as: **Me** > Access: **Anyone**
4. Jo URL mile wo Render me `APPS_SCRIPT_MAIL_URL` me daalo
5. Wahi token Render me `APPS_SCRIPT_MAIL_TOKEN` me daalo
6. **Manual Deploy**
7. Verify: `cd server && npm run check:otp -- koi@gmail.com`

### 3.3 Data hi nahi hai

Sheet me **sirf 1 user (admin)** hai. `students: 0, teachers: 0, events: 0`.
Landing page ka `/api/public/portal-stats` sab 0 dikhata hai → site khali lagti
hai. Teacher ko dikhane se pehle kuch data dalna padega.

---

## 4. Security audit — kya pass hai, kya baaki

### Pass (verify kiya gaya, 7 Oct 2026)

| Check | Result |
|---|---|
| Forged JWT (wrong key) | 401 ✅ |
| `alg:none` attack | 401 ✅ |
| Admin khud ko modify/delete karna | 400 blocked ✅ |
| API se dusra admin banana | 403 blocked ✅ |
| Bina token `/api/school/*` | 401 ✅ |
| Login brute force | 429 after 10 tries ✅ |
| Malformed JSON | 400 ✅ |
| Unknown `/api/*` | JSON 404 (HTML leak nahi) ✅ |
| CORS (prod) | sirf same-origin ✅ |
| Headers | CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy ✅ |
| Sourcemaps / `.env` in git | nahi ✅ |
| bcrypt cost 12, OTP bcrypt-hashed + 5 attempt + 5 min TTL | ✅ |

### Baaki kamzori (priority order)

| # | Issue | Kab |
|---|---|---|
| 1 | JWT_SECRET rotate (3.1) | **abhi** |
| 2 | Email OTP deploy (3.2) | **abhi** |
| 3 | `rateLimit.js:19` — `x-forwarded-for` blindly trust → limit bypass | next |
| 4 | CSP `script-src 'unsafe-inline'` (Vite inline theme boot ki wajah se) | next |
| 5 | Forgot/reset password ka koi flow hi nahi | next |
| 6 | Audit/activity log nahi (admin ne kya kiya, pata nahi) | later |
| 7 | JWT `localStorage` me 7 din, koi revocation/refresh nahi | later |
| 8 | Sheet = database, koi backup/export nahi. Ek galat delete = sab khatam | later |
| 9 | Admin ko 2FA nahi | later |

**Security score (audit waqt): 80/100 · Overall site: 63/100**

---

## 5. Paid plan ka roadmap (jab teachers haan keh dein)

> Abhi sab free hai. Ye sirf tab lagana jab revenue aa jaye.

| Cheez | Kab chahiye | Kharcha (approx) |
|---|---|---|
| **Render paid** (SMTP unlock + no sleep) | SMTP chahiye ho. Abhi free me Apps Script se ho jaata hai, isliye ** zaroorat nahi** | **$7/mahina (~₹580)** — `<1 CPU` compute plan. (Workspace `Pro` $25/mahina alag hai — single service ke liye compute hi kaafi) |
| **Custom domain** | `onrender.com` hataana ho | ₹700–1,200/saal (.in sasta) + ₹0 DNS |
| **Email service** (Resend/Brevo) | Apps Script ka 100 mail/din quota na pade | **Free tier:** Resend 3,000/mahina, Brevo 300/din, SendGrid 100/din. Paid: Resend $20/mahina (50k) |
| **Razorpay/UPI fee payment** | Fees online leni ho | Setup ₹0, ~2% per transaction |
| **Google Workspace** (school@ domain) | Professional email + Drive | ~₹150/user/mahina |
| **Backups** | Sheet ka automatic backup | Free — `server/scripts/` me scripts hain, cron lagana hai |

**Sabse sasta professional setup (abhi, ₹0):** Apps Script mail + onrender.com + data.

**Pehla asli kharcha (jab revenue ho):** ₹700/saal domain + $7/mahina Render = **~₹6,700/saal**.

---

## 6. Professional school website ke liye pending features

**🔴 Blockers (bina ye teacher convince nahi karenge)**
1. Email OTP working (3.2)
2. Data — students/teachers bhare ho
3. `robots.txt` + `sitemap.xml` + OG/Twitter tags (WhatsApp share par preview aaye)
4. Forgot password

**🟡 Credibility**
5. About School — history, Principal ka message, management committee
6. **Public Notice Board** — bina login ke notices/circulars (abhi sab login ke peeche hai)
7. Admission enquiry form + Fee structure page
8. Contact page — phone, email, Google Map, timing
9. Photo/event gallery
10. Custom domain

**🟢 Advanced**
11. Time table / exam routine / syllabus download
12. Printable marksheet + report card (PDF)
13. Fee payment (Razorpay/UPI)
14. Parent portal + SMS alerts
15. Admin activity log + data backup/export
16. School calendar/holidays
17. Hindi + English language toggle (abhi Hinglish mix hai)

**Performance:** main bundle 474 kB (gzip 154 kB), cold start 30-60s,
sheet read 15-30s (SHEET_CACHE se kam hua hai). Landing page 128 kB chunk.

---

## 7. Khaas URLs aur commands

```bash
# tests + lint + build
cd server && npm test
cd client && npm run lint && npm run build

# OTP config check (local .env se)
cd server && npm run check:otp
cd server && npm run check:otp -- someone@gmail.com          # real mail bhejta hai
cd server && npm run check:otp -- --url https://smart-janta.onrender.com

# admin account banana (sirf ek baar)
cd server && ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/createAdmin.js
```

| URL | Kya hai |
|---|---|
| `/` | Landing page |
| `/login` `/register` | Student |
| `/teacher-login` `/teacher-register` | Teacher (register = pending, admin approve karta hai) |
| `/principal-login` `/admin-login` | Staff (account office banata hai) |
| `/admin` | Admin panel (Users, Study, Messages, Events, Settings) |
| `/api/status` | Health (detail ke liye `x-status-token` header) |
| `/api/auth/otp-channels` | Kaunsa verification channel chalu hai |
| `/study/` | Offline Study Hub (alag service worker) |

**Admin login:** `dilshan@gmail.com` (password owner ke paas — repo me mat likho).

**Google Sheet tabs:** `Users, Attendance, Results, Notes, Events, Announcements,
Complaints, Ratings, ChatRooms, RoomMembers, Messages, StudyContent`
(schema README me hai).

---

## 8. Code conventions jo follow kiye gaye hain

- Comments **Hinglish** me, "kyun" batate hain — "kya" code khud batata hai
- Koi linter nahi (server side), ESLint sirf client me
- Errors: `HttpError` + `expose: true` sirf tab jab user ko dikhana ho;
  technical wajah hamesha `console.error` me
- Routes me `asyncRoute()` wrapper, controllers me `asyncRoute` bhi
- Rate limiters route definition ke saath, middleware me nahi
- Secrets kabhi message/error me nahi jaate
