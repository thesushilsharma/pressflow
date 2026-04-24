import type {
  CtaSection,
  FeatureGridSection,
  LongformTextSection,
  PressFlowDocument,
  PressFlowSection,
  SlideSection,
  TestimonialSection,
} from "@/lib/document-model/types";

const exportCss = `
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:#111827;background:#fff}
main{max-width:1100px;margin:0 auto;padding:2rem 1rem}
section{padding:2rem 0;border-bottom:1px solid #e5e7eb}
h1,h2{line-height:1.2;margin:0 0 0.75rem}p{margin:0.5rem 0;color:#374151}
.hero h1{font-size:2.25rem}.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.card{padding:1rem;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb}
.cta a{display:inline-block;padding:0.7rem 1rem;border-radius:999px;background:#111827;color:#fff;text-decoration:none}
.slide{min-height:70vh;display:flex;flex-direction:column;justify-content:center}
.quote{font-size:1.25rem;font-style:italic}
`;

function esc(value?: string): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFeatureGrid(section: FeatureGridSection): string {
  return `<section><h2>${esc(section.title)}</h2><div class="grid">${section.features
    .map(
      (feature) =>
        `<article class="card"><h3>${esc(feature.title)}</h3><p>${esc(feature.description)}</p></article>`,
    )
    .join("")}</div></section>`;
}

function renderCta(section: CtaSection): string {
  const className =
    section.buttonVariant === "outline"
      ? 'style="background:transparent;color:#111827;border:1px solid #111827"'
      : "";
  return `<section class="cta"><h2>${esc(section.title)}</h2><p>${esc(section.body)}</p><a ${className} href="${esc(
    section.buttonHref,
  )}">${esc(section.buttonLabel)}</a></section>`;
}

function renderLongform(section: LongformTextSection): string {
  const lines = esc(section.markdown).split("\n").filter(Boolean);
  return `<section><h2>${esc(section.title)}</h2>${lines.map((line) => `<p>${line}</p>`).join("")}</section>`;
}

function renderSlide(section: SlideSection): string {
  return `<section class="slide"><h1>${esc(section.title)}</h1><p>${esc(section.body)}</p></section>`;
}

function renderTestimonial(section: TestimonialSection): string {
  return `<section><p class="quote">"${esc(section.quote)}"</p><p><strong>${esc(section.author)}</strong> ${esc(
    section.role,
  )}</p></section>`;
}

function renderSection(section: PressFlowSection): string {
  switch (section.kind) {
    case "hero":
      return `<section class="hero" style="text-align:${section.alignment === "center" ? "center" : "left"}"><h1>${esc(section.title)}</h1><p>${esc(section.body)}</p></section>`;
    case "featureGrid":
      return renderFeatureGrid(section);
    case "testimonial":
      return renderTestimonial(section);
    case "cta":
      return renderCta(section);
    case "longformText":
      return renderLongform(section);
    case "slide":
      return renderSlide(section);
  }
}

export function renderDocumentToHtml(document: PressFlowDocument): string {
  const sections = document.sections.map(renderSection).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(document.name)}</title>
    <style>${exportCss}</style>
  </head>
  <body>
    <main data-mode="${document.mode}">
      ${sections}
    </main>
  </body>
</html>`;
}
