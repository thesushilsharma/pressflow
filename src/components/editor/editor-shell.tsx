"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  insertSection,
  reorderSection,
  updateSection,
} from "@/lib/document-model/mutations";
import { createDocument } from "@/lib/document-model/templates";
import type {
  PressFlowDocument,
  PressFlowMode,
  PressFlowSection,
  PressFlowSectionKind,
} from "@/lib/document-model/types";
import { downloadStaticExport } from "@/lib/exporter/static-export";
import { LocalProjectsRepository } from "@/lib/projects/local-repository";
import { renderDocumentToHtml } from "@/lib/renderer/render-document";

const sectionKinds: PressFlowSectionKind[] = [
  "hero",
  "featureGrid",
  "testimonial",
  "cta",
  "longformText",
  "slide",
];

const modeOptions: PressFlowMode[] = ["presentation", "landing", "article"];
const repository = new LocalProjectsRepository();

function sectionTitle(section: PressFlowSection): string {
  if ("title" in section && section.title) {
    return section.title;
  }
  if (section.kind === "testimonial") {
    return section.author;
  }
  return section.kind;
}

export function EditorShell() {
  const [documentState, setDocumentState] = useState<PressFlowDocument>(() =>
    createDocument("landing"),
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [loadedProject, setLoadedProject] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (loadedProject) {
      return;
    }
    void repository.list().then((projects) => {
      if (!mounted) {
        return;
      }
      if (projects[0]) {
        setDocumentState(projects[0]);
        setSelectedSectionId(projects[0].sections[0]?.id ?? null);
      } else {
        const starter = createDocument("landing");
        setDocumentState(starter);
        setSelectedSectionId(starter.sections[0]?.id ?? null);
      }
      setLoadedProject(true);
    });
    return () => {
      mounted = false;
    };
  }, [loadedProject]);

  useEffect(() => {
    if (!loadedProject) {
      return;
    }
    void repository.upsert(documentState);
  }, [documentState, loadedProject]);

  const selectedSection = useMemo(
    () =>
      documentState.sections.find(
        (section) => section.id === selectedSectionId,
      ) ?? null,
    [documentState.sections, selectedSectionId],
  );

  function switchMode(mode: PressFlowMode) {
    const next = createDocument(mode);
    setDocumentState(next);
    setSelectedSectionId(next.sections[0]?.id ?? null);
  }

  function addSection(kind: PressFlowSectionKind) {
    const next = insertSection(documentState, kind);
    const latest = next.sections[next.sections.length - 1];
    setDocumentState(next);
    if (latest) {
      setSelectedSectionId(latest.id);
    }
  }

  function moveSelected(direction: "up" | "down") {
    if (!selectedSection) {
      return;
    }
    const from = documentState.sections.findIndex(
      (section) => section.id === selectedSection.id,
    );
    const to = direction === "up" ? from - 1 : from + 1;
    setDocumentState(reorderSection(documentState, from, to));
  }

  function updateSelectedTitle(title: string) {
    if (!selectedSection || !("title" in selectedSection)) {
      return;
    }
    setDocumentState(
      updateSection(documentState, selectedSection.id, { title }),
    );
  }

  function updateSelectedBody(body: string) {
    if (!selectedSection || !("body" in selectedSection)) {
      return;
    }
    setDocumentState(
      updateSection(documentState, selectedSection.id, { body }),
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-4 px-4 pb-6 lg:grid-cols-[290px_minmax(0,1fr)_360px]">
      <aside className="rounded-lg border bg-card p-3">
        <p className="text-sm font-semibold">Modes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {modeOptions.map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={documentState.mode === mode ? "default" : "outline"}
              onClick={() => switchMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold">Sections</p>
        <div className="mt-2 space-y-2">
          {documentState.sections.map((section) => (
            <button
              type="button"
              key={section.id}
              className={`w-full rounded-md border p-2 text-left text-sm ${
                section.id === selectedSectionId
                  ? "border-foreground bg-accent"
                  : "border-border"
              }`}
              onClick={() => setSelectedSectionId(section.id)}
            >
              <p className="font-medium">{section.kind}</p>
              <p className="text-muted-foreground">{sectionTitle(section)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border bg-card p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {sectionKinds.map((kind) => (
            <Button
              key={kind}
              size="sm"
              variant="outline"
              onClick={() => addSection(kind)}
            >
              Add {kind}
            </Button>
          ))}
          <Button size="sm" onClick={() => downloadStaticExport(documentState)}>
            Export HTML
          </Button>
        </div>
        <div className="rounded-md border bg-background p-3">
          <iframe
            title="PressFlow live preview"
            srcDoc={renderDocumentToHtml(documentState)}
            className="h-[70vh] w-full rounded border"
          />
        </div>
      </section>

      <aside className="rounded-lg border bg-card p-3">
        <p className="text-sm font-semibold">Properties</p>
        {!selectedSection ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Select a section to edit.
          </p>
        ) : (
          <div className="mt-2 space-y-3">
            {"title" in selectedSection ? (
              <label className="block text-sm">
                Title
                <input
                  className="mt-1 w-full rounded border bg-background px-2 py-1"
                  value={selectedSection.title ?? ""}
                  onChange={(event) => updateSelectedTitle(event.target.value)}
                />
              </label>
            ) : null}

            {"body" in selectedSection ? (
              <label className="block text-sm">
                Body
                <textarea
                  className="mt-1 min-h-28 w-full rounded border bg-background px-2 py-1"
                  value={selectedSection.body ?? ""}
                  onChange={(event) => updateSelectedBody(event.target.value)}
                />
              </label>
            ) : null}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveSelected("up")}
              >
                Move Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveSelected("down")}
              >
                Move Down
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
