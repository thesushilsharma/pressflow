import { EditorShell } from "@/components/editor/editor-shell";

export default function EditorPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 py-4">
      <div className="px-4">
        <h1 className="text-2xl font-semibold">PressFlow Editor</h1>
        <p className="text-sm text-muted-foreground">
          Build presentation decks, landing pages, and longform articles from
          one workspace.
        </p>
      </div>
      <EditorShell />
    </main>
  );
}
