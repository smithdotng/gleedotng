/**
 * glee.ng premium email layout.
 * Table-based, inline-styled HTML that renders consistently in Gmail, Apple Mail, Outlook and mobile clients.
 */

export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

const C = {
  espresso: "#1d0f0a",
  espressoSoft: "#2a1610",
  cocoa: "#5a3322",
  gold: "#c9a46a",
  goldDeep: "#a8844c",
  goldLight: "#ecd9b0",
  ivory: "#fbf7f2",
  sand: "#f3ebe1",
  linen: "#e9dccd",
  muted: "#7b665b",
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type Block =
  | { type: "text"; html: string } // trusted HTML (build with esc())
  | { type: "details"; rows: [string, string][]; title?: string }
  | { type: "items"; rows: { label: string; qty: number; amount: string }[]; total: [string, string] }
  | { type: "code"; value: string; note?: string }
  | { type: "note"; html: string }
  | { type: "divider" };

export interface EmailContent {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string; // trusted HTML
  blocks?: Block[];
  cta?: { label: string; url: string };
  secondary?: { label: string; url: string };
  footerNote?: string;
}

function renderBlock(b: Block): string {
  switch (b.type) {
    case "text":
      return `<p style="margin:0 0 18px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.cocoa};">${b.html}</p>`;
    case "note":
      return `<p style="margin:0 0 18px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};">${b.html}</p>`;
    case "divider":
      return `<div style="height:1px;line-height:1px;font-size:0;background:${C.linen};margin:8px 0 26px;">&nbsp;</div>`;
    case "code":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td align="center" style="background:${C.sand};border:1px solid ${C.linen};border-radius:14px;padding:18px;">
        <div style="font-family:${SERIF};font-size:30px;letter-spacing:6px;color:${C.espresso};">${esc(b.value)}</div>
        ${b.note ? `<div style="margin-top:6px;font-family:${SANS};font-size:12px;color:${C.muted};">${esc(b.note)}</div>` : ""}
      </td></tr></table>`;
    case "details":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;background:${C.sand};border:1px solid ${C.linen};border-radius:16px;">
        ${b.title ? `<tr><td colspan="2" style="padding:18px 22px 4px;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.goldDeep};font-weight:bold;">${esc(b.title)}</td></tr>` : ""}
        ${b.rows
          .map(
            ([k, v], i) => `<tr>
              <td valign="top" style="padding:${i === 0 && !b.title ? 18 : 10}px 12px ${i === b.rows.length - 1 ? 18 : 10}px 22px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};width:38%;">${esc(k)}</td>
              <td valign="top" style="padding:${i === 0 && !b.title ? 18 : 10}px 22px ${i === b.rows.length - 1 ? 18 : 10}px 0;font-family:${SANS};font-size:14px;color:${C.espresso};font-weight:bold;line-height:1.5;">${esc(v)}</td>
            </tr>`,
          )
          .join("")}
      </table>`;
    case "items":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;border-top:1px solid ${C.linen};">
        ${b.rows
          .map(
            (r) => `<tr>
              <td style="padding:12px 0;border-bottom:1px solid ${C.linen};font-family:${SANS};font-size:14px;color:${C.cocoa};">${r.qty} × ${esc(r.label)}</td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid ${C.linen};font-family:${SANS};font-size:14px;color:${C.espresso};font-weight:bold;">${esc(r.amount)}</td>
            </tr>`,
          )
          .join("")}
        <tr>
          <td style="padding:16px 0 0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${esc(b.total[0])}</td>
          <td align="right" style="padding:16px 0 0;font-family:${SERIF};font-size:28px;color:${C.espresso};">${esc(b.total[1])}</td>
        </tr>
      </table>`;
  }
}

function button(label: string, url: string, primary = true) {
  const bg = primary ? C.gold : "transparent";
  const color = primary ? C.espresso : C.espresso;
  const border = primary ? C.gold : C.espresso;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px auto 0;"><tr>
    <td align="center" bgcolor="${bg}" style="border-radius:999px;border:1px solid ${border};">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${esc(url)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" fillcolor="${bg}" stroke="f"><center style="color:${color};font-family:Arial;font-size:14px;font-weight:bold;">${esc(label)}</center></v:roundrect><![endif]-->
      <!--[if !mso]><!-- --><a href="${esc(url)}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:${SANS};font-size:14px;font-weight:bold;letter-spacing:0.5px;color:${color};text-decoration:none;border-radius:999px;">${esc(label)}</a><!--<![endif]-->
    </td></tr></table>`;
}

export function renderEmail(c: EmailContent): { html: string; text: string } {
  const url = appUrl();
  const logo = `${url}/brand/glee-logo-light.png`;
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(c.subject)}</title>
<style>
  @media (max-width:620px){ .container{width:100%!important} .px{padding-left:26px!important;padding-right:26px!important} .title{font-size:30px!important} }
  a{color:${C.goldDeep}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.sand};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(c.preheader)}&#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.sand}" style="background:${C.sand};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
    <!-- header -->
    <tr><td align="center" bgcolor="${C.espresso}" style="background:${C.espresso};border-radius:24px 24px 0 0;padding:34px 20px 30px;">
      <a href="${url}" target="_blank" style="text-decoration:none;">
        <img src="${logo}" height="46" alt="glee.ng" style="display:block;height:46px;width:auto;border:0;font-family:${SERIF};font-size:34px;font-style:italic;color:${C.ivory};">
      </a>
    </td></tr>
    <tr><td bgcolor="${C.espresso}" style="background:${C.espresso};padding:0 60px;"><div style="height:1px;line-height:1px;font-size:0;background:${C.gold};opacity:0.7;">&nbsp;</div></td></tr>
    <!-- body -->
    <tr><td class="px" bgcolor="${C.ivory}" style="background:${C.ivory};padding:44px 52px 40px;">
      <p style="margin:0 0 12px;font-family:${SANS};font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:${C.goldDeep};font-weight:bold;">${esc(c.eyebrow)}</p>
      <h1 class="title" style="margin:0 0 18px;font-family:${SERIF};font-size:36px;line-height:1.12;font-weight:normal;color:${C.espresso};">${esc(c.title)}</h1>
      <p style="margin:0 0 26px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.cocoa};">${c.intro}</p>
      ${(c.blocks ?? []).map(renderBlock).join("\n")}
      ${c.cta ? `<div style="text-align:center;margin:8px 0 10px;">${button(c.cta.label, c.cta.url)}</div>` : ""}
      ${c.secondary ? `<div style="text-align:center;margin:12px 0 0;">${button(c.secondary.label, c.secondary.url, false)}</div>` : ""}
      ${
        c.cta
          ? `<p style="margin:26px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};text-align:center;">Button not working? Paste this link into your browser:<br><a href="${esc(c.cta.url)}" style="color:${C.goldDeep};word-break:break-all;">${esc(c.cta.url)}</a></p>`
          : ""
      }
    </td></tr>
    <!-- footer -->
    <tr><td align="center" bgcolor="${C.espressoSoft}" style="background:${C.espressoSoft};border-radius:0 0 24px 24px;padding:30px 40px 34px;">
      <p style="margin:0 0 10px;font-family:${SERIF};font-size:20px;font-style:italic;color:${C.goldLight};">Beauty, beautifully booked.</p>
      <p style="margin:0 0 16px;font-family:${SANS};font-size:12px;line-height:1.8;color:#bfa89a;">
        <a href="${url}/explore" style="color:${C.goldLight};text-decoration:none;">Explore</a> &nbsp;·&nbsp;
        <a href="${url}/for-business" style="color:${C.goldLight};text-decoration:none;">For business</a> &nbsp;·&nbsp;
        <a href="mailto:hello@glee.ng" style="color:${C.goldLight};text-decoration:none;">hello@glee.ng</a>
      </p>
      <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.7;color:#9c857a;">${esc(c.footerNote ?? "You're receiving this email because of activity on your glee.ng account.")}<br>© ${new Date().getFullYear()} glee.ng · Crafted in Nigeria</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  // Plain-text alternative
  const strip = (h: string) => h.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const lines: string[] = [c.title, "", strip(c.intro), ""];
  for (const b of c.blocks ?? []) {
    if (b.type === "text" || b.type === "note") lines.push(strip(b.html), "");
    if (b.type === "details") lines.push(...b.rows.map(([k, v]) => `${k}: ${v}`), "");
    if (b.type === "items") lines.push(...b.rows.map((r) => `${r.qty} x ${r.label} — ${r.amount}`), `${b.total[0]}: ${b.total[1]}`, "");
    if (b.type === "code") lines.push(b.value, "");
  }
  if (c.cta) lines.push(`${c.cta.label}: ${c.cta.url}`, "");
  if (c.secondary) lines.push(`${c.secondary.label}: ${c.secondary.url}`, "");
  lines.push("—", "glee.ng · Beauty, beautifully booked.", `${url}`);
  return { html, text: lines.join("\n") };
}
