import Image from "next/image";
import { cn } from "@/lib/utils";

export type LogoVariant = "wordmark" | "symbol" | "line";
export type LogoTone = "dark" | "light";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

const heightMap: Record<LogoSize, number> = {
  xs: 18, sm: 24, md: 32, lg: 48, xl: 64,
};
const ratioMap: Record<LogoVariant, number> = {
  wordmark: 4, symbol: 1, line: 1,
};
const fileMap: Record<LogoVariant, string> = {
  wordmark: "barch-wordmark",
  symbol: "barch-symbol-full",
  line: "barch-symbol-line",
};

export function Logo({
  variant = "wordmark",
  tone = "dark",
  size = "md",
  className,
  priority = false,
}: LogoProps) {
  const h = heightMap[size];
  const w = Math.round(h * ratioMap[variant]);
  const src = `/logos/${fileMap[variant]}-${tone}-bgoff.svg`;
  const alt = variant === "wordmark" ? "Barch" : "Barch — símbolo";

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      className={cn("select-none", className)}
      style={{ height: `${h}px`, width: "auto" }}
    />
  );
}
