"use client";

import type { CSSProperties } from "react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowUpRight, CircleDashed, Sparkles } from "lucide-react";

import type { ClientAgent } from "@/lib/client-agents";

type ElevenLabsWidgetProps = {
  client: ClientAgent;
};

type WidgetClientToolParameters = Record<string, unknown>;
type WidgetClientToolHandler = (
  parameters: WidgetClientToolParameters,
) => Promise<unknown> | unknown;
type WidgetCallEvent = CustomEvent<{
  config?: {
    clientTools?: Record<string, WidgetClientToolHandler>;
  };
}>;
type WidgetExpandEvent = CustomEvent<{
  action?: "expand" | "collapse" | "toggle";
  _convaiEventHandled?: boolean;
}>;

const ABSOLUTE_URL_PATTERN = /^[a-z]+:/i;
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const ELEVENLABS_WIDGET_SCRIPT_SRC =
  "https://unpkg.com/@elevenlabs/convai-widget-embed";

let elevenLabsWidgetScriptPromise: Promise<void> | null = null;

function subscribeDesktopViewport(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getDesktopViewportSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

function hasElevenLabsWidgetDefinition() {
  return typeof window !== "undefined" &&
    window.customElements.get("elevenlabs-convai") !== undefined;
}

function loadElevenLabsWidgetScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (hasElevenLabsWidgetDefinition()) {
    return Promise.resolve();
  }

  if (elevenLabsWidgetScriptPromise) {
    return elevenLabsWidgetScriptPromise;
  }

  elevenLabsWidgetScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-elevenlabs-widget="true"]',
    );

    const handleLoad = () => {
      existingScript?.setAttribute("data-loaded", "true");
      resolve();
    };

    const handleError = () => {
      elevenLabsWidgetScriptPromise = null;
      reject(new Error("Unable to load ElevenLabs widget script."));
    };

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = ELEVENLABS_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.type = "text/javascript";
    script.dataset.elevenlabsWidget = "true";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.body.appendChild(script);
  });

  return elevenLabsWidgetScriptPromise;
}

function normalizeAllowedHost(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const candidate = ABSOLUTE_URL_PATTERN.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const hostname = new URL(candidate).hostname
      .replace(/\.$/, "")
      .replace(/^www\./, "");

    return hostname || undefined;
  } catch {
    return undefined;
  }
}

function buildAllowedLinkHosts(client: ClientAgent) {
  const hosts = new Set<string>();

  if (client.websiteUrl) {
    const websiteHost = normalizeAllowedHost(client.websiteUrl);

    if (websiteHost) {
      hosts.add(websiteHost);
    }
  }

  for (const value of client.allowedLinkHosts ?? []) {
    const host = normalizeAllowedHost(value);

    if (host) {
      hosts.add(host);
    }
  }

  return [...hosts];
}

function resolveClientUrl(
  value: unknown,
  client: ClientAgent,
  allowedHosts: ReadonlySet<string>,
) {
  if (allowedHosts.size === 0) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const nextUrl = ABSOLUTE_URL_PATTERN.test(trimmed)
      ? new URL(trimmed)
      : client.websiteUrl
        ? new URL(trimmed, client.websiteUrl)
        : undefined;

    if (!nextUrl) {
      return undefined;
    }

    if (nextUrl.protocol !== "https:" && nextUrl.protocol !== "http:") {
      return undefined;
    }

    const hostname = normalizeAllowedHost(nextUrl.hostname);

    if (!hostname) {
      return undefined;
    }

    if (allowedHosts.size > 0 && !allowedHosts.has(hostname)) {
      return undefined;
    }

    return nextUrl;
  } catch {
    return undefined;
  }
}

