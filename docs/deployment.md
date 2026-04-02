# Deployment Guide

## Local checklist

1. Run `pnpm install`
2. Run `pnpm dev`
3. Open the local URL printed by Next.js
4. Verify each tab loads a live widget:
   - `Dr. Njo`
   - `Dr. Wong`
   - `Dr. Narodovich`
5. Test direct routing if needed:
   - `/?client=njo`
   - `/?client=wong`
   - `/?client=norodovich`
6. Check the responsive shell:
   - desktop shows the full left navigation rail
   - mobile shows the compact selected-agent control
   - changing agents on mobile updates the URL and closes the selector

## ElevenLabs checklist

For each client agent:

- the agent is public
- widget auth is disabled
- local development domains are allowlisted
- production Vercel domains are allowlisted

Official reference:
[ElevenLabs widget customization docs](https://elevenlabs.io/docs/eleven-agents/customization/widget)

## Environment overrides

These are optional because the app already includes live fallback IDs:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NJO=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_WONG=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NORODOVICH=
```

Use them if staging, preview, or production should point to different agents.

## Vercel checklist

1. Import the repo into Vercel
2. Confirm framework preset is `Next.js`
3. Add any `NEXT_PUBLIC_ELEVENLABS_AGENT_ID_*` overrides if needed
4. Deploy
5. Visit the live site once after deployment so Vercel Web Analytics can begin collecting page views
6. Add the final preview and production domains to ElevenLabs allowlists
7. Re-test all three widgets after deployment

## Notes

- The app loads the official ElevenLabs widget script once from
  `app/layout.tsx`
- Vercel Web Analytics is mounted once from `app/layout.tsx` via
  `@vercel/analytics/next`
- The UI is intentionally minimal so the test surface stays focused on the
  conversation widget itself
- Mobile navigation is handled through a compact popover selector instead of a
  persistent sidebar
- If port `3000` is busy locally, Next.js will move to another port automatically
