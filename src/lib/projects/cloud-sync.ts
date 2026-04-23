import type { PressFlowDocument } from "@/lib/document-model/types";
import type { CloudSyncPort } from "@/lib/projects/repository";

export class NoopCloudSync implements CloudSyncPort {
  async push(_project: PressFlowDocument): Promise<void> {
    return Promise.resolve();
  }

  async pullAll(): Promise<PressFlowDocument[]> {
    return Promise.resolve([]);
  }
}
