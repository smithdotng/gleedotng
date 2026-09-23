import type { Booking, Operator, Order } from "../types";
import { duration, naira, prettyDate, prettyTime } from "../utils";
import { appUrl, esc, renderEmail, type EmailContent } from "./layout";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const build = (c: EmailContent): RenderedEmail => ({ subject: c.subject, ...renderEmail(c) });
const when = (b: Booking) => `${prettyDate(b.date, { weekday: "long", day: "numeric", month: "long" })} at ${prettyTime(b.time)}`;
const bookingRows = (b: Booking, op: Operator): [string, string][] => [
  ["Service", b.serviceName],
  ["When", when(b)],
  ["Duration", duration(b.durationMins)],
  ["Price", b.priceLabel ?? naira(b.price)],
  ["Where", b.atHome ? "Home service" : op.address],
  ["Reference", b.id.toUpperCase()],
];
const orderItems = (o: Order) => ({
  type: "items" as const,
  rows: o.items.map((i) => ({ label: i.name, qty: i.qty, amount: naira(i.price * i.qty) })),
  total: ["Subtotal", naira(o.subtotal)] as [string, string],
});

/* ---------------- Account ---------------- */

export function verifyEmail(p: { businessName: string; url: string }) {
  return build({
    subject: "Confirm your email to publish your glee.ng listing",
    preheader: "One tap to verify your email and go live on glee.ng.",
    eyebrow: "Welcome to glee.ng",
    title: "Confirm your email",
    intro: `Thank you for listing <b>${esc(p.businessName)}</b> on glee.ng. Please confirm this is your email address — your listing goes live for clients the moment you do.`,
    cta: { label: "Verify my email", url: p.url },
    blocks: [{ type: "note", html: "This link expires in 24 hours. If you didn't create a glee.ng account, you can safely ignore this email." }],
  });
}

export function welcomeLive(p: { op: Operator }) {
  const url = appUrl();
  return build({
    subject: `You're live on glee.ng, ${p.op.name}`,
    preheader: "Your listing is published and ready for bookings.",
    eyebrow: "Email verified",
    title: "Your doors are open",
    intro: `Your email is confirmed and <b>${esc(p.op.name)}</b> is now live on glee.ng. Clients can discover you, view your menu and request appointments around the clock.`,
    blocks: [
      {
        type: "details",
        title: "Your next three steps",
        rows: [
          ["1", "Share your link on Instagram & WhatsApp"],
          ["2", "Confirm new booking requests quickly"],
          ["3", "Add your best photos to stand out"],
        ],
      },
      { type: "note", html: `Your public link: <a href="${url}/stylists/${esc(p.op.slug)}">${url.replace(/^https?:\/\//, "")}/stylists/${esc(p.op.slug)}</a>` },
    ],
    cta: { label: "Open my dashboard", url: `${url}/dashboard/${p.op.slug}` },
  });
}

export function passwordReset(p: { url: string }) {
  return build({
    subject: "Reset your glee.ng password",
    preheader: "Use this link to choose a new password. It expires in 1 hour.",
    eyebrow: "Account security",
    title: "Reset your password",
    intro: "We received a request to reset the password for your glee.ng operator account. Choose a new one below.",
    cta: { label: "Choose a new password", url: p.url },
    blocks: [{ type: "note", html: "This link expires in 1 hour and can only be used once. If you didn't ask for this, you can ignore this email — your password won't change." }],
  });
}

export function passwordChanged(p: { email: string }) {
  return build({
    subject: "Your glee.ng password was changed",
    preheader: "A quick confirmation that your password was updated.",
    eyebrow: "Account security",
    title: "Password updated",
    intro: `The password for <b>${esc(p.email)}</b> was just changed. You can now sign in with your new password.`,
    blocks: [{ type: "note", html: `Wasn't you? Reset your password straight away and contact <a href="mailto:hello@glee.ng">hello@glee.ng</a>.` }],
    cta: { label: "Sign in", url: `${appUrl()}/login` },
  });
}

/* ---------------- Bookings ---------------- */

export function bookingNewForOperator(p: { booking: Booking; op: Operator }) {
  const b = p.booking;
  return build({
    subject: `New booking request · ${b.serviceName} · ${prettyDate(b.date)} ${prettyTime(b.time)}`,
    preheader: `${b.customerName} would like to book ${b.serviceName}.`,
    eyebrow: "New booking request",
    title: `${b.customerName} would like to book`,
    intro: "A client has requested an appointment. Confirm it from your dashboard so they can plan their day.",
    blocks: [
      { type: "details", rows: bookingRows(b, p.op) },
      {
        type: "details",
        title: "Client",
        rows: [["Name", b.customerName], ["Phone", b.customerPhone], ...(b.customerEmail ? [["Email", b.customerEmail] as [string, string]] : []), ...(b.notes ? [["Notes", b.notes] as [string, string]] : [])],
      },
    ],
    cta: { label: "Review & confirm", url: `${appUrl()}/dashboard/${p.op.slug}` },
    footerNote: "You're receiving this because your business is listed on glee.ng.",
  });
}

