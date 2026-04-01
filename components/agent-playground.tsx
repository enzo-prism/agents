"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Headphones, Mic2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElevenLabsWidget } from "@/components/elevenlabs-widget";
import type { ClientAgent } from "@/lib/client-agents";
import { cn } from "@/lib/utils";

type AgentPlaygroundProps = {
  clients: readonly ClientAgent[];
};

const baseSurface =
  "rounded-[32px] border border-black/[0.08] bg-white/[0.68] backdrop-blur-xl";

export function AgentPlayground({ clients }: AgentPlaygroundProps) {
  const [activeValue, setActiveValue] = useState<string>(() => {
    const defaultClient = clients[0]?.slug ?? "njo";

    if (typeof window === "undefined") {
      return defaultClient;
    }

    const requestedClient = new URLSearchParams(window.location.search).get(
      "client",
    );

    return clients.some((client) => client.slug === requestedClient)
      ? requestedClient!
      : defaultClient;
  });

  const activeClient =
    clients.find((client) => client.slug === activeValue) ?? clients[0];
  const configuredCount = clients.filter((client) => Boolean(client.agentId)).length;

  const handleValueChange = (value: string) => {
    setActiveValue(value);

    const params = new URLSearchParams(window.location.search);

    if (value === clients[0]?.slug) {
      params.delete("client");
    } else {
      params.set("client", value);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  };

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute left-[-8rem] top-[-10rem] size-[24rem] rounded-full blur-3xl"
        style={{ background: activeClient.accentSoft }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(245,244,239,0.68))]"
      />

      <main className="relative mx-auto flex min-h-svh w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Tabs
          value={activeClient.slug}
          onValueChange={handleValueChange}
          orientation="vertical"
          className="grid flex-1 gap-4 lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-6"
        >
          <aside
            className={cn(
              baseSurface,
              "flex flex-col gap-8 px-4 py-5 sm:px-5 sm:py-6 lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:overflow-hidden",
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                  Playground
                </div>
                <div className="rounded-full border border-black/[0.08] bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
                  {configuredCount} live
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-[10ch] text-pretty text-[2rem] font-medium tracking-tight text-foreground sm:text-[2.35rem]">
                  Agent QA
                </h1>
                <p className="max-w-[22rem] text-sm leading-7 text-muted-foreground">
                  Switch. Test. Move on.
                </p>
              </div>
            </div>

            <TabsList
              variant="line"
              className="grid w-full gap-2 bg-transparent p-0"
            >
              {clients.map((client, index) => {
                const ready = Boolean(client.agentId);

                return (
                  <TabsTrigger
                    key={client.slug}
                    value={client.slug}
                    className={cn(
                      "group h-auto rounded-[24px] border border-transparent px-0 py-0 text-left text-foreground/80 transition duration-300 after:hidden",
                      "hover:border-black/[0.08] hover:bg-white/80 hover:text-foreground",
                      "data-active:border-black/10 data-active:bg-white data-active:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)]",
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-4 px-4 py-4">
                      <div className="space-y-2">
                        <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground transition-colors group-data-active:text-foreground/70">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="text-lg font-medium tracking-tight text-foreground">
                          {client.name}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                          ready
                            ? "bg-[color:var(--client-accent-soft)] text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                        style={
                          {
                            "--client-accent-soft": client.accentSoft,
                          } as CSSProperties
                        }
                      >
                        {ready ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Mic2 className="size-3.5" />
                        )}
                        {ready ? "Ready" : "Pending"}
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="space-y-3 border-t border-black/[0.06] pt-5 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Local + Vercel</div>
            </div>
          </aside>

          {clients.map((client) => {
            const panelStyle = {
              "--client-accent": client.accent,
              "--client-accent-soft": client.accentSoft,
            } as CSSProperties;

            const ready = Boolean(client.agentId);

            return (
              <TabsContent
                key={client.slug}
                value={client.slug}
                className="mt-0 flex outline-none"
              >
                <section
                  style={panelStyle}
                  className={cn(
                    baseSurface,
                    "animate-in fade-in-0 slide-in-from-bottom-3 flex min-h-[calc(100svh-2rem)] flex-1 flex-col px-5 py-5 duration-500 sm:min-h-[calc(100svh-3rem)] sm:px-6 sm:py-6 lg:px-8 lg:py-8",
                  )}
                >
                  <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_320px] xl:gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                          Live
                        </div>
                        <h2 className="max-w-[8ch] text-pretty text-[2.2rem] font-medium tracking-tight text-foreground sm:text-[3rem]">
                          {client.name}
                        </h2>
                        <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                          {client.summary}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[20px] border border-black/[0.06] bg-background/[0.72] px-4 py-4">
                          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            View
                          </div>
                          <div className="mt-2 text-sm font-medium text-foreground">
                            Expanded
                          </div>
                        </div>
                        <div className="rounded-[20px] border border-black/[0.06] bg-background/[0.72] px-4 py-4">
                          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            State
                          </div>
                          <div className="mt-2 text-sm font-medium text-foreground">
                            {ready ? "Ready" : "Pending"}
                          </div>
                        </div>
                        <div className="rounded-[20px] border border-black/[0.06] bg-background/[0.72] px-4 py-4">
                          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            Key
                          </div>
                          <div className="mt-2 truncate text-sm font-medium text-foreground">
                            {client.envKey}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/[0.06] pt-6 xl:border-t-0 xl:border-l xl:pl-8">
                      <div className="space-y-6 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                            Notes
                          </div>
                          <p className="leading-7">Live widget test surface.</p>
                        </div>

                        <a
                          className="inline-flex items-center gap-2 font-medium text-foreground transition-opacity hover:opacity-70"
                          href="https://elevenlabs.io/docs/eleven-agents/customization/widget"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Docs
                          <ArrowUpRight className="size-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex-1">
                    <div className="h-full min-h-[560px]">
                      <ElevenLabsWidget client={client} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/[0.06] pt-5 text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <Headphones className="size-4" />
                      Live test hub.
                    </div>
                    <div className="hidden font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground sm:block">
                      {ready ? "Live" : "Placeholder"}
                    </div>
                  </div>
                </section>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
