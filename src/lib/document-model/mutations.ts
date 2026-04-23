import { createSection } from "@/lib/document-model/templates";
import type {
  PressFlowDocument,
  PressFlowSection,
  PressFlowSectionKind,
} from "@/lib/document-model/types";

function touch(document: PressFlowDocument): PressFlowDocument {
  return { ...document, updatedAt: new Date().toISOString() };
}

export function insertSection(
  document: PressFlowDocument,
  kind: PressFlowSectionKind,
): PressFlowDocument {
  const next = touch(document);
  return { ...next, sections: [...next.sections, createSection(kind)] };
}

export function reorderSection(
  document: PressFlowDocument,
  from: number,
  to: number,
): PressFlowDocument {
  if (from === to || from < 0 || to < 0) {
    return document;
  }

  const next = [...document.sections];
  const [moved] = next.splice(from, 1);
  if (!moved) {
    return document;
  }
  next.splice(Math.min(to, next.length), 0, moved);
  return { ...touch(document), sections: next };
}

export function updateSection(
  document: PressFlowDocument,
  sectionId: string,
  patch: Partial<PressFlowSection>,
): PressFlowDocument {
  return {
    ...touch(document),
    sections: document.sections.map((section) =>
      section.id === sectionId
        ? ({ ...section, ...patch } as PressFlowSection)
        : section,
    ),
  };
}
