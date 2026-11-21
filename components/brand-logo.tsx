import { cn } from "@/lib/utils"

/**
 * Theme-adaptive brand mark. The light variant has a white field with a black
 * mark; the dark variant is the inverse. Both are generated from Logo.png.
 */
export function BrandLogo({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-light.png"
        alt="Minimalist Toolkit"
        width={size}
        height={size}
        className="block h-full w-full rounded-lg object-contain dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="hidden h-full w-full rounded-lg object-contain dark:block"
      />
    </span>
  )
}
