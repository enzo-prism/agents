"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AsciiFireBanner } from "@/components/ascii-fire-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElevenLabsWidget } from "@/components/elevenlabs-widget";
import type { ClientAgent, ClientSlug } from "@/lib/client-agents";
import { cn } from "@/lib/utils";

type AgentPlaygroundProps = {
  clients: readonly ClientAgent[];
  initialClient: ClientSlug;
};

const baseSurface =
  "rounded-[32px] border border-black/[0.08] bg-white/[0.68] backdrop-blur-xl";

export function AgentPlayground({
  clients,
  initialClient,
}: AgentPlaygroundProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const requestedClient = searchParams.get("client");
  const activeValue = clients.some((client) => client.slug === requestedClient)
    ? (requestedClient as ClientSlug)
    : initialClient;

  const activeClient =
    clients.find((client) => client.slug === activeValue) ?? clients[0];

  const handleValueChange = (value: string) => {
    setMobileMenuOpen(false);

    const params = new URLSearchParams(searchParams.toString());

    if (value === clients[0]?.slug) {
      params.delete("client");
    } else {
      params.set("client", value);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${pathname}?${nextQuery}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
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

      <main className="relative mx-auto flex min-h-svh w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
        <AsciiFireBanner className="shrink-0" />

        <Tabs
          value={activeClient.slug}
          onValueChange={handleValueChange}
          orientation="vertical"
          className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-6"
        >
          <div
            className={cn(
              baseSurface,
              "flex items-center justify-end px-2 py-2 lg:hidden",
            )}
          >
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
                    <div className="px-3 py-2">
                      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                        Client Agents
                      </div>
                    </div>

                    <div className="space-y-1">
                      {clients.map((client) => {
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
                            <span className="truncate text-base font-medium tracking-tight text-foreground">
                              {client.name}
                            </span>
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
              "hidden flex-col gap-8 px-4 py-5 sm:px-5 sm:py-6 lg:flex lg:self-start",
            )}
          >
            <div className="space-y-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                Agents
              </div>
            </div>

            <TabsList
              variant="line"
              className="grid w-full gap-2 bg-transparent p-0"
            >
              {clients.map((client) => {
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
                    <div className="px-4 py-4 text-lg font-medium tracking-tight text-foreground">
                      {client.name}
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
                className="mt-0 flex min-h-0 outline-none"
              >
                <section
                  className={cn(
                    baseSurface,
                    "animate-in fade-in-0 slide-in-from-bottom-3 flex w-full flex-col px-4 py-4 duration-500 sm:px-6 sm:py-6 lg:flex-1 lg:px-8 lg:py-8",
                  )}
                >
                  <div className="flex-1">
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