export function bookingReceivedForClient(p: { booking: Booking; op: Operator }) {
  const b = p.booking;
  return build({
    subject: `Request sent to ${p.op.name}`,
    preheader: `We'll let you know as soon as ${p.op.name} confirms.`,
    eyebrow: "Booking requested",
    title: "Your request is with them",
    intro: `Thank you, ${esc(b.customerName.split(" ")[0])}. <b>${esc(p.op.name)}</b> has received your request and will confirm shortly — we'll email you the moment they do.`,
    blocks: [{ type: "details", rows: bookingRows(b, p.op) }],
    cta: { label: "View booking", url: `${appUrl()}/bookings/${b.id}` },
    footerNote: "You're receiving this because you requested an appointment on glee.ng.",
  });
}

export function bookingStatusForClient(p: { booking: Booking; op: Operator }) {
  const b = p.booking;
  const first = esc(b.customerName.split(" ")[0]);
  const copy = {
    confirmed: {
      subject: `Confirmed: ${b.serviceName} at ${p.op.name}`,
      eyebrow: "Booking confirmed",
      title: "You're booked",
      intro: `Wonderful news, ${first} — <b>${esc(p.op.name)}</b> has confirmed your appointment. We look forward to seeing you.`,
    },
    cancelled: {
      subject: `Update on your booking with ${p.op.name}`,
      eyebrow: "Booking update",
      title: "This appointment can't go ahead",
      intro: `We're sorry, ${first} — <b>${esc(p.op.name)}</b> isn't able to take this appointment. Please choose another time, or discover another artisan on glee.ng.`,
    },
    completed: {
      subject: `Thank you for visiting ${p.op.name}`,
      eyebrow: "Until next time",
      title: "We hope you're glowing",
      intro: `Thank you for booking with <b>${esc(p.op.name)}</b> through glee.ng, ${first}. We'd love to see you again soon.`,
    },
    pending: null,
  }[b.status];
  if (!copy) return null;
  return build({
    ...copy,
    preheader: copy.intro.replace(/<[^>]+>/g, ""),
    blocks: [{ type: "details", rows: bookingRows(b, p.op) }],
    cta:
      b.status === "cancelled"
        ? { label: "Choose another time", url: `${appUrl()}/stylists/${p.op.slug}` }
        : b.status === "completed"
          ? { label: "Book again", url: `${appUrl()}/stylists/${p.op.slug}` }
          : { label: "View booking", url: `${appUrl()}/bookings/${b.id}` },
    footerNote: "You're receiving this because you booked an appointment on glee.ng.",
  });
}

/* ---------------- Store orders ---------------- */

export function orderNewForOperator(p: { order: Order; op: Operator }) {
  const o = p.order;
  return build({
    subject: `New order · ${naira(o.subtotal)} · ${o.customerName}`,
    preheader: `${o.items.reduce((n, i) => n + i.qty, 0)} item(s) for ${o.fulfilment}.`,
    eyebrow: "New shop order",
    title: "You've made a sale",
    intro: `<b>${esc(o.customerName)}</b> placed an order in your glee.ng boutique for <b>${o.fulfilment}</b>. Payment is collected on ${o.fulfilment}.`,
    blocks: [
      orderItems(o),
      {
        type: "details",
        title: "Client",
        rows: [
          ["Name", o.customerName],
          ["Phone", o.customerPhone],
          ...(o.customerEmail ? [["Email", o.customerEmail] as [string, string]] : []),
          ...(o.address ? [["Deliver to", o.address] as [string, string]] : []),
          ...(o.notes ? [["Notes", o.notes] as [string, string]] : []),
          ["Reference", o.id.toUpperCase()],
        ],
      },
    ],
    cta: { label: "Manage order", url: `${appUrl()}/dashboard/${p.op.slug}/store` },
    footerNote: "You're receiving this because your boutique is on glee.ng.",
  });
}

export function orderReceivedForClient(p: { order: Order; op: Operator }) {
  const o = p.order;
  return build({
    subject: `Order received · ${p.op.name}`,
    preheader: `Your order ${o.id.toUpperCase()} is with ${p.op.name}.`,
    eyebrow: "Order received",
    title: "Thank you for your order",
    intro: `<b>${esc(p.op.name)}</b> has your order and will confirm shortly. You'll pay on ${o.fulfilment}${o.fulfilment === "delivery" ? " — the delivery fee will be confirmed before dispatch" : ""}.`,
    blocks: [
      orderItems(o),
      {
        type: "details",
        rows: [
          [o.fulfilment === "pickup" ? "Pick up at" : "Deliver to", o.fulfilment === "pickup" ? p.op.address : o.address ?? ""],
          ["Reference", o.id.toUpperCase()],
        ],
      },
    ],
    cta: { label: "View order", url: `${appUrl()}/orders/${o.id}` },
    footerNote: "You're receiving this because you placed an order on glee.ng.",
  });
}

