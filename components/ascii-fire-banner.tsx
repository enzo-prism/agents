import ASCIIAnimation from "@/components/ASCIIAnimation";
import { cn } from "@/lib/utils";

type AsciiFireBannerProps = {
  className?: string;
};

export function AsciiFireBanner({ className }: AsciiFireBannerProps) {
  return (
    <div className={cn("sticky top-4 z-20 sm:top-6 lg:top-8", className)}>
      <div className="relative overflow-hidden rounded-[28px] border border-black/80 bg-[#050505]/96 shadow-[0_24px_64px_-40px_rgba(0,0,0,0.82)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/18"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#050505] via-[#050505]/96 to-transparent sm:w-24 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050505] via-[#050505]/96 to-transparent sm:w-28 lg:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#050505] to-transparent"
        />

        <ASCIIAnimation
          frameFolder="animations/fire"
          quality="low"
          fps={18}
          frameCount={78}
          className="h-[82px] w-full px-2 sm:h-[96px] sm:px-3 lg:h-[110px] lg:px-4"
          ariaLabel="Animated ASCII fire"
          gradient="linear-gradient(180deg, #fff9ef 0%, #ffe0a2 26%, #ffb45f 54%, #ff7f2e 74%, #ff5618 100%)"
          trimWhitespace
        />
      </div>
    </div>
  );
}
