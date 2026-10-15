# Community Rise — Website

React + Vite site for Community Rise, styled with react-bootstrap. It includes the public pages, the contact form and user accounts (register, log in, email verification, password reset, dashboard and account settings).

The API is the separate `community-rise-backend` project. See its README for database setup and the API reference.

---

## Running frontend and backend together (development)

You need Node.js 20+ and PostgreSQL. Set up the backend first, as described in `community-rise-backend/README.md`: its `.env` file, `npm run db:create` and `npm run db:migrate`.

Use two terminals:

```bash
# Terminal 1 — API on http://localhost:5001
cd community-rise-backend
npm run dev

# Terminal 2 — website on http://localhost:5173
cd CR-Fresh-v2
npm install
npm run dev
```

Open http://localhost:5173.

In development the Vite dev server **proxies `/api` to `http://localhost:5001`**. The browser only ever talks to `localhost:5173`, so the httpOnly login cookies work without any CORS setup. The backend's `CLIENT_URL` should be `http://localhost:5173`; email links are built from it.

The Contact page and "Request a free place" post to `/api/contact`, which in development goes through the same proxy. See `src/emailConfig.js`.

---

## Environment variables

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | browser bundle | `/api/v1` | Base URL for auth API requests. Set in `.env.production` to `/communityrise-api/v1` for the EC2 deployment, where Nginx maps `/communityrise-api/` to the backend. Prefer a same-origin path: the session cookies are `SameSite=Lax`, so an API on a different site won't receive them. |
| `API_PROXY_TARGET` | Vite dev server | `http://localhost:5001` | Where the dev server proxies `/api`. |
| `VITE_CONTACT_API_URL` | browser bundle | derived from `VITE_API_URL` (`…/api/v1` → `…/api/contact`) | Address of the contact form endpoint, used by the Contact page and "Request a free place". Only set it to override. |

Vite loads `.env`, `.env.local` and `.env.[mode]`. `npm run dev` uses development mode; `npm run build` uses production mode and so reads `.env.production`. See `.env.example`.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with the API proxy |
| `npm run build` | Production build into `dist/` (uses `.env.production`) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest + React Testing Library tests once |
| `npm run test:watch` | Run the tests in watch mode |

---

## Get Involved menu, teaching resources and events

The **Get Involved** menu is a dropdown:

| Item | Destination |
| --- | --- |
| Ways to get involved | `/get-involved` |
| Donate | Opens the donation modal |
| Volunteer | `/get-involved#volunteer` |
| Teaching Resources | `/get-involved/teaching-resources` |
| Fundraising | `/get-involved#fundraise` |
| Events | `/get-involved/events` |

- **Teaching resources** content (topics, resources, workshops, FAQs) lives in `src/data/teachingResources.js`.
  - Cards offer "Request this resource", which opens a pre-filled email to help@communityrise.org.uk.
  - To make a resource downloadable instead, put the file in `public/files/` and add `href: '/files/name.pdf'` to that resource.
- **Events** are listed from `src/data/events.js`, which explains the format. Past events are hidden automatically, and the page shows an empty state when there are none.
- **Sign-up and log-in are not in the top menu.** People sign up from the "Sign-up to hear about the newest teaching resources" section of the teaching resources page, and return there afterwards.
  - The opt-in to teaching-resource emails is a separate checkbox that is never pre-ticked, as UK marketing-consent rules (PECR) require.
  - Logged-in users can opt in with one click on that page, or switch it on or off under **Account → Email preferences**.
  - Logged-in users still get an account menu (Dashboard, Account, Logout) in the navbar.

## Volunteer tutor pathway

- **The page:** `/get-involved/volunteer-tutor`. It's in the Get Involved menu as **Volunteer as a Tutor**, and linked from the Volunteer card and the Teaching Resources page. It explains:
  - what tutors can teach
  - what they get
  - the five steps to joining
  - the safeguarding commitments
- **Content** (subjects, benefits, steps, safeguarding, FAQs) is in `src/data/tutoring.js`.
- **The application form** needs no account. On submit:
  - the applicant gets a confirmation email
  - the team inbox gets the full application, with a link to review it
- **Admins** see a **Tutor applications** item in their account menu. It opens `/admin/tutor-applications`, where they can filter by status, call or email applicants, add team notes, and mark each application contacted, approved or declined.

## Accounts — how it works

| Route | Access | Purpose |
| --- | --- | --- |
| `/register` | logged-out only | Create an account (then returns to the page that linked here, or `/dashboard`). `?interest=teaching-resources` shows teaching-resources wording |
| `/login` | logged-out only | Log in (then returns to the page you were trying to reach, or `/dashboard`) |
| `/verify-email?token=…` | anyone | Opened from the verification email |
| `/forgot-password` | anyone | Request a reset link (always shows the same confirmation) |
| `/reset-password?token=…` | anyone | Opened from the reset email; then goes to `/login` |
| `/dashboard` | logged-in only | Welcome page and "verify your email" banner |
| `/account` | logged-in only | Change password, log out of all devices |

Code layout:

```
src/api/client.js        axios instance (withCredentials). A 401 triggers one shared
                         POST /auth/refresh, then the request is retried; if the refresh
                         fails the user is cleared and sent to /login
src/api/auth.js          One function per backend auth endpoint
src/api/errors.js        Friendly messages for 401/409/422/423/429/network errors and
                         mapping of backend 422 field errors onto form fields
src/context/AuthContext  user, loading, register, login, logout, logoutAll, refreshUser;
                         restores the session with GET /auth/me on load
src/components/auth/     ProtectedRoute, GuestRoute, form fields, password checklist
src/validation/          zod schemas mirroring the backend validators
src/pages/auth/          Register, Login, VerifyEmail, ForgotPassword, ResetPassword (+ tests)
src/pages/account/       Dashboard, Account
```

Validation rules match the backend exactly:

- **Full name:** 2–100 letters, spaces, hyphens and apostrophes.
- **Password:** 10–128 characters, with an uppercase letter, a lowercase letter and a number, and must not contain your email.

If you change a rule in `community-rise-backend/src/validators/auth.validators.js`, update `src/validation/authSchemas.js` to match. The backend is still the final check, and its field errors appear inline on the form.

---

## Deployment

```bash
npm run build          # reads .env.production → VITE_API_URL=/communityrise-api/v1
```

Upload `dist/` as before. Two requirements:

- **HTTPS.** In production the backend sets `Secure` cookies, so login only works when the site is served over HTTPS.
- **Single-page app fallback.** The web server must serve `index.html` for unknown paths, so that links like `/verify-email?token=…` and `/reset-password?token=…` from emails load the app. In Nginx: `try_files $uri /index.html;`.

The backend must also be set up for this path: `REFRESH_COOKIE_PATH=/communityrise-api/v1/auth`, and `CLIENT_URL` set to the live site URL.

### Render

The website is a Render **Static Site**:

| Setting | Value |
| --- | --- |
| Root Directory | `CR-Fresh-v2` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

- **Environment variable:** `VITE_API_URL=https://api.communityrise.org.uk/api/v1`.
- **Rewrite rule:** add `/*` → `/index.html` (action **Rewrite**) under Redirects/Rewrites, so deep links such as `/reset-password?token=…` work.
- **`.env.production` is not committed** (the repo's `.gitignore` excludes `.env.*`), so set `VITE_API_URL` in Render instead.
