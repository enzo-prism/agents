"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, Mic2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeClient =
    clients.find((client) => client.slug === activeValue) ?? clients[0];
  const configuredCount = clients.filter((client) => Boolean(client.agentId)).length;

  const handleValueChange = (value: string) => {
    setActiveValue(value);
    setMobileMenuOpen(false);

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
          className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-6"
        >
          <div
            className={cn(
              baseSurface,
              "flex items-center justify-between gap-3 px-3 py-3 lg:hidden",
            )}
          >
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                Agent QA
              </div>
              <div className="mt-1 truncate text-sm font-medium tracking-tight text-foreground">
                {activeClient.name}
              </div>
            </div>

            <Popover
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              modal={false}
            >
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-10 min-w-[10.25rem] justify-between rounded-full border-black/[0.08] bg-white/90 px-3 shadow-none",
                )}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: activeClient.accent }}
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {activeClient.name}
                  </span>
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </PopoverTrigger>

              <PopoverPortal>
                <PopoverPositioner
                  side="bottom"
                  align="end"
                  className="w-[calc(100vw-2rem)] max-w-sm"
                >
                  <PopoverContent className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        Clients
                      </div>
                      <div className="text-[11px] font-medium text-foreground/60">
                        {configuredCount} live
                      </div>
                    </div>

                    <div className="space-y-1">
                      {clients.map((client, index) => {
                        const ready = Boolean(client.agentId);
                        const active = client.slug === activeClient.slug;

                        return (
                          <button
                            key={client.slug}
                            type="button"
                            onClick={() => handleValueChange(client.slug)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-[22px] px-3 py-3 text-left transition-colors",
                              active
                                ? "bg-[color:var(--client-accent-soft)] text-foreground"
                                : "hover:bg-black/[0.03] text-foreground/80",
                            )}
                            style={
                              {
                                "--client-accent-soft": client.accentSoft,
                              } as CSSProperties
                            }
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="truncate text-base font-medium tracking-tight text-foreground">
                                {client.name}
                              </span>
                            </div>

                            {ready ? (
                              <CheckCircle2 className="size-4 text-foreground/70" />
                            ) : (
                              <Mic2 className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </PopoverPositioner>
              </PopoverPortal>
            </Popover>
          </div>

          <aside
            className={cn(
              baseSurface,
              "hidden flex-col gap-8 px-4 py-5 sm:px-5 sm:py-6 lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100svh-3rem)] lg:overflow-hidden",
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
          </aside>

          {clients.map((client) => {
            return (
              <TabsContent
                key={client.slug}
                value={client.slug}
                className="mt-0 flex outline-none"
              >
                <section
                  className={cn(
                    baseSurface,
                    "animate-in fade-in-0 slide-in-from-bottom-3 flex w-full flex-col px-4 py-4 duration-500 sm:px-6 sm:py-6 lg:min-h-[calc(100svh-3rem)] lg:flex-1 lg:px-8 lg:py-8",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                        Live
                      </div>
                      <h2 className="max-w-[8ch] text-pretty text-[2rem] font-medium tracking-tight text-foreground sm:text-[2.75rem]">
                        {client.name}
                      </h2>
                      <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                        {client.summary}
                      </p>
                    </div>

                    <a
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/[0.08] bg-white/78 px-3 py-1.5 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                      href="https://elevenlabs.io/docs/eleven-agents/customization/widget"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Docs
                      <ArrowUpRight className="size-4" />
                    </a>
                  </div>

                  <div className="mt-6 flex-1 lg:mt-8">
                    <div className="h-full min-h-[240px] sm:min-h-[560px]">
                      <ElevenLabsWidget client={client} />
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
