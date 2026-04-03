# Deployment Guide

## Local checklist

1. Run `pnpm install`
2. Run `pnpm dev`
3. Open the local URL printed by Next.js
4. Verify the live widgets and pending tabs behave correctly:
   - `Dr. Njo`
   - `Dr. Wong`
   - `Dr. Narodovich`
   - `Dr. Chuang`
   - `Dr. Aguil`
   - `Dr. Ji`
   - `Dr. Anderson`
   - `Dr. Banaga`
   - `Dr. Chun` shows the no-agent placeholder until its ID is added
5. Test direct routing if needed:
   - `/?client=njo`
   - `/?client=wong`
   - `/?client=norodovich`
   - `/?client=chuang`
   - `/?client=aguil`
   - `/?client=ji`
   - `/?client=anderson`
   - `/?client=banaga`
   - `/?client=chun`
6. Check the responsive shell:
   - the ASCII fire banner is visible at the top
   - desktop shows the full left navigation rail
   - desktop keeps the `What to test` panel in the left rail, not the widget canvas
   - mobile shows both the compact client selector and the `Checklist` control
   - opening the mobile checklist does not cover or clip the widget by default
   - changing agents on mobile updates the URL and closes the selector
   - the main panel stays widget-only across breakpoints

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
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUANG=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_AGUIL=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_JI=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_ANDERSON=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_BANAGA=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_CHUN=
```

Use them if staging, preview, or production should point to different agents.

## Vercel checklist

1. Import the repo into Vercel
2. Confirm framework preset is `Next.js`
3. Add any `NEXT_PUBLIC_ELEVENLABS_AGENT_ID_*` overrides if needed
4. Deploy
5. Visit the live site once after deployment so Vercel Web Analytics can begin collecting page views
6. Add the final preview and production domains to ElevenLabs allowlists
7. Re-test all eight live widgets after deployment

## Notes

- The app loads the official ElevenLabs widget script once from
  `app/layout.tsx`
- Vercel Web Analytics is mounted once from `app/layout.tsx` via
  `@vercel/analytics/next`
- The UI is intentionally minimal so the test surface stays focused on the
  conversation widget itself
- Desktop guidance lives in the left rail to avoid widget overlap
- Mobile guidance is intentionally on-demand through the `Checklist` popover
- The selected client must continue to hydrate correctly from `?client=...`
- If port `3000` is busy locally, Next.js will move to another port automatically
