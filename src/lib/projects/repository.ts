import type { PressFlowDocument } from "@/lib/document-model/types";

export interface ProjectsRepository {
  list(): Promise<PressFlowDocument[]>;
  get(projectId: string): Promise<PressFlowDocument | null>;
  upsert(project: PressFlowDocument): Promise<void>;
  remove(projectId: string): Promise<void>;
}

export interface CloudSyncPort {
  push(project: PressFlowDocument): Promise<void>;
  pullAll(): Promise<PressFlowDocument[]>;
}
