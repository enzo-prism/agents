<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Playground Notes

## Product intent

- This is an internal QA surface for live-testing multiple ElevenLabs agents.
- The app should feel ultra minimal, calm, and premium.
- The ElevenLabs widget is the primary interaction surface. Everything else should support it.

## Non-negotiable UI rules

- Do not place persistent UI inside the widget expansion path.
- The main content canvas should be widget-only.
- On desktop, supporting QA guidance belongs in the left rail.
- On mobile, supporting QA guidance belongs behind an on-demand control, not as a persistent block above the widget.
- Avoid repeating the selected client name in multiple places. The selector/sidebar is enough.
- Keep copy short and utilitarian.

## Routing and state rules

- The selected client is URL-driven through `?client=<slug>`.
- `app/page.tsx` resolves the initial client on the server and passes it into the client shell.
- Do not reintroduce first-render client selection from `window`, `location`, or other client-only state. That previously caused hydration mismatches.

## Core files

- `app/page.tsx`: server-side initial client resolution from search params
- `components/agent-playground.tsx`: shell layout, tabs, mobile controls, and responsive architecture
- `components/agent-capabilities.tsx`: per-client QA guidance surfaces
- `components/elevenlabs-widget.tsx`: official widget wrapper
- `components/ascii-fire-banner.tsx`: sticky ASCII fire banner
- `lib/client-agents.ts`: client registry, website URLs, colors, agent IDs, and checklist content

## Client data model

- Add or update clients in `lib/client-agents.ts`.
- Each client should define:
  - `slug`
  - `name`
  - `websiteUrl`
  - `envKey`
  - `agentId`
  - `accent`
  - `accentSoft`
  - `orbColors`
  - `capabilities`
- Keep capability titles short and descriptions concise.
- Capability content should reflect the real business goals of that client, not a generic medical template.

## Verification expectations

- Run `pnpm lint`
- Run `pnpm build`
- Verify desktop and mobile visually before calling layout work done
- Check these conditions explicitly:
  - the widget does not overlap or cover checklist content
  - the checklist does not push the widget into awkward cropped states
  - mobile controls open and close cleanly
  - changing clients updates the URL correctly
  - direct URLs like `/?client=chuang` hydrate correctly on first load

## Extra context

- ElevenLabs widgets can expand unpredictably, so layout decisions must assume the widget needs exclusive space.
- The ASCII banner should stay visually secondary to the widget and should not crowd the shell.
- See `docs/codex-handoff.md` for deeper architecture, failure modes, and QA criteria.
