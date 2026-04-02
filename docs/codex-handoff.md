# Codex Handoff

## Product summary

Agent Playground is an internal Next.js app for live-testing multiple client
ElevenLabs agents from one place. It is not a marketing site. It is a focused
QA tool, so every layout decision should prioritize fast switching, clear
testing prompts, and an uncluttered widget experience.

## Design principles

- The UI should feel ultra minimal, modern, and calm.
- The ElevenLabs widget is the hero and primary interaction surface.
- Supporting content should guide testing, not compete with the widget.
- Copy should be short.
- Repeated labels are usually a bug, not a feature.

## Current architecture

### Desktop

- The left rail contains:
  - the agent list
  - the active client checklist
- The main panel contains only the widget wrapper.

This is intentional. Earlier versions placed the checklist in the main panel
and the widget expanded over it.

### Mobile

- The top utility row contains:
  - `Checklist`
  - the client selector
- The checklist opens on demand in a popover.
- The widget remains the only persistent content in the main panel.

This is intentional. Earlier versions kept guidance visible above the widget,
which caused collisions and visual crowding in narrow viewports.

## Known failure modes

### 1. Widget overlap

Problem:
- Any persistent content placed in the widget canvas can be covered by the
  expanding ElevenLabs widget.

Do not:
- place the checklist above the widget in the main panel
- place the checklist as a right-side floating panel near the widget

Do:
- keep the widget alone in the main content area
- keep guidance in the desktop rail and a mobile popover

### 2. Hydration mismatch

Problem:
- The server rendered one client while the client immediately switched to
  another based on `window.location`, causing hydration errors.

Do not:
- derive initial selected client from `window`, `location`, or client-only
  effects during first render

Do:
- resolve `?client=` in `app/page.tsx`
- pass `initialClient` into `AgentPlayground`
- treat the URL as the source of truth

### 3. Repeated naming

Problem:
- The selected client name used to appear in too many places and cluttered the
  layout.

Do not:
- add large repeated titles in the main panel unless there is a strong reason

Do:
- let the selector/sidebar communicate the active client

## Source of truth

- `lib/client-agents.ts`
  - client list
  - built-in fallback agent IDs
  - per-client accent colors
  - per-client checklist content

- `components/agent-playground.tsx`
  - responsive layout architecture
  - mobile controls
  - desktop rail behavior

- `components/agent-capabilities.tsx`
  - checklist rendering
  - `rail` variant for desktop
  - `popover` variant for mobile

- `components/elevenlabs-widget.tsx`
  - widget wrapper and sizing

## How to update or add a client

1. Add the new client to `lib/client-agents.ts`
2. Give it realistic checklist prompts tied to real business goals
3. If needed, add its env override to `.env.example`
4. Verify:
   - direct URL routing works
   - mobile selector still behaves cleanly
   - checklist content fits in both desktop and mobile surfaces

## Success criteria for layout changes

A layout change is only complete when all of these are true:

- The widget has exclusive ownership of the main canvas
- No checklist content is hidden behind the widget
- Desktop rail remains readable without taking too much width from the widget
- Mobile controls are discoverable and compact
- The active client can be changed without hydration issues
- The interface still feels minimal after the change

## Suggested QA workflow

### Code checks

```bash
pnpm lint
pnpm build
```

### Visual checks

Check at least:

- desktop width around `1280px`
- mobile width around `390px`

Verify:

- the widget is visible and usable
- the checklist is visible on desktop
- the checklist opens from the mobile control
- no content overlaps the widget
- changing clients updates `?client=...`

### Local test routes

- `/?client=njo`
- `/?client=wong`
- `/?client=norodovich`
- `/?client=chuang`

## ElevenLabs notes

- The app uses the official widget script loaded once from `app/layout.tsx`
- Agents must be public
- Widget auth must be disabled
- Local and production domains must be allowlisted

Reference:
[ElevenLabs widget customization docs](https://elevenlabs.io/docs/eleven-agents/customization/widget)
