import type { PressFlowDocument } from "@/lib/document-model/types";
import { renderDocumentToHtml } from "@/lib/renderer/render-document";

export interface StaticExportArtifact {
  fileName: string;
  mimeType: string;
  content: string;
}

export function buildStaticExport(
  document: PressFlowDocument,
): StaticExportArtifact[] {
  return [
    {
      fileName: "index.html",
      mimeType: "text/html;charset=utf-8",
      content: renderDocumentToHtml(document),
    },
  ];
}

export function downloadStaticExport(project: PressFlowDocument): void {
  const [artifact] = buildStaticExport(project);
  if (!artifact || typeof window === "undefined") {
    return;
  }
  const blob = new Blob([artifact.content], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.name.toLowerCase().replaceAll(/\s+/g, "-") || "pressflow"}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
