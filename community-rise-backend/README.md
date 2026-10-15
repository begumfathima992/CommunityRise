# Community Rise — Backend

Node/Express API for Community Rise:

- **Contact form** — `POST /api/contact` sends messages to help@communityrise.org.uk via Gmail SMTP (unchanged for the existing frontend).
- **Authentication** — registration, login, email verification, password reset and session management under `/api/v1/auth`, backed by PostgreSQL.

Stack: Node.js ≥ 20, Express 4, PostgreSQL 17, Sequelize + sequelize-cli (migrations only, never `sync()`), bcrypt, JWT, zod, helmet, pino, Jest + supertest.

---

## Project structure

```
server.js                  Root entry kept for `pm2 start server.js` (imports src/server.js)
.sequelizerc               Points sequelize-cli at src/
src/
  app.js                   Express app (no listen) — middleware, routes, error handling
  server.js                Connects to the DB, starts HTTP server, graceful shutdown
  config/                  env.js (zod-validated env), database.cjs (per-environment DB), logger.js, auth.js (constants)
  db/migrations/           Schema migrations (.cjs)
  db/seeders/              Admin user seeder (.cjs)
  models/                  User, RefreshToken, AuthToken + Sequelize instance
  controllers/             HTTP only — read request, call service, shape response
  services/                Business logic (auth, sessions, tokens, email)
  routes/                  /api/contact and /api/v1/*
  middlewares/             requireAuth, requireRole, validate, rate limiters, error/404 handlers
  validators/              zod schemas (auth) and contact form checks
  templates/               HTML/text email templates
  utils/                   AppError, cookies, crypto, password helpers, serializers
tests/                     Jest + supertest integration tests (run against communityrise_test)
```

---

## Local setup

**Prerequisites:** Node.js 20+ and PostgreSQL running on `localhost:5432` (user `ziggy`, no password).

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill it in (see "Environment variables")
cp .env.example .env

# 3. Create and migrate the development database
npm run db:create
npm run db:migrate

# 4. (Optional) create an admin user — set ADMIN_EMAIL / ADMIN_PASSWORD in .env first
npm run db:seed

# 5. Create and migrate the test database
npm run db:test:create
npm run db:test:migrate

