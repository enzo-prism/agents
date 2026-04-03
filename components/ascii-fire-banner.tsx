import { useSyncExternalStore } from "react";

import ASCIIAnimation from "@/components/ASCIIAnimation";
import { cn } from "@/lib/utils";

type AsciiFireBannerProps = {
  className?: string;
};

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function AsciiFireBanner({ className }: AsciiFireBannerProps) {
  const isTabletUp = useMediaQuery("(min-width: 640px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const bannerQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const bannerFps = isDesktop ? 17 : isTabletUp ? 13 : 10;
  const previewFrameCount = isDesktop ? 14 : isTabletUp ? 10 : 6;
  const bannerScale = isDesktop ? 2.35 : isTabletUp ? 2.55 : 2.9;

  return (
    <div className={cn("sticky top-4 z-20 sm:top-6 lg:top-8", className)}>
      <div className="relative h-[154px] overflow-hidden rounded-[30px] border border-black/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,236,0.96))] shadow-[0_30px_70px_-48px_rgba(15,23,42,0.18)] ring-1 ring-white/70 sm:h-[172px] lg:h-[188px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/95 via-white/70 to-transparent sm:w-24 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/95 via-white/70 to-transparent sm:w-24 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,161,79,0.34),transparent_42%),radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.82),transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] bottom-3 h-px bg-[linear-gradient(90deg,transparent,rgba(20,20,20,0.10),transparent)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-[214px] sm:h-[242px] lg:h-[286px]">
          <ASCIIAnimation
            frameFolder="animations/fire"
            quality={bannerQuality}
            fps={bannerFps}
            frameCount={78}
            className="h-full w-full px-1 sm:px-3 lg:px-4"
            previewFrameCount={previewFrameCount}
            ariaLabel="Animated ASCII fire"
            gradient="linear-gradient(180deg, #4c2611 0%, #8f4216 16%, #d56a1f 38%, #f59a32 60%, #ffd38a 82%, #fff3d3 100%)"
            filter="drop-shadow(0 18px 24px rgba(255, 147, 61, 0.18))"
            lazy
            trimWhitespace
            verticalAlign="bottom"
            maxScale={bannerScale}
            sourceFormat="text"
            loadStrategy="full"
          />
        </div>
      </div>
    </div>
  );
}
