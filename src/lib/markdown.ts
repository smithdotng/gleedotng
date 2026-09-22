/**
 * A very small markdown subset for Journal posts — no dependencies, and HTML in the source
 * is escaped rather than rendered, so a post can never inject scripts into the page.
 *
 * Supported: # ## ### headings, paragraphs, **bold**, *italic*, `code`, [links](url),
 * - bullet lists, 1. numbered lists, > quotes, --- rules.
 */

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-sand px-1.5 py-0.5 text-[0.9em]">$1</code>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const safe = /^(https?:\/\/|\/|mailto:|tel:)/i.test(href) ? href : "#";
    const external = /^https?:\/\//i.test(safe);
    return `<a href="${safe}" class="font-medium text-gold-700 underline underline-offset-4 hover:text-gold-600"${
      external ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-espresso-900">$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em class="italic">$2</em>');
  return out;
}

export function renderMarkdown(src: string): string {
  const lines = (src ?? "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let list: "ul" | "ol" | null = null;
  let para: string[] = [];
  let quote: string[] = [];

  const closeList = () => {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  };
  const closePara = () => {
    if (para.length) {
      html.push(`<p class="mt-5 leading-[1.85] text-espresso-700">${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeQuote = () => {
    if (quote.length) {
      html.push(
        `<blockquote class="font-display my-8 border-l-2 border-gold-500 pl-6 text-2xl leading-snug text-espresso-800 italic">${inline(
          quote.join(" "),
        )}</blockquote>`,
      );
      quote = [];
    }
  };
  const closeAll = () => {
    closePara();
    closeQuote();
    closeList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeAll();
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      closeAll();
      html.push('<hr class="my-10 border-0 border-t border-linen" />');
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      closeAll();
      const level = heading[1].length;
      const cls =
        level === 1
          ? "font-display mt-12 text-4xl text-espresso-900"
          : level === 2
            ? "font-display mt-11 text-3xl text-espresso-900"
            : "mt-8 text-lg font-semibold tracking-wide text-espresso-900";
      html.push(`<h${level + 1} class="${cls}">${inline(heading[2])}</h${level + 1}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      closePara();
      closeList();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      closePara();
      closeQuote();
      const want = bullet ? "ul" : "ol";
      if (list !== want) {
        closeList();
        list = want;
        html.push(
          want === "ul"
            ? '<ul class="mt-5 list-disc space-y-2 pl-5 text-espresso-700 marker:text-gold-600">'
            : '<ol class="mt-5 list-decimal space-y-2 pl-5 text-espresso-700 marker:text-gold-600">',
        );
      }
      html.push(`<li class="leading-[1.8] pl-1">${inline((bullet ?? numbered)![1])}</li>`);
      continue;
    }
    closeQuote();
    closeList();
    para.push(line.trim());
  }
  closeAll();
  return html.join("\n");
}

/** Plain text of a post — for excerpts and reading time. */
export const stripMarkdown = (src: string) =>
  (src ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`_~-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export const readingMinutes = (src: string) => Math.max(1, Math.round(stripMarkdown(src).split(" ").length / 200));
