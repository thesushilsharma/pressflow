import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-5">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          PressFlow Builder
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Create presentations, landing pages, and longform stories from one
          editor.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          PressFlow gives designers, marketers, and journalists a mixed editing
          workflow with responsive preview and static export.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/editor">Open Editor</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="https://nextjs.org">Built on Next.js</a>
        </Button>
      </div>
    </main>
  );
}
