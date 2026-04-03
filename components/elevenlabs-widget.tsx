"use client";

import type { CSSProperties } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
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
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const allowedLinkHosts = buildAllowedLinkHosts(client);
  const allowedLinkHostsValue =
    allowedLinkHosts.length > 0 ? allowedLinkHosts.join(",") : undefined;

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

  const syncMobileExpandedState = useEffectEvent((event: Event) => {
    const detail = (event as WidgetExpandEvent).detail;

    if (!detail?.action) {
      return;
    }

    setMobileExpanded((current) => {
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

  useEffect(() => {
    const mobileWidget = mobileWidgetRef.current;
    const desktopWidget = desktopWidgetRef.current;
    const widgets = [mobileWidget, desktopWidget].filter(
      (value): value is HTMLElement => value !== null,
    );

    if (widgets.length === 0) {
      return;
    }

    const handleWidgetCall = (event: Event) => {
      registerClientTools(event as WidgetCallEvent);
    };
    const handleWidgetExpand = (event: Event) => {
      syncMobileExpandedState(event);
    };

    for (const widget of widgets) {
      widget.addEventListener("elevenlabs-convai:call", handleWidgetCall);
    }

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
  }, [allowedLinkHostsValue, client.agentId, client.slug]);

  const mobileWidgetStyle = {
    "--el-overlay-padding": mobileExpanded ? "24px" : "12px",
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
      <div className="lg:hidden">
        <div
          className={
            mobileExpanded
              ? "pointer-events-none fixed inset-0 z-[120] flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
              : "pointer-events-none fixed right-0 bottom-0 z-[120] h-[7rem] w-[14rem]"
          }
        >
          {mobileExpanded ? (
            <>
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),rgba(245,242,234,0.94))] backdrop-blur-[2px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[20%] bottom-[12%] h-40 rounded-full blur-3xl"
                style={{ background: client.accentSoft }}
              />
            </>
          ) : null}

          <div
            className={
              mobileExpanded
                ? "relative pointer-events-auto h-[min(36rem,calc(100svh-8rem))] w-full max-w-[22rem] overflow-hidden rounded-[32px] border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,236,0.92))] shadow-[0_36px_100px_-44px_rgba(15,23,42,0.44)] ring-1 ring-white/80"
                : "relative pointer-events-auto h-full w-full overflow-visible"
            }
          >
            <elevenlabs-convai
              key={`${client.slug}-${client.agentId}-mobile`}
              ref={mobileWidgetRef}
              agent-id={client.agentId}
              variant="compact"
              placement={mobileExpanded ? "bottom" : "bottom-right"}
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
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden rounded-[30px] border border-black/[0.06] bg-white/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.3)] lg:block">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/80 to-transparent" />
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
      </div>
    </>
  );
}
