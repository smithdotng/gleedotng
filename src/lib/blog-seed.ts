import type { Post } from "./types";
import { IMG } from "./images";

/**
 * Posts written by the glee.ng team and shipped with the app.
 * Same pattern as managed listings: inserted if missing, refreshed when `revision` goes up,
 * and left alone afterwards so edits made in the admin area on an older revision survive.
 */
export const MANAGED_POSTS: { post: Post; revision: number }[] = [
  {
    revision: 1,
    post: {
      id: "post_for-business",
      slug: "the-chair-that-books-itself",
      title: "The chair that books itself",
      excerpt:
        "Your hands are the business. Everything else — the price list in your DMs, the back-and-forth, the Saturday you lost to a no-show — is admin standing between you and the next client. Here is what glee.ng carries for you.",
      cover: IMG.salonChairs,
      tags: ["For business", "Growth"],
      author: "Stanley — Founder, glee.ng",
      status: "published",
      publishedAt: "2026-09-24T08:00:00.000Z",
      createdAt: "2026-09-24T08:00:00.000Z",
      body: `You did not open a salon to answer messages.

You opened it because you can see the shape of a face and know the cut. Because a colour correction that would frighten other people is, to you, an afternoon. Because there is a particular satisfaction in a client looking at herself a little longer than she meant to.

And yet ask any owner where the week actually goes and you hear the same list: pricing questions in the DMs, a client who wanted Saturday but only said so on Friday, the deposit conversation, the rebooking that never happened because nobody sent the message. None of that is craft. All of it is cost.

glee.ng exists to take that weight off the chair.

## What a profile does that a feed cannot

An Instagram grid is a portfolio. It is a beautiful one, and you should keep it. But it was never built to answer the three questions that decide whether a stranger becomes a client: **what does it cost, are you free on Saturday, and can I book it now?**

Your glee.ng profile answers all three without you lifting your phone. Your work, your service menu, your prices — ranges where a range is honest, "from" where the work grows with length or product, on consultation where a face must be seen first. Your hours, so nobody asks for a Monday you never open. Your location and a tap-to-call number for the client who would rather hear your voice.

A client picks a service, takes a time that is genuinely free, and the appointment lands on your dashboard while you are still finishing the head in front of you.

> You are not selling harder. You are simply not losing the people who were already sold.

## The quiet arithmetic

Run the numbers on your own week rather than mine.

- Count the enquiries you answered that never became appointments. How many died waiting for a reply you were too busy to send?
- Count the hours your chairs sat empty on a day that looked full in your head.
- Count the clients who meant to come back and never quite got round to asking when.

A single recovered booking a week is not a rounding error in this trade. It is rent, or staff, or the stock you keep meaning to order. The platform does not need to work miracles to pay for itself; it only needs to stop the ordinary leaks.

## Start free. Upgrade when it earns it.

**Essential — free, permanently.** A full profile, up to ten services with prices, photographs, online booking requests, and a dashboard where you confirm appointments with a tap. No card, no trial clock. If all glee.ng ever does for you is take bookings while you work, it costs nothing.

**Signature — ₦15,000 a month.** For the house that wants to be found first: featured placement on the home page and in search, the gold verified badge our team grants after reviewing your business, and an unlimited menu and gallery. Placement is the difference between being on the list and being at the top of it.

**Prestige — ₦35,000 a month.** Everything in Signature, plus your own boutique inside glee.ng. Sell the serums, bundles, pomades and aftercare you already recommend, with stock that keeps itself honest and orders you fulfil by pickup or delivery — beside the services that sell them. For most houses this is the line that changes the economics: the same client, the same visit, a second revenue line.

Upgrading takes a minute from your dashboard, and it never touches your listing — your profile, your prices, your bookings and your clients stay exactly as they are.

## What you keep

Your clients are yours. Your name is yours. Your standards are yours — we simply ask that prices are published, hours are real, and the portfolio is your own work, because trust is the whole product in this trade.

What changes is who carries the admin. You bring the craft; we carry the page, the calendar, the notifications, the receipts and the shop.

## The room is filling

We are onboarding deliberately: a small number of exceptional businesses, each one reviewed, Abuja and Lagos first. Early listings get the placement, the attention of our team, and a say in what we build next — the kind of advantage that stops being available once a marketplace is crowded.

If you have built something worth finding, let it be found.

[List your business](/list-your-business) — it takes about five minutes and costs nothing. Or [read the plans in full](/for-business#pricing) and choose the one that matches your ambition.

Your hands are the business. Let the rest of it run itself.

---

**Stanley** — Founder, glee.ng`,
    },
  },
  {
    revision: 2,
    post: {
      id: "post_welcome",
      slug: "welcome-to-glee-ng",
      title: "Beauty, beautifully booked",
      excerpt:
        "Nigeria's beauty talent has never been the problem. Finding it, trusting it and booking it has. glee.ng is our answer — a considered home for the country's finest stylists, salons and spas.",
      cover: IMG.salonLounge,
      tags: ["Introducing glee", "Our philosophy"],
      author: "Stanley — Founder, glee.ng",
      status: "published",
      publishedAt: "2026-09-23T09:00:00.000Z",
      createdAt: "2026-09-23T09:00:00.000Z",
      body: `Nigerian beauty has never wanted for talent. Walk through Wuse, Ikoyi, Lekki or GRA and you will find braiders whose parting lines could be drawn with a ruler, colourists who can read undertone at a glance, facialists with the steady hands of surgeons, barbers who finish a fade like a signature. What has been missing is not craft. It is the quiet infrastructure that lets craft be found, trusted and booked.

That is the whole of our ambition. glee.ng exists so that the best work in this country meets the people looking for it, without friction and without guesswork.

## The hour before the appointment

Consider how a booking is usually made. A friend shares a name. You find a page, scroll past a hundred posts for a price list that isn't there, send a message, and wait. Sometime later a voice note tells you Saturday is full. You begin again with the next name.

Nothing about that hour is beautiful, and none of it is the stylist's fault. They are working — hands busy, phone face down, a client in the chair who deserves their attention.

glee.ng removes that hour. Every business on the platform has a real profile: the work, the service menu, the prices, the hours, the location. You choose a service, take a time that is genuinely free, and the appointment arrives on their dashboard while they are still finishing the head in front of them.

> Discovery, prices and availability in one place. A calm booking, an honest price, a chair held for you.

## What we ask of a listing

A marketplace is only as good as its standards, so ours are plain.

- **Prices are published.** Ranges where a range is honest, "from" where the work grows with length or product, on consultation where a face must be seen first. What you should never find here is a hidden number.
- **Hours are real.** If a salon is closed on Monday, Monday cannot be booked.
- **The portfolio is theirs.** Their work, their room, their hands.
- **Verification is earned.** A gold badge means our team has reviewed the business — not that it paid for a badge.

Trust, in this trade, is the entire product. A client who arrives relaxed is already halfway to a good result.

## For the businesses we serve

We built the operator side of glee.ng the way we would want to run a salon.

Your profile is a page you would be proud to send to a client — photography, menu, prices, story. Bookings arrive in one place and are confirmed with a tap. Your calendar fills without a single message that begins "Hi dear, how much for…". And on the Prestige plan, your boutique comes with you: retail your serums, bundles, pomades and aftercare beside the services that sell them, with stock that keeps itself honest.

You keep what you have always had — your clients, your name, your standards. We simply carry the admin.

## Value, plainly stated

For clients, glee.ng is an end to the search: a curated shortlist, prices before you commit, and a booking that takes under a minute — on the web or installed on your phone like an app.

For stylists and salons, it is a shopfront that works while you do: discovery you do not have to chase, appointments you do not have to chase down, and a second revenue line in the store.

For the industry, it is something slower and more valuable — a record of what good work costs and what good service looks like, built business by business, appointment by appointment.

## Beginning as we mean to go on

We are starting deliberately: a small number of exceptional businesses, each one reviewed, in Abuja and Lagos first. This Journal will follow the work — the craft behind a treatment, the economics of a chair, the care that separates a service from an experience.

If you create beautiful work, we would like it to be found. [List your business](/list-your-business) and we will take it from there.

If you are simply looking for your next appointment, [start exploring](/explore). The finest rooms in the country are a tap away.

---

**Stanley** — Founder, glee.ng`,
    },
  },
];
