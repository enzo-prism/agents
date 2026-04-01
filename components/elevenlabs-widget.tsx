"use client";

import { ArrowUpRight, CircleDashed, Sparkles } from "lucide-react";

import type { ClientAgent } from "@/lib/client-agents";

type ElevenLabsWidgetProps = {
  client: ClientAgent;
};

export function ElevenLabsWidget({ client }: ElevenLabsWidgetProps) {
  if (!client.agentId) {
    return (
      <div className="flex h-full min-h-[560px] flex-col justify-between rounded-[28px] border border-dashed border-border/80 bg-white/70 p-6 text-sm text-muted-foreground">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/70">
            <CircleDashed className="size-3.5" />
            No Agent
          </div>
          <h3 className="max-w-xl text-pretty text-2xl font-medium tracking-tight text-foreground">
            Add an agent ID to enable this tab.
          </h3>
          <p className="max-w-lg leading-7">
            Set <span className="font-mono text-foreground">{client.envKey}</span>{" "}
            in <span className="font-mono text-foreground">.env.local</span> or
            Vercel.
          </p>
        </div>

        <div className="space-y-4 rounded-[24px] border border-border/70 bg-background/80 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="size-4" />
            Widget rules
          </div>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            <li>Public agent.</li>
            <li>Widget auth off.</li>
            <li>Allowlist local + prod domains.</li>
          </ul>
          <a
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
            href="https://elevenlabs.io/docs/eleven-agents/customization/widget"
            target="_blank"
            rel="noreferrer"
          >
            Docs
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-black/[0.06] bg-white/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.3)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/80 to-transparent" />
      <elevenlabs-convai
        key={`${client.slug}-${client.agentId}`}
        agent-id={client.agentId}
        variant="expanded"
        dismissible="false"
        avatar-orb-color-1={client.orbColors[0]}
        avatar-orb-color-2={client.orbColors[1]}
        action-text={`Test ${client.name}`}
        start-call-text={`Start ${client.name} session`}
        expand-text={`Open ${client.name}`}
        className="block h-[240px] w-full sm:h-[clamp(500px,calc(100svh-17rem),560px)]"
      />
    </div>
  );
}
