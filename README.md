# PressFlow

PressFlow lets designers, marketers, and journalists craft beautiful HTML presentations, landing pages, and longform articles with zero friction. Just basic HTML &amp; CSS is required—PressFlow handles the layout, motion, and responsive polish under the hood.

---

## Tech Direction

PressFlow is built as a **Next.js + Tailwind + TypeScript builder app** with a local-first workflow and a cloud-ready architecture.

- **Builder app first:** visual editing workspace, not only static templates
- **Three output modes:** presentation, landing page, and longform article
- **Mixed editing model:** section insertion/reordering + section property panels
- **Live preview:** HTML rendering inside the editor
- **Static export:** downloadable production-friendly HTML output
- **Storage strategy:** local persistence now with cloud sync extension points

## Current Architecture

- `src/app/editor/page.tsx` - editor route and shell entrypoint
- `src/components/editor/editor-shell.tsx` - MVP editor UI and interactions
- `src/lib/document-model/*` - canonical document schema, templates, and mutations
- `src/lib/renderer/render-document.ts` - deterministic renderer to HTML
- `src/lib/exporter/static-export.ts` - static bundle artifact + download flow
- `src/lib/projects/*` - repository interfaces for local-first and future cloud sync

## Why Next.js Instead of Vanilla

Vanilla HTML/CSS/JS is possible for template prototypes, but PressFlow needs app-level concerns (editor state, navigation, persistence, future auth and sync). Next.js gives a scalable base without replatforming as the product grows.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