# 6. Run the tests, then start the server
npm test
npm run dev
```

You should see `Community Rise backend listening on port 5001 (development)`.

---

## npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the server (`node src/server.js`) |
| `npm run dev` | Start with automatic restart on file changes (`node --watch`) |
| `npm test` | Migrate the test DB, then run Jest against `communityrise_test` |
| `npm run db:create` | Create the database for the current `NODE_ENV` |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:undo` | Undo the most recent migration |
| `npm run db:migrate:status` | Show which migrations have run |
| `npm run db:seed` | Run all seeders (creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |
| `npm run db:seed:undo` | Undo all seeders (removes that admin user) |
| `npm run db:test:create` | Create `communityrise_test` |
| `npm run db:test:migrate` | Migrate `communityrise_test` |

The database scripts use `NODE_ENV` to pick the configuration in `src/config/database.cjs`. In production run them as e.g. `NODE_ENV=production npm run db:migrate`.

---

## Environment variables

All variables are validated with zod at startup. If any are missing or invalid, the process prints which ones and exits.

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no (default `development`) | `development`, `test` or `production` |
| `PORT` | no (default `5001`) | HTTP port |
| `DATABASE_URL` | **yes** | `postgres://user:password@host:5432/dbname`. In production it connects with SSL. |
| `TEST_DATABASE_URL` | no | Test DB (default `postgres://ziggy@localhost:5432/communityrise_test`). Tests refuse to run against a DB whose name doesn't end in `_test`. |
| `JWT_ACCESS_SECRET` | **yes** | ≥ 32 chars. Signs access-token JWTs. |
| `JWT_REFRESH_SECRET` | **yes** | ≥ 32 chars, different from the access secret. Keys the HMAC-SHA-256 hash of stored refresh tokens. Changing it signs everyone out. |
| `CLIENT_URL` | **yes** | Frontend origin(s), comma-separated. Used for CORS. The first one is used to build email links (`/verify-email?token=…`, `/reset-password?token=…`). |
| `REFRESH_COOKIE_PATH` | no (default `/api/v1/auth`) | Path of the `refresh_token` cookie. It must match the path the **browser** uses (see Nginx below). |
| `GMAIL_USER` | **yes** | Gmail / Workspace account that sends email |
| `GMAIL_APP_PASSWORD` | **yes** | Google App Password for that account |
| `CONTACT_RECIPIENT` | no | Where contact-form messages go (default `GMAIL_USER`) |
| `LOG_LEVEL` | no | pino level (default `debug` in dev, `info` in production, `silent` in tests) |
| `DB_SSL_CA_PATH` | no | Production only: path to a CA bundle for the database's SSL certificate (e.g. the AWS RDS bundle) |
| `DB_SSL_REJECT_UNAUTHORIZED` | no | Production only: set to `false` to skip certificate verification (not recommended) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` | seeder only | Used by `npm run db:seed`. The password must meet the normal password policy. |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## API reference

Every response is JSON in this shape:

```jsonc
// success
{ "success": true, "message": "…", "data": { … } | null }
// error
{ "success": false, "message": "…", "errors": { "field": ["message", …] } }  // errors only on 409/422
```

Authentication uses **httpOnly cookies**, so the frontend must send requests with `credentials: 'include'`:

- `access_token` — JWT, 15 minutes, path `/`
- `refresh_token` — opaque random token, 7 days, path `REFRESH_COOKIE_PATH`

Both cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. When any request returns `401`, call `POST /refresh` once and retry. If the refresh also returns `401`, send the user to the login page.

### Auth — `/api/v1/auth`

| Method | Path | Auth | Body / query | Success | Notable errors |
| --- | --- | --- | --- | --- | --- |
| POST | `/register` | — | `full_name`, `email`, `signup_reason`, `password`, `confirm_password`, `consent`, optional `teaching_updates` (boolean, default `false`) | `201` `{ user }` + cookies; sends a verification email | `409` email exists, `422`, `429` |
| POST | `/login` | — | `email`, `password` | `200` `{ user }` + cookies | `401` invalid email or password, `403` deactivated, `422`, `423` locked, `429` |
| POST | `/refresh` | refresh cookie | — | `200` `{ user }` + new cookies (rotated) | `401` |
| POST | `/logout` | refresh cookie (optional) | — | `200`, cookies cleared | — |
| POST | `/logout-all` | access cookie | — | `200`, all sessions revoked | `401` |
| GET | `/me` | access cookie | — | `200` `{ user }` | `401` |
| GET | `/verify-email` | — | `?token=` | `200` `{ user }` | `400` invalid/expired, `422` |
| POST | `/resend-verification` | — | `email` | `200` (always the same message) | `422`, `429` |
| POST | `/forgot-password` | — | `email` | `200` (always the same message) | `422`, `429` |
| POST | `/reset-password` | — | `token`, `password`, `confirm_password` | `200`; all sessions revoked | `400` invalid/expired, `422` |
| PATCH | `/change-password` | access cookie | `current_password`, `new_password`, `confirm_password` | `200` + new cookies; other sessions revoked | `401`, `422` |

### Users — `/api/v1/users`

| Method | Path | Auth | Body | Success | Notable errors |
| --- | --- | --- | --- | --- | --- |
| PATCH | `/me/preferences` | access cookie | `teaching_updates` (boolean) | `200` `{ user }` | `401`, `422` |

`teaching_updates` records an explicit opt-in to emails about new teaching resources. It is stored with a timestamp (`teaching_updates_opt_in_at`) as evidence of consent. To get the mailing list:

```sql
SELECT full_name, email FROM users
WHERE teaching_updates_opt_in AND is_active AND deleted_at IS NULL;
```

The `user` object is `{ id, full_name, email, signup_reason, role, is_email_verified, email_verified_at, teaching_updates_opt_in, last_login_at, created_at }`. Password and token hashes are never returned.

### Volunteer tutor applications — `/api/v1/tutor-applications`

| Method | Path | Auth | Body / query | Success | Notable errors |
| --- | --- | --- | --- | --- | --- |
| POST | `/` | — (linked to the account if logged in) | `full_name`, `email`, `phone`, `subjects[]`, `learner_groups[]`, `availability[]`, `delivery`, `experience`, `dbs_status`, `agree_to_checks: true`, `consent: true` | `201`; emails the applicant and the team inbox (`CONTACT_RECIPIENT`) | `409` open application already exists for this email, `422`, `429` (5 per hour) |
| GET | `/` | admin | `?status=new\|contacted\|approved\|declined` | `200` `{ applications }` (newest first) | `401`, `403` |
| PATCH | `/:id` | admin | `status` and/or `admin_notes` | `200` `{ application }` | `401`, `403`, `404`, `422` |

- **Option keys** (subjects, learner groups and so on) live in `src/config/tutoring.js`, mirrored in the frontend's `src/data/tutoring.js`.
- **Spam trap:** a hidden `website` field. Bots that fill it in get a normal `201`, but nothing is stored or emailed.
- **Admins** review applications at `/admin/tutor-applications` on the website. Create the first admin with `npm run db:seed`.

### Other endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/health` | `200` `{ status: "ok", database: "connected" }`, or `503` if the DB is unreachable |
| GET | `/api/health` | Legacy health check `{ status: "ok" }` |
| POST | `/api/contact` | Contact form: `name`, `email`, `reason`, `message`. Returns `{ success, message }`; on failure returns `{ error }` (400/429/500). |

### Validation rules

- `full_name`: 2–100 characters; letters, spaces, hyphens and apostrophes; trimmed
- `email`: valid format, trimmed and lowercased, max 255 characters
- `signup_reason`: `learner` | `volunteer` | `funder` | `partner` | `other`
- `password`: 10–128 characters, with at least one uppercase letter, one lowercase letter and one number; must not contain the user's email
- `confirm_password` must match; `consent` must be `true`
- Unknown fields are rejected. Failures return `422` with errors for each field.

### Security behaviour

- Passwords are hashed with bcrypt (cost 12).
- Login lockout: after 5 failed attempts the account is locked for 15 minutes (`423`). A successful login resets the counter.
- Refresh tokens are rotated on every `/refresh`. If an already-rotated token is presented again (theft), **all** of that user's sessions are revoked. A token revoked by logout or a password change is simply rejected.
- Verification links expire in 24 hours, reset links in 1 hour. Both are single use and stored only as SHA-256 hashes. Requesting a new link invalidates the previous one.
- Rate limits per IP:

  | Endpoint | Limit |
  | --- | --- |
  | `/register`, `/login` | 10 per 15 min each |
  | `/forgot-password`, `/resend-verification` | 5 per hour each |
  | All `/api/v1` routes | 100 per 15 min |
  | `/api/contact` | 5 per 15 min |

  Limits are kept in memory per process, so with several PM2 instances each instance counts separately.

---

## Testing

```bash
npm test
```

This migrates `communityrise_test` and then runs the suites in `tests/` serially. Email sending is mocked, and the tests overwrite secrets and Gmail settings with dummy values, so they never send real email. Tables are truncated between tests.

---

## Gmail App Password

Gmail and Google Workspace require an App Password for SMTP:

1. Turn on **2-Step Verification** for help@communityrise.org.uk (Google Account → Security).
2. Go to **https://myaccount.google.com/apppasswords** while signed in as that account.
3. Create an App Password (e.g. "Community Rise Website") and copy the 16-character value into `GMAIL_APP_PASSWORD`.

---

## Deployment (AWS EC2 + PM2 + Nginx)

**1. Upload and install**

```bash
scp -i ~/Desktop/AZIZpem/aks-key.pem -r community-rise-backend ec2-user@18.130.42.159:/tmp/
ssh -i ~/Desktop/AZIZpem/aks-key.pem ec2-user@18.130.42.159
sudo mv /tmp/community-rise-backend /var/www/community-rise-backend
cd /var/www/community-rise-backend
npm ci --omit=dev
```

Leave out `node_modules` and your local `.env` when uploading.

**2. Create the production `.env` on the server**

```bash
cp .env.example .env
nano .env
```

Set `NODE_ENV=production`, the production `DATABASE_URL`, two new JWT secrets (do not reuse the development ones), `CLIENT_URL` set to the live site origin, the Gmail values, and `REFRESH_COOKIE_PATH` (see step 4).

**3. Create the database and run migrations**

sequelize-cli is a dev dependency, so run it with `npx`:

```bash
NODE_ENV=production npx sequelize-cli db:migrate
NODE_ENV=production ADMIN_EMAIL=… ADMIN_PASSWORD=… npx sequelize-cli db:seed:all   # optional
```

Production connects with SSL. If your database doesn't support SSL (for example a local Postgres on the same server), you need to enable SSL on it or adjust `src/config/database.cjs`.

**4. Nginx**

The existing location block maps `/communityrise-api/` to `/api/`, and it needs to forward client details:

```nginx
location /communityrise-api/ {
    proxy_pass http://localhost:5001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The browser sees the auth routes at `/communityrise-api/v1/auth/...`, so set:

```
REFRESH_COOKIE_PATH=/communityrise-api/v1/auth
```

Otherwise the browser will never send the refresh cookie.

**HTTPS is required in production:** cookies are marked `Secure`, so browsers won't store them over plain `http://`.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**5. Run with PM2**

```bash
NODE_ENV=production pm2 start server.js --name community-rise-backend
pm2 save
```

For later deployments run `npm ci --omit=dev`, then `NODE_ENV=production npx sequelize-cli db:migrate`, then `pm2 restart community-rise-backend`. The server finishes in-flight requests and closes DB connections on `SIGTERM`/`SIGINT`.

**6. Frontend**

- Contact form: set `CONTACT_API_URL` in `CR-Fresh-v2/src/emailConfig.js` to the deployed `/communityrise-api/contact` URL. The site's origin must be listed in `CLIENT_URL`, because CORS now only allows those origins.
- Auth pages: call `/communityrise-api/v1/auth/*` with `credentials: 'include'`. Email links point to `${CLIENT_URL}/verify-email?token=…` and `${CLIENT_URL}/reset-password?token=…`, so the frontend needs those two routes. They should send the token to `GET /verify-email` and `POST /reset-password`.
