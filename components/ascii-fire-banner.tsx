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
  const bannerFps = isDesktop ? 22 : isTabletUp ? 17 : 13;
  const previewFrameCount = isDesktop ? 18 : isTabletUp ? 12 : 8;
  const bannerScale = isDesktop ? 1.18 : isTabletUp ? 1.24 : 1.32;

  return (
    <div className={cn("sticky top-4 z-20 sm:top-6 lg:top-8", className)}>
      <div className="relative h-[174px] overflow-hidden rounded-[30px] border border-[#10254f]/[0.10] bg-[linear-gradient(180deg,rgba(250,252,255,0.98),rgba(237,244,255,0.96))] shadow-[0_34px_74px_-50px_rgba(15,23,42,0.24)] ring-1 ring-white/80 sm:h-[192px] lg:h-[214px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#17346b]/[0.08]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/95 via-white/72 to-transparent sm:w-24 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/95 via-white/72 to-transparent sm:w-24 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_54%,rgba(83,170,255,0.30),transparent_34%),radial-gradient(ellipse_at_50%_82%,rgba(112,225,255,0.18),transparent_42%),radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.88),transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[18%] top-[26%] h-px bg-[linear-gradient(90deg,transparent,rgba(74,129,212,0.16),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[14%] bottom-[23%] h-px bg-[linear-gradient(90deg,transparent,rgba(140,212,255,0.20),transparent)]"
        />
        <div className="absolute inset-0">
          <ASCIIAnimation
            frameFolder="animations/planet"
            quality={bannerQuality}
            fps={bannerFps}
            frameCount={300}
            className="h-full w-full px-2 pt-4 pb-1 sm:px-4 sm:pt-5 sm:pb-2 lg:px-6 lg:pt-6 lg:pb-2"
            previewFrameCount={previewFrameCount}
            ariaLabel="Animated ASCII globe"
            gradient="linear-gradient(180deg, #10224d 0%, #1c4592 24%, #2f6dd8 47%, #4ca4ff 68%, #85e3ff 86%, #dffaff 100%)"
            filter="drop-shadow(0 18px 36px rgba(59, 130, 246, 0.22))"
            lazy
            trimWhitespace
            trimPadding={8}
            verticalAlign="center"
            maxScale={bannerScale}
            sourceFormat="text"
            loadStrategy="full"
          />
        </div>
      </div>
    </div>
  );
}
