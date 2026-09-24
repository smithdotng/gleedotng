# glee.ng — premium beauty booking marketplace

![glee.ng](public/brand/glee-logo-original.png)

A Next.js 15 (App Router, TypeScript, Tailwind v4) app where clients discover and book hair stylists, makeup artists, nail studios, barbers, spas and lash/brow specialists — and where beauty operators list their businesses and manage appointments. Styling takes cues from diner.ng (deep espresso brown, warm gold, card-led discovery, two-tier operator pricing).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

### Database — MongoDB

1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com) (or use any MongoDB 6+ server).
2. In Atlas → **Network Access**, allow your IP (or `0.0.0.0/0` for Vercel).
3. Copy `.env.example` to `.env.local` and paste your connection string into `MONGODB_URI`.
4. `npm run db:check` — confirms the connection and shows collection counts.
5. `npm run dev` — on first request the app creates indexes and, if the database is empty, loads the 9 demo businesses and sample appointments (`SEED_DEMO_DATA="false"` turns this off).

`npm run db:reset` drops the `operators` and `bookings` collections so the demo data reloads.

Collections: `operators` (unique `slug`) and `bookings` (unique `id`, indexed by `operatorSlug + date + time`). The connection is shared per server process (`src/lib/mongodb.ts`); all queries live in `src/lib/store.ts`.

## What's inside

| Route | Purpose |
|---|---|
| `/` | Hero + search (city / service), categories, featured "Glee edit", cities, how it works, for-business pitch, testimonials, pricing, journal |
| `/explore` | Search & filters: keyword, category, city, price tier, home service, sort |
| `/stylists/[slug]` | Profile: gallery mosaic, about, service menu, portfolio, reviews, hours, map link, **live booking panel** |
| `/bookings/[id]` | Booking confirmation |
| `/for-business` | Operator landing page + pricing (Essential free / Signature ₦15k) |
| `/list-your-business` | 5-step onboarding: business → location → services → hours → photos & plan |
| `/login` | Operator sign in (email + password) |
| `/dashboard`, `/dashboard/[slug]` | Operator dashboard (signed-in owner only): stats, appointments (confirm / decline / mark done), menu, hours, sign out |

API: `GET /api/availability`, `GET|POST /api/bookings`, `PATCH /api/bookings/[id]`, `GET|POST /api/operators`.

Booking logic: 30-min slots inside opening hours, 1-hour lead time for same-day, and overlap-aware capacity (1 chair for independent stylists, 3 for salons/studios/spas) so double-booking is blocked server-side.

## Going to production

- **Photos:** listing uses a curated Unsplash library + pasted image links. Add Cloudinary/S3 uploads for real operator photos.
- **Notifications:** hook `createBooking` / `updateBookingStatus` to email (Nodemailer) and WhatsApp/SMS (Termii, Twilio).
- **Payments/deposits:** Paystack or Flutterwave for Signature plan billing and booking deposits.

Photography: Unsplash (free under the Unsplash License), loaded from `images.unsplash.com`.

Brand: official wordmark in `public/brand/` (`glee-logo-light.png` for dark backgrounds, `glee-logo-dark.png` for light, plus the original). Favicon / app icon use the “g” mark.

## Operator accounts & sign-in

- Businesses that sign up at `/list-your-business` choose a password; an account is created in the `accounts` collection and they're signed in straight away.
- Passwords are stored only as salted **scrypt** hashes. Sessions are signed, http-only cookies (30 days) — set `AUTH_SECRET` in `.env.local` / your host (required in production).
- A dashboard can only be opened by its owner; booking status changes and `GET /api/bookings` check the session.
- Demo businesses have no login.
- Businesses onboarded by the glee.ng team live in `src/lib/listings.ts` (with password hashes only) and are added on startup if missing — never overwritten. **Beautyroom by Jane** (janeinme@yahoo.com) is set up this way.

## Plans

| Plan | Price | Highlights |
|---|---|---|
| Essential | Free | Profile, up to 10 services, bookings, dashboard |
| Signature | ₦15,000/mo | Featured placement, verified badge, unlimited services & gallery |
| **Prestige** | ₦35,000/mo | Everything in Signature **+ glee Store**, top-of-search placement |

Plan details live in `src/lib/plans.ts` (limits, features, `hasStore`).

## glee Store (Prestige)

- **Owner:** `/dashboard/[slug]/store` — add/edit/hide/delete products (price, category, photo, optional stock tracking) and manage orders (confirm → ready → completed, or cancel, which returns stock).
- **Clients:** "The boutique" section on the business profile and a full shop at `/stylists/[slug]/shop` — bag saved in the browser, checkout for pickup or delivery, pay on collection/delivery. Confirmation at `/orders/[id]`.
- **Data:** `products` and `orders` collections. Stock is decremented with a conditional update so it can't go below zero; failed checkouts roll back.
- **APIs:** `GET/POST /api/store/products`, `PATCH/DELETE /api/store/products/[id]` (owner), `POST /api/orders` (public), `PATCH /api/orders/[id]` (owner).

## Service prices

Services support fixed prices, ranges (`priceMax`), "from" prices (`priceFrom`) and "on consultation" (`onRequest`), grouped into menu sections (`group`).

## Email (SMTP)

Sent with Nodemailer over SMTP — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `APP_URL` (see `.env.example`). Without SMTP settings, emails are printed to the server console instead. Emails are sent after the response (`after()`), so a slow mail server never delays users.

Premium, table-based HTML template with plain-text fallback: `src/lib/email/layout.ts`; all messages: `src/lib/email/templates.ts`.

