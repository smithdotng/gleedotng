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
      id: "post_welcome",
      slug: "welcome-to-glee-ng",
      title: "Beauty, beautifully booked",
      excerpt:
        "Nigeria's beauty talent has never been the problem. Finding it, trusting it and booking it has. glee.ng is our answer — a considered home for the country's finest stylists, salons and spas.",
      cover: IMG.salonLounge,
      tags: ["Introducing glee", "Our philosophy"],
      author: "The glee.ng team",
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

If you are simply looking for your next appointment, [start exploring](/explore). The finest rooms in the country are a tap away.`,
    },
  },
];
