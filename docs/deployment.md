# Deployment Guide

## Local checklist

1. Run `pnpm install`
2. Run `pnpm dev`
3. Open the local URL printed by Next.js
4. Verify each tab loads a live widget:
   - `Njo`
   - `Wong`
   - `Norodovich`
5. Test direct routing if needed:
   - `/?client=njo`
   - `/?client=wong`
   - `/?client=norodovich`

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
5. Add the final preview and production domains to ElevenLabs allowlists
6. Re-test all three widgets after deployment

## Notes

- The app loads the official ElevenLabs widget script once from
  `app/layout.tsx`
- The UI is intentionally minimal so the test surface stays focused on the
  conversation widget itself
- If port `3000` is busy locally, Next.js will move to another port automatically