| Email | Sent to | When |
|---|---|---|
| Verify your email | New operator | Sign-up (listing stays hidden until verified); resend from dashboard |
| You're live | Operator | After verification |
| Reset your password / Password updated | Operator | `/forgot-password` → `/reset-password` |
| New booking request | Business email | Client books |
| Request sent | Client (if email given) | Client books |
| Confirmed / can't go ahead / thank you | Client | Operator confirms, declines/cancels, completes |
| New shop order | Business email | Client orders |
| Order received / confirmed / ready or out for delivery / completed / cancelled | Client | Order placed & each status change |

Existing accounts (created before verification existed) count as verified.

## Operator self-service

- **Edit listing** — `/dashboard/<slug>/edit` (`src/components/ListingEditor.tsx`): profile and contact details, photos, the full service menu (ranges, "from" and on-consultation prices) and opening hours, in four tabs that save together. The dashboard's service and hours cards link straight to the right tab.
- Changes go through `PATCH /api/operators/<slug>`, which only accepts the signed-in owner's own listing and never touches plan, verified badge, ratings or reviews. Photo and service counts are capped by the plan.
- A team-managed listing in `src/lib/listings.ts` is still overwritten if its `revision` goes up, so raise that only when you mean to replace the owner's edits.

## Plans & payments

- **Upgrading** starts at `/dashboard/<slug>/upgrade` — plan choice, then payment. It never re-runs the new-listing wizard, and the pricing table on `/for-business` links there too when an operator is signed in.
- **Flutterwave** (`src/lib/billing.ts`): set `FLW_SECRET_KEY` and the operator pays by card, transfer or USSD. Flutterwave returns to `/api/billing/callback`, which verifies the transaction server-side (amount, currency and reference) before the plan changes — the redirect alone is never trusted.
- **Without a key**, the same button shows the glee.ng bank account (Shed Factory Limited · 0501730843 · Sterling Bank — override with `BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`) and a short form: who the transfer was sent from, their bank, the date and the reference. Submitting it **activates the plan immediately** and records the payment as unconfirmed.
- The team then matches it against the bank statement at `/admin/plans`: "Money received" confirms it, "No payment found" reverses the listing to its previous plan. `TEAM_EMAIL` (or `SMTP_USER`) gets an email with the declared details.
- Payments are recorded in the `payments` collection with the declared details and the previous plan; a listing carries `planStatus` (`active` / `confirming`) and `planRenewsAt`.

## The Journal (blog)

Public pages: `/journal` and `/journal/<slug>`. Only the glee.ng team publishes.

- **Admin sign-in:** `/admin/login`, using `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH` from `npm run hash -- "your password"`). There is no admin user in the database — whoever holds the deployment secret is the admin. The session is a separate signed cookie (`glee_admin`), so an operator account can never reach the admin area.
- **Admin area:** `/admin` lists every story with publish / unpublish / edit / delete; `/admin/posts/new` is the editor (markdown with live preview, standfirst, tags, byline, cover image).
- **Posts** live in the `posts` collection (`src/lib/blog.ts`). Drafts are invisible to the public — hidden from the list, the API and search — but an admin can preview one at its own URL.
- **Markdown** is rendered by `src/lib/markdown.ts`, a small in-house subset (headings, bold, italic, lists, quotes, links, rules). HTML in a post is escaped, never rendered, so a post cannot inject scripts.
- **Team-written posts** ship in `src/lib/blog-seed.ts` and follow the managed-listing pattern: inserted when missing, refreshed when `revision` goes up. The introductory post "Beauty, beautifully booked" is revision 1.
- Journal pages carry article Open Graph tags and appear in `sitemap.xml`; `/admin` is `noindex` and disallowed in robots.txt.

## Share previews (Open Graph) & SEO

- Every page carries Open Graph + Twitter card tags. The site default uses `public/og/glee-og.jpg` (1200×630); business profiles use their cover photo, Prestige shops use the business logo.
- Absolute URLs come from `APP_URL` (set it to `https://glee.ng` in production). On Vercel it falls back to the project's production domain automatically.
- `/robots.txt` and `/sitemap.xml` are generated (`src/app/robots.ts`, `src/app/sitemap.ts`); dashboards, sign-in, booking/order receipts and account pages are `noindex`.

## Installable app (PWA)

- Web app manifest at `/manifest.webmanifest` (`src/app/manifest.ts`) with icons in `public/icons/` — clients can "Add to Home Screen" on iOS and install on Android/desktop Chrome.
- Service worker `public/sw.js` (registered in production only): pages are network-first so prices and availability stay live, public pages fall back to the last copy seen, and anything uncached shows `public/offline.html`. API calls, dashboards, sign-in and receipts are never cached.
- After changing `sw.js`, bump its `VERSION` so returning visitors pick up the new worker.

## Deploying (GitHub → Vercel)

Repository: `github.com/smithdotng/gleedotng`. Import it in Vercel (framework: Next.js) and add the environment variables from `.env.example` — at minimum `MONGODB_URI`, `AUTH_SECRET`, `APP_URL` and the `SMTP_*` / `MAIL_FROM` values. Every `git push` to `main` redeploys.
- **Install button:** `src/components/InstallApp.tsx` + `src/lib/pwa-install.ts`. A "Get the app" button appears in the header/mobile menu and footer, plus contextual cards on the operator dashboard and the booking confirmation page — only when the browser can actually install (Chrome/Edge/Android) or on iPhone/iPad, where it opens "Share → Add to Home Screen" instructions. Hidden once installed; cards can be dismissed for two weeks.
