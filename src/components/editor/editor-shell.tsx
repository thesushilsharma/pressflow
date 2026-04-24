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
  CtaSection,
  FeatureGridSection,
  HeroSection,
  LongformTextSection,
  PressFlowDocument,
  PressFlowMode,
  PressFlowSection,
  PressFlowSectionKind,
  SlideSection,
  TestimonialSection,
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

function cloneDocument(source: PressFlowDocument): PressFlowDocument {
  const timestamp = new Date().toISOString();
  return {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} Copy`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function sectionTitle(section: PressFlowSection): string {
  if ("title" in section && section.title) {
    return section.title;
  }
  if (section.kind === "testimonial") {
    return section.author;
  }
  return section.kind;
}

function isLikelyUrl(value: string): boolean {
  if (!value || value === "#") {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function EditorShell() {
  const [documentState, setDocumentState] = useState<PressFlowDocument>(() =>
    createDocument("landing"),
  );
  const [projects, setProjects] = useState<PressFlowDocument[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [loadedProject, setLoadedProject] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");

  async function reloadProjects(activeId?: string) {
    const all = await repository.list();
    const sorted = [...all].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    setProjects(sorted);
    const fallback = sorted[0];
    if (!fallback || !activeId) {
      return;
    }
    if (!sorted.find((item) => item.id === activeId)) {
      setDocumentState(fallback);
      setSelectedSectionId(fallback.sections[0]?.id ?? null);
      setSavedSnapshot(JSON.stringify(fallback));
      setLastSavedAt(fallback.updatedAt);
    }
  }

  useEffect(() => {
    let mounted = true;
    if (loadedProject) {
      return;
    }
    void repository.list().then((allProjects) => {
      if (!mounted) {
        return;
      }
      if (allProjects[0]) {
        setProjects(allProjects);
        setDocumentState(allProjects[0]);
        setSelectedSectionId(allProjects[0].sections[0]?.id ?? null);
        setSavedSnapshot(JSON.stringify(allProjects[0]));
        setLastSavedAt(allProjects[0].updatedAt);
        setLoadedProject(true);
        return;
      }

      const starter = createDocument("landing");
      void repository.upsert(starter).then(() => {
        if (!mounted) {
          return;
        }
        setProjects([starter]);
        setDocumentState(starter);
        setSelectedSectionId(starter.sections[0]?.id ?? null);
        setSavedSnapshot(JSON.stringify(starter));
        setLastSavedAt(starter.updatedAt);
        setLoadedProject(true);
      });
    });
    return () => {
      mounted = false;
    };
  }, [loadedProject]);

  const selectedSection = useMemo(
    () =>
      documentState.sections.find(
        (section) => section.id === selectedSectionId,
      ) ?? null,
    [documentState.sections, selectedSectionId],
  );

  const isDirty = useMemo(() => {
    if (!loadedProject) {
      return false;
    }
    return JSON.stringify(documentState) !== savedSnapshot;
  }, [documentState, loadedProject, savedSnapshot]);

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

  function updateSelected(patch: Partial<PressFlowSection>) {
    if (!selectedSection) {
      return;
    }
    setDocumentState(updateSection(documentState, selectedSection.id, patch));
  }

  async function saveCurrent() {
    const next = { ...documentState, updatedAt: new Date().toISOString() };
    await repository.upsert(next);
    setDocumentState(next);
    setSavedSnapshot(JSON.stringify(next));
    setLastSavedAt(next.updatedAt);
    await reloadProjects(next.id);
  }

  async function saveAsNew() {
    const copy = cloneDocument(documentState);
    await repository.upsert(copy);
    setDocumentState(copy);
    setSelectedSectionId(copy.sections[0]?.id ?? null);
    setSavedSnapshot(JSON.stringify(copy));
    setLastSavedAt(copy.updatedAt);
    await reloadProjects(copy.id);
  }

  async function createProject(mode: PressFlowMode) {
    const next = createDocument(mode);
    await repository.upsert(next);
    setDocumentState(next);
    setSelectedSectionId(next.sections[0]?.id ?? null);
    setSavedSnapshot(JSON.stringify(next));
    setLastSavedAt(next.updatedAt);
    await reloadProjects(next.id);
  }

  function switchProject(project: PressFlowDocument) {
    if (
      isDirty &&
      !window.confirm("You have unsaved changes. Discard and switch project?")
    ) {
      return;
    }
    setDocumentState(project);
    setSelectedSectionId(project.sections[0]?.id ?? null);
    setSavedSnapshot(JSON.stringify(project));
    setLastSavedAt(project.updatedAt);
  }

  async function renameProject() {
    const name = window.prompt("New project name", documentState.name)?.trim();
    if (!name) {
      return;
    }
    const next = {
      ...documentState,
      name,
      updatedAt: new Date().toISOString(),
    };
    setDocumentState(next);
    await repository.upsert(next);
    setSavedSnapshot(JSON.stringify(next));
    setLastSavedAt(next.updatedAt);
    await reloadProjects(next.id);
  }

  async function duplicateProject() {
    const copy = cloneDocument(documentState);
    await repository.upsert(copy);
    await reloadProjects(documentState.id);
  }

  async function deleteCurrentProject() {
    if (!window.confirm(`Delete "${documentState.name}"?`)) {
      return;
    }
    await repository.remove(documentState.id);
    const allProjects = await repository.list();
    if (allProjects[0]) {
      setProjects(allProjects);
      setDocumentState(allProjects[0]);
      setSelectedSectionId(allProjects[0].sections[0]?.id ?? null);
      setSavedSnapshot(JSON.stringify(allProjects[0]));
      setLastSavedAt(allProjects[0].updatedAt);
      return;
    }
    const starter = createDocument("landing");
    await repository.upsert(starter);
    setProjects([starter]);
    setDocumentState(starter);
    setSelectedSectionId(starter.sections[0]?.id ?? null);
    setSavedSnapshot(JSON.stringify(starter));
    setLastSavedAt(starter.updatedAt);
  }

  const ctaUrlInvalid =
    selectedSection?.kind === "cta" && !isLikelyUrl(selectedSection.buttonHref);
  const imageUrlInvalid =
    selectedSection?.kind === "hero" &&
    Boolean(selectedSection.imageUrl) &&
    !isLikelyUrl(selectedSection.imageUrl);

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-4 px-4 pb-6 lg:grid-cols-[290px_minmax(0,1fr)_360px]">
      <aside className="rounded-lg border bg-card p-3">
        <p className="text-sm font-semibold">Projects</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isDirty ? "Unsaved changes" : "All changes saved"}
          {lastSavedAt
            ? ` · ${new Date(lastSavedAt).toLocaleTimeString()}`
            : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => createProject("landing")}
          >
            New Landing
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createProject("presentation")}
          >
            New Deck
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createProject("article")}
          >
            New Article
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={saveCurrent} disabled={!isDirty}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={saveAsNew}>
            Save As
          </Button>
          <Button size="sm" variant="outline" onClick={renameProject}>
            Rename
          </Button>
          <Button size="sm" variant="outline" onClick={duplicateProject}>
            Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={deleteCurrentProject}>
            Delete
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => switchProject(project)}
              className={`w-full rounded-md border p-2 text-left text-sm ${
                project.id === documentState.id
                  ? "border-foreground bg-accent"
                  : "border-border"
              }`}
            >
              <p className="font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.mode}</p>
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm font-semibold">Modes</p>
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
                  onChange={(event) =>
                    updateSelected({ title: event.target.value })
                  }
                />
              </label>
            ) : null}

            {"body" in selectedSection ? (
              <label className="block text-sm">
                Body
                <textarea
                  className="mt-1 min-h-28 w-full rounded border bg-background px-2 py-1"
                  value={selectedSection.body ?? ""}
                  onChange={(event) =>
                    updateSelected({ body: event.target.value })
                  }
                />
              </label>
            ) : null}

            {selectedSection.kind === "hero" ? (
              <>
                <label className="block text-sm">
                  Eyebrow
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as HeroSection).eyebrow ?? ""}
                    onChange={(event) =>
                      updateSelected({ eyebrow: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Alignment
                  <select
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as HeroSection).alignment ?? "left"}
                    onChange={(event) =>
                      updateSelected({
                        alignment: event.target
                          .value as HeroSection["alignment"],
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Image URL
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as HeroSection).imageUrl ?? ""}
                    onChange={(event) =>
                      updateSelected({ imageUrl: event.target.value })
                    }
                  />
                </label>
                {imageUrlInvalid ? (
                  <p className="text-xs text-destructive">
                    Image URL must start with http:// or https://
                  </p>
                ) : null}
                <label className="block text-sm">
                  Image Alt
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as HeroSection).imageAlt ?? ""}
                    onChange={(event) =>
                      updateSelected({ imageAlt: event.target.value })
                    }
                  />
                </label>
              </>
            ) : null}

            {selectedSection.kind === "featureGrid" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Feature Cards</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const current = selectedSection as FeatureGridSection;
                      updateSelected({
                        features: [
                          ...current.features,
                          {
                            id: crypto.randomUUID(),
                            title: "New feature",
                            description: "Describe this feature.",
                          },
                        ],
                      });
                    }}
                  >
                    Add Card
                  </Button>
                </div>
                {(selectedSection as FeatureGridSection).features.map(
                  (feature, index, all) => (
                    <div key={feature.id} className="rounded border p-2">
                      <label className="block text-xs">
                        Card Title
                        <input
                          className="mt-1 w-full rounded border bg-background px-2 py-1"
                          value={feature.title}
                          onChange={(event) => {
                            const current =
                              selectedSection as FeatureGridSection;
                            updateSelected({
                              features: current.features.map((item) =>
                                item.id === feature.id
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            });
                          }}
                        />
                      </label>
                      <label className="mt-2 block text-xs">
                        Description
                        <textarea
                          className="mt-1 min-h-20 w-full rounded border bg-background px-2 py-1"
                          value={feature.description}
                          onChange={(event) => {
                            const current =
                              selectedSection as FeatureGridSection;
                            updateSelected({
                              features: current.features.map((item) =>
                                item.id === feature.id
                                  ? { ...item, description: event.target.value }
                                  : item,
                              ),
                            });
                          }}
                        />
                      </label>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index === 0) {
                              return;
                            }
                            const current =
                              selectedSection as FeatureGridSection;
                            const next = [...current.features];
                            const [moved] = next.splice(index, 1);
                            if (!moved) {
                              return;
                            }
                            next.splice(index - 1, 0, moved);
                            updateSelected({ features: next });
                          }}
                        >
                          Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (index === all.length - 1) {
                              return;
                            }
                            const current =
                              selectedSection as FeatureGridSection;
                            const next = [...current.features];
                            const [moved] = next.splice(index, 1);
                            if (!moved) {
                              return;
                            }
                            next.splice(index + 1, 0, moved);
                            updateSelected({ features: next });
                          }}
                        >
                          Down
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={all.length <= 1}
                          onClick={() => {
                            const current =
                              selectedSection as FeatureGridSection;
                            updateSelected({
                              features: current.features.filter(
                                (item) => item.id !== feature.id,
                              ),
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : null}

            {selectedSection.kind === "cta" ? (
              <>
                <label className="block text-sm">
                  Button Label
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as CtaSection).buttonLabel}
                    onChange={(event) =>
                      updateSelected({ buttonLabel: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Button Link
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as CtaSection).buttonHref}
                    onChange={(event) =>
                      updateSelected({ buttonHref: event.target.value })
                    }
                  />
                </label>
                {ctaUrlInvalid ? (
                  <p className="text-xs text-destructive">
                    Button URL must start with http:// or https://
                  </p>
                ) : null}
                <label className="block text-sm">
                  Button Variant
                  <select
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={
                      (selectedSection as CtaSection).buttonVariant ?? "solid"
                    }
                    onChange={(event) =>
                      updateSelected({
                        buttonVariant: event.target
                          .value as CtaSection["buttonVariant"],
                      })
                    }
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </label>
              </>
            ) : null}

            {selectedSection.kind === "testimonial" ? (
              <>
                <label className="block text-sm">
                  Quote
                  <textarea
                    className="mt-1 min-h-24 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as TestimonialSection).quote}
                    onChange={(event) =>
                      updateSelected({ quote: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Author
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as TestimonialSection).author}
                    onChange={(event) =>
                      updateSelected({ author: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Role
                  <input
                    className="mt-1 w-full rounded border bg-background px-2 py-1"
                    value={(selectedSection as TestimonialSection).role ?? ""}
                    onChange={(event) =>
                      updateSelected({ role: event.target.value })
                    }
                  />
                </label>
              </>
            ) : null}

            {selectedSection.kind === "longformText" ? (
              <label className="block text-sm">
                Markdown Body
                <textarea
                  className="mt-1 min-h-32 w-full rounded border bg-background px-2 py-1"
                  value={(selectedSection as LongformTextSection).markdown}
                  onChange={(event) =>
                    updateSelected({ markdown: event.target.value })
                  }
                />
              </label>
            ) : null}

            {selectedSection.kind === "slide" ? (
              <label className="block text-sm">
                Presenter Notes
                <textarea
                  className="mt-1 min-h-24 w-full rounded border bg-background px-2 py-1"
                  value={(selectedSection as SlideSection).notes ?? ""}
                  onChange={(event) =>
                    updateSelected({ notes: event.target.value })
                  }
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