export function ElevenLabsWidget({ client }: ElevenLabsWidgetProps) {
  const mobileWidgetRef = useRef<HTMLElement | null>(null);
  const desktopWidgetRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scriptReady, setScriptReady] = useState(() =>
    hasElevenLabsWidgetDefinition(),
  );
  const isDesktop = useSyncExternalStore(
    subscribeDesktopViewport,
    getDesktopViewportSnapshot,
    () => false,
  );
  const shouldLoadWidget = isDesktop || mobileOpen;
  const allowedLinkHosts = buildAllowedLinkHosts(client);
  const allowedLinkHostsValue =
    allowedLinkHosts.length > 0 ? allowedLinkHosts.join(",") : undefined;

  useEffect(() => {
    if (!shouldLoadWidget) {
      return;
    }

    if (hasElevenLabsWidgetDefinition()) {
      return;
    }

    let cancelled = false;

    loadElevenLabsWidgetScript()
      .then(() => {
        if (!cancelled) {
          setScriptReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setScriptReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoadWidget]);

  const registerClientTools = useEffectEvent((event: WidgetCallEvent) => {
    const detail = event.detail;

    if (!detail?.config) {
      return;
    }

    const allowedHostSet = new Set(allowedLinkHosts);

    const openResolvedUrl = (value: unknown) => {
      const nextUrl = resolveClientUrl(value, client, allowedHostSet);

      if (!nextUrl) {
        throw new Error("Only approved website links can be opened.");
      }

      window.open(nextUrl.toString(), "_blank", "noopener,noreferrer");

      return {
        opened: true,
        url: nextUrl.toString(),
      };
    };

    detail.config.clientTools = {
      ...detail.config.clientTools,
      redirectToExternalURL: ({ url }) => openResolvedUrl(url),
      redirectToPage: ({ path, url }) => openResolvedUrl(path ?? url),
    };
  });

  const syncMobileOpenState = useEffectEvent((event: Event) => {
    const detail = (event as WidgetExpandEvent).detail;

    if (!detail?.action) {
      return;
    }

    startTransition(() => {
      setMobileOpen((current) => {
        switch (detail.action) {
          case "expand":
            return true;
          case "collapse":
            return false;
          case "toggle":
            return !current;
          default:
            return current;
        }
      });
    });
  });

  const openMobileWidget = () => {
    if (isDesktop) {
      return;
    }

    startTransition(() => {
      setMobileOpen(true);
    });
  };

  useEffect(() => {
    if (isDesktop && mobileOpen) {
      startTransition(() => {
        setMobileOpen(false);
      });
    }
  }, [isDesktop, mobileOpen]);

  useEffect(() => {
    const widgets = [
      mobileOpen && scriptReady ? mobileWidgetRef.current : null,
      isDesktop && scriptReady ? desktopWidgetRef.current : null,
    ].filter((value): value is HTMLElement => value !== null);

    if (widgets.length === 0) {
      return;
    }

    const handleWidgetCall = (event: Event) => {
      registerClientTools(event as WidgetCallEvent);
    };
    const handleWidgetExpand = (event: Event) => {
      syncMobileOpenState(event);
    };

    for (const widget of widgets) {
      widget.addEventListener("elevenlabs-convai:call", handleWidgetCall);
    }

    const mobileWidget = mobileWidgetRef.current;
    mobileWidget?.addEventListener("elevenlabs-agent:expand", handleWidgetExpand);

    return () => {
      for (const widget of widgets) {
        widget.removeEventListener("elevenlabs-convai:call", handleWidgetCall);
      }

      mobileWidget?.removeEventListener(
        "elevenlabs-agent:expand",
        handleWidgetExpand,
      );
    };
  }, [
    allowedLinkHostsValue,
    client.agentId,
    client.slug,
    isDesktop,
    mobileOpen,
    scriptReady,
  ]);

  const mobileWidgetStyle = {
    "--el-overlay-padding": "20px",
  } as CSSProperties;
  const mobileLauncherOrbStyle = {
    background: `radial-gradient(circle at 32% 28%, ${client.orbColors[1]}, ${client.orbColors[0]} 72%)`,
  } as CSSProperties;

  if (!client.agentId) {
    return (
      <div className="flex h-full min-h-[calc(100svh-20rem)] max-h-[40rem] flex-col justify-between rounded-[28px] border border-dashed border-border/80 bg-white/70 p-6 text-sm text-muted-foreground lg:min-h-[560px] lg:max-h-none">
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
    <>
      {isDesktop ? null : mobileOpen ? (
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[rgba(247,244,236,0.94)]"
          />
          <div
            className="relative pointer-events-auto h-[min(36rem,calc(100svh-8rem))] w-full max-w-[22rem] overflow-hidden rounded-[32px] border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,236,0.92))] shadow-[0_32px_80px_-42px_rgba(15,23,42,0.36)] ring-1 ring-white/80"
          >
            {scriptReady ? (
              <elevenlabs-convai
                key={`${client.slug}-${client.agentId}-mobile-open`}
                ref={mobileWidgetRef}
                agent-id={client.agentId}
                variant="compact"
                placement="bottom"
                default-expanded="true"
                markdown-link-allowed-hosts={allowedLinkHostsValue}
                markdown-link-include-www="true"
                avatar-orb-color-1={client.orbColors[0]}
                avatar-orb-color-2={client.orbColors[1]}
                action-text={`Test ${client.name}`}
                start-call-text={`Start ${client.name} session`}
                expand-text={`Open ${client.name}`}
                className="block h-full w-full"
                style={mobileWidgetStyle}
              />
            ) : (
              <div className="flex h-full flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/92 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/60">
                    <span className="size-2 rounded-full bg-foreground/25" />
                    Loading agent
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 rounded-full bg-black/[0.06]" />
                    <div className="h-4 w-full rounded-full bg-black/[0.05]" />
                    <div className="h-4 w-[78%] rounded-full bg-black/[0.05]" />
                  </div>
                </div>
                <div className="rounded-[24px] border border-black/[0.06] bg-white/92 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.24)]">
                  <div className="h-4 w-32 rounded-full bg-black/[0.06]" />
                  <div className="mt-3 h-14 rounded-[18px] border border-black/[0.06] bg-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openMobileWidget}
          aria-label={`Open ${client.name}`}
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-[120] flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-white/96 shadow-[0_22px_40px_-22px_rgba(15,23,42,0.5)] ring-1 ring-black/[0.04] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] lg:hidden"
        >
          <span
            aria-hidden
            className="block h-10 w-10 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
            style={mobileLauncherOrbStyle}
          />
        </button>
      )}

      <div className="relative hidden overflow-hidden rounded-[30px] border border-black/[0.06] bg-white/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.3)] lg:block">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/80 to-transparent" />
        {scriptReady ? (
          <elevenlabs-convai
            key={`${client.slug}-${client.agentId}-desktop`}
            ref={desktopWidgetRef}
            agent-id={client.agentId}
            variant="full"
            placement="bottom-right"
            dismissible="false"
            markdown-link-allowed-hosts={allowedLinkHostsValue}
            markdown-link-include-www="true"
            avatar-orb-color-1={client.orbColors[0]}
            avatar-orb-color-2={client.orbColors[1]}
            action-text={`Test ${client.name}`}
            start-call-text={`Start ${client.name} session`}
            expand-text={`Open ${client.name}`}
            className="block h-[clamp(500px,calc(100svh-17rem),560px)] w-full"
          />
        ) : (
          <div className="flex h-[clamp(500px,calc(100svh-17rem),560px)] w-full items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,244,236,0.82))]">
            <div className="space-y-3 rounded-[28px] border border-black/[0.06] bg-white/88 px-6 py-5 text-center shadow-[0_20px_50px_-34px_rgba(15,23,42,0.28)]">
              <div className="text-sm font-medium text-foreground">Loading {client.name}</div>
              <div className="text-sm text-muted-foreground">Preparing the chat surface.</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
