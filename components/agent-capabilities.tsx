import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  Presentation,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type {
  ClientAgent,
  ClientCapability,
  ClientCapabilityIcon,
} from "@/lib/client-agents";
import { cn } from "@/lib/utils";

const capabilityIcons: Record<ClientCapabilityIcon, LucideIcon> = {
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  clock: Clock3,
  "map-pin": MapPin,
  presentation: Presentation,
  shield: ShieldCheck,
  stethoscope: Stethoscope,
  user: UserRound,
  users: Users,
  wallet: WalletCards,
};

type AgentCapabilitiesProps = {
  client: ClientAgent;
  className?: string;
  variant?: "rail" | "popover";
};

export function AgentCapabilities({
  client,
  className,
  variant = "rail",
}: AgentCapabilitiesProps) {
  const isRail = variant === "rail";
  const websiteLabel = getWebsiteLabel(client.websiteUrl);

  const renderCapability = (capability: ClientCapability) => {
    const Icon = capabilityIcons[capability.icon];

    return (
      <div
        key={`${client.slug}-${capability.title}`}
        className={cn(
          "rounded-[22px] border border-black/[0.06] bg-white/[0.9] transition-colors hover:bg-white",
          isRail ? "p-3" : "p-3.5",
        )}
      >
        <div className={cn("flex items-start", isRail ? "gap-2.5" : "gap-3")}>
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-2xl",
              isRail ? "size-9" : "size-10",
            )}
            style={{
              background: client.accentSoft,
              color: client.accent,
            }}
          >
            <Icon className={isRail ? "size-3.5" : "size-4"} strokeWidth={1.9} />
          </div>
          <div className="min-w-0 space-y-1">
            <div
              className={cn(
                "font-medium tracking-tight text-foreground",
                isRail ? "text-[13.5px]" : "text-[14px]",
              )}
            >
              {capability.title}
            </div>
            <p
              className={cn(
                "text-muted-foreground",
                isRail
                  ? "line-clamp-2 text-[11.5px] leading-4.5"
                  : "line-clamp-2 text-[12.5px] leading-4.5",
              )}
            >
              {capability.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "rounded-[28px] border border-black/[0.06] bg-white/[0.74] shadow-[0_24px_70px_-42px_rgba(15,23,42,0.16)]",
        isRail ? "p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", isRail ? "mb-3" : "mb-4 sm:mb-5")}>
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          What to test
        </div>
        <div aria-hidden className="h-px flex-1 bg-black/[0.06]" />
      </div>

      <a
        className={cn(
          "mb-3 flex items-center justify-between gap-3 rounded-[20px] border border-black/[0.06] bg-white/[0.72] px-3 py-2.5 text-left transition-colors hover:bg-white",
          isRail ? "text-[12px]" : "text-[12.5px]",
        )}
        href={client.websiteUrl}
        target="_blank"
        rel="noreferrer"
      >
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Website
          </div>
          <div className="truncate pt-1 font-medium tracking-tight text-foreground/88">
            {websiteLabel}
          </div>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
      </a>

      <div className={cn("grid", isRail ? "gap-2.5" : "gap-3")}>
        {client.capabilities.map((capability) => renderCapability(capability))}
      </div>
    </aside>
  );
}

function getWebsiteLabel(websiteUrl: string) {
  try {
    return new URL(websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}