export function orderStatusForClient(p: { order: Order; op: Operator }) {
  const o = p.order;
  const copy = {
    confirmed: { subject: `Order confirmed · ${p.op.name}`, eyebrow: "Order confirmed", title: "Your order is confirmed", intro: `<b>${esc(p.op.name)}</b> has confirmed your order and is preparing it now.` },
    ready:
      o.fulfilment === "pickup"
        ? { subject: `Ready for pickup · ${p.op.name}`, eyebrow: "Ready for you", title: "Your order is ready", intro: `Your order is packed and waiting at <b>${esc(p.op.name)}</b>. Bring your reference when you collect.` }
        : { subject: `On its way · ${p.op.name}`, eyebrow: "Out for delivery", title: "Your order is on its way", intro: `<b>${esc(p.op.name)}</b> has sent your order out for delivery.` },
    completed: { subject: `Thank you for shopping with ${p.op.name}`, eyebrow: "Order complete", title: "Enjoy your treats", intro: `Thank you for shopping with <b>${esc(p.op.name)}</b> on glee.ng.` },
    cancelled: { subject: `Order cancelled · ${p.op.name}`, eyebrow: "Order update", title: "Your order was cancelled", intro: `<b>${esc(p.op.name)}</b> has cancelled this order. If you've any questions, please contact them directly.` },
    pending: null,
  }[o.status];
  if (!copy) return null;
  return build({
    ...copy,
    preheader: copy.intro.replace(/<[^>]+>/g, ""),
    blocks: [orderItems(o), { type: "details", rows: [[o.fulfilment === "pickup" ? "Pick up at" : "Deliver to", o.fulfilment === "pickup" ? p.op.address : o.address ?? ""], ["Reference", o.id.toUpperCase()]] }],
    cta: o.status === "completed" ? { label: "Shop again", url: `${appUrl()}/stylists/${p.op.slug}/shop` } : { label: "View order", url: `${appUrl()}/orders/${o.id}` },
    footerNote: "You're receiving this because you placed an order on glee.ng.",
  });
}

/* ---------------- Plans ---------------- */

export function planActivated(p: { op: Operator; planName: string; amount: number; renewsAt: string }) {
  const url = appUrl();
  return build({
    subject: `Your glee.ng ${p.planName} plan is active`,
    preheader: `Payment received — ${p.op.name} is now on ${p.planName}.`,
    eyebrow: "Payment received",
    title: `Welcome to ${p.planName}`,
    intro: `Thank you — <b>${esc(p.op.name)}</b> is now on the <b>${esc(p.planName)}</b> plan. Everything that comes with it is switched on already.`,
    blocks: [
      {
        type: "details",
        title: "Your plan",
        rows: [
          ["Plan", p.planName],
          ["Paid", naira(p.amount)],
          ["Renews", prettyDate(p.renewsAt.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })],
        ],
      },
    ],
    cta: { label: "Open my dashboard", url: `${url}/dashboard/${p.op.slug}` },
  });
}

export function planRequested(p: { op: Operator; planName: string; amount: number }) {
  return build({
    subject: `We're confirming your ${p.planName} payment`,
    preheader: "Your upgrade is with our team.",
    eyebrow: "Upgrade pending",
    title: "Thank you — we're checking your transfer",
    intro: `We have your request to move <b>${esc(p.op.name)}</b> to the <b>${esc(p.planName)}</b> plan. As soon as we see your transfer of <b>${naira(
      p.amount,
    )}</b>, the plan goes live and we'll email you. This is usually within a few working hours.`,
    blocks: [{ type: "note", html: "Nothing changes on your listing until we confirm — your bookings carry on as normal." }],
  });
}

export function planRequestForTeam(p: { op: Operator; planName: string; amount: number }) {
  const url = appUrl();
  return build({
    subject: `Upgrade request: ${p.op.name} → ${p.planName}`,
    preheader: `${p.op.name} says they have paid ${naira(p.amount)} by transfer.`,
    eyebrow: "Action needed",
    title: "An operator has requested an upgrade",
    intro: `<b>${esc(p.op.name)}</b> (${esc(p.op.email)}) asked to move to <b>${esc(p.planName)}</b> and says the transfer of <b>${naira(
      p.amount,
    )}</b> has been sent. Confirm the money, then activate the plan.`,
    blocks: [
      {
        type: "details",
        title: "Business",
        rows: [
          ["Name", p.op.name],
          ["Where", `${p.op.area}, ${p.op.city}`],
          ["Phone", p.op.phone],
          ["Current plan", p.op.plan],
        ],
      },
    ],
    cta: { label: "Open plan requests", url: `${url}/admin/plans` },
  });
}
