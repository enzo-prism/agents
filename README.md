# Agent Playground

Ultra-minimal internal QA app for live-testing multiple client ElevenLabs
agents from one place.

The app uses a split layout on desktop, a compact selected-agent control on
mobile, a persistent ASCII fire banner at the top, and an expanded ElevenLabs
widget per client so you can switch fast between live voice agents during
review.

## Current clients

- `Dr. Njo` - `https://michaelnjodds.com`
- `Dr. Wong` - `https://chriswongdds.com`
- `Dr. Narodovich` - `https://sacramentodentalmedicine.com`
- `Dr. Chuang` - `https://famfirstsmile.com`
- `Dr. Aguil` - `https://exquisitedentistryla.com`

## What it does

- Keeps all active client agents in one test surface
- Uses a left rail on desktop and a compact mobile selector on smaller screens
- Keeps the ASCII fire banner visible at the top of the app
- Opens each client in its own tab state
- Shows client-specific “what to test” prompts in the left rail on desktop
- Shows those prompts behind a compact `Checklist` control on mobile
- Embeds the official ElevenLabs widget for each agent
- Supports direct links like `?client=wong`
- Ships with live fallback agent IDs and optional env overrides

## Stack

- `Next.js 16` App Router
- `React 19`
- `Tailwind CSS v4`
- `shadcn`-style primitives with `@base-ui/react`
- `Inter` typography with Apple system fallbacks
- `lucide-react` icons
- ElevenLabs `convai-widget-embed`
- Vercel Web Analytics

## Local development

1. Install dependencies:

```bash
pnpm install
```

2. Optionally create local overrides:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
pnpm dev
```

If port `3000` is already in use, Next.js will automatically move to the next
available port.

## Agent configuration

The app works out of the box because all five current clients have built-in
fallback agent IDs in code.

If you want different agents per environment, set any of these in
`.env.local` or Vercel project settings:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO=your_agent_id
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG=your_agent_id
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH=your_agent_id
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG=your_agent_id
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_AGUIL=your_agent_id
```

Environment values override the built-in defaults.

## URL behavior

- Default route opens the first client tab
- `?client=njo` opens Dr. Njo
- `?client=wong` opens Dr. Wong
- `?client=norodovich` opens Dr. Narodovich
- `?client=chuang` opens Dr. Chuang
- `?client=aguil` opens Dr. Aguil

This makes it easy to bookmark or share a specific test surface.

## ElevenLabs requirements

The current official widget docs require the following for a working embed:

- the agent must be public
- widget auth must be disabled
- local and production domains must be allowlisted

Reference:
[ElevenLabs widget customization docs](https://elevenlabs.io/docs/eleven-agents/customization/widget)

## Project structure

```text
app/
  layout.tsx                # global layout + ElevenLabs script
  page.tsx                  # app entry
components/
  ASCIIAnimation.tsx        # staged ASCII Gen animation player
  agent-capabilities.tsx    # desktop rail + mobile popover checklist surfaces
  agent-playground.tsx      # shell, routing, desktop rail, and mobile controls
  ascii-fire-banner.tsx     # persistent top fire banner
  elevenlabs-widget.tsx     # official widget embed wrapper
  ui/popover.tsx            # compact mobile client selector
lib/
  client-agents.ts          # client config, websites, colors, env keys, agent IDs
```

## Deploying to Vercel

This app is ready for a standard Vercel deployment.

Before deploying:

1. Add the `NEXT_PUBLIC_ELEVENLABS_AGENT_ID_*` variables if you want
   environment-specific agents.
2. Add your Vercel domain to the ElevenLabs allowlist for each live agent.
3. Confirm each agent is public and widget auth is disabled.
4. Vercel Web Analytics is already wired in through `app/layout.tsx`.
5. Smoke-test both desktop and mobile layouts after deployment.

See the operational checklist in
[docs/deployment.md](/Users/enzo/agent-playground/docs/deployment.md).

For future UI work and Codex context, see
[docs/codex-handoff.md](/Users/enzo/agent-playground/docs/codex-handoff.md).

## Scripts

- `pnpm dev` — start local dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint
