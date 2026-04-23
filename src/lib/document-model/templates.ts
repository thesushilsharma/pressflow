import type {
  PressFlowDocument,
  PressFlowMode,
  PressFlowSection,
  PressFlowSectionKind,
} from "@/lib/document-model/types";

function nowIso(): string {
  return new Date().toISOString();
}

function baseDocument(mode: PressFlowMode): PressFlowDocument {
  const timestamp = nowIso();
  return {
    id: crypto.randomUUID(),
    name: `Untitled ${mode}`,
    mode,
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    theme: {
      id: "clean-slate",
      name: "Clean Slate",
      headingFont: "var(--font-heading)",
      bodyFont: "var(--font-sans)",
      radius: "md",
      density: "comfortable",
    },
    sections: [],
  };
}

export function createDocument(mode: PressFlowMode): PressFlowDocument {
  const doc = baseDocument(mode);
  if (mode === "presentation") {
    doc.sections = [
      {
        id: crypto.randomUUID(),
        kind: "slide",
        title: "PressFlow Quarterly Story",
        body: "A frictionless way to deliver polished narratives.",
      },
      {
        id: crypto.randomUUID(),
        kind: "slide",
        title: "The Opportunity",
        body: "Design, marketing, and editorial teams need one expressive workflow.",
      },
    ];
  }

  if (mode === "landing") {
    doc.sections = [
      {
        id: crypto.randomUUID(),
        kind: "hero",
        eyebrow: "Introducing PressFlow",
        title: "Ship high-impact landing pages in minutes",
        body: "Write content once. PressFlow handles layout, spacing, and responsiveness.",
      },
      {
        id: crypto.randomUUID(),
        kind: "featureGrid",
        title: "Built for modern teams",
        features: [
          {
            id: crypto.randomUUID(),
            title: "Visual Sections",
            description: "Assemble polished pages without wrestling CSS.",
          },
          {
            id: crypto.randomUUID(),
            title: "Content First",
            description:
              "Focus on narrative while the system keeps rhythm and scale.",
          },
          {
            id: crypto.randomUUID(),
            title: "Fast Export",
            description: "Publish static HTML/CSS/JS bundles instantly.",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        kind: "cta",
        title: "Start building with PressFlow",
        body: "From campaign pages to product launches, publish fast.",
        buttonLabel: "Try PressFlow",
        buttonHref: "#",
      },
    ];
  }

  if (mode === "article") {
    doc.sections = [
      {
        id: crypto.randomUUID(),
        kind: "hero",
        title: "Longform stories, beautifully structured",
        body: "Blend editorial clarity with conversion-friendly layout.",
      },
      {
        id: crypto.randomUUID(),
        kind: "longformText",
        title: "Opening",
        markdown:
          "PressFlow enables journalists and marketers to craft clear narratives without layout friction.",
      },
      {
        id: crypto.randomUUID(),
        kind: "testimonial",
        quote:
          "We reduced publish time by 60% while making every story look premium.",
        author: "Avery Singh",
        role: "Editorial Lead",
      },
    ];
  }

  return doc;
}

export function createSection(kind: PressFlowSectionKind): PressFlowSection {
  const id = crypto.randomUUID();
  switch (kind) {
    case "hero":
      return { id, kind, title: "New hero", body: "Describe your value." };
    case "featureGrid":
      return {
        id,
        kind,
        title: "Key features",
        features: [
          {
            id: crypto.randomUUID(),
            title: "Feature",
            description: "Describe it.",
          },
        ],
      };
    case "testimonial":
      return { id, kind, quote: "Customer quote", author: "Customer name" };
    case "cta":
      return {
        id,
        kind,
        title: "Call to action",
        buttonLabel: "Get started",
        buttonHref: "#",
      };
    case "longformText":
      return { id, kind, markdown: "Write your section..." };
    case "slide":
      return { id, kind, title: "Slide title", body: "Slide details" };
  }
}
