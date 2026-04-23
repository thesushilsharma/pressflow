import type { PressFlowDocument } from "@/lib/document-model/types";
import type { ProjectsRepository } from "@/lib/projects/repository";

const STORAGE_KEY = "pressflow.projects.v1";

function readState(): PressFlowDocument[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as PressFlowDocument[];
  } catch {
    return [];
  }
}

function writeState(projects: PressFlowDocument[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export class LocalProjectsRepository implements ProjectsRepository {
  async list(): Promise<PressFlowDocument[]> {
    return readState();
  }

  async get(projectId: string): Promise<PressFlowDocument | null> {
    return readState().find((project) => project.id === projectId) ?? null;
  }

  async upsert(project: PressFlowDocument): Promise<void> {
    const existing = readState();
    const next = [
      ...existing.filter((item) => item.id !== project.id),
      project,
    ];
    writeState(next);
  }

  async remove(projectId: string): Promise<void> {
    const next = readState().filter((project) => project.id !== projectId);
    writeState(next);
  }
}
