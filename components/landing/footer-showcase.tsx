import Image from "next/image"

/**
 * Closing animation placed directly below the site footer.
 *
 * The file is a 1280x640 animated GIF served from /public. It is rendered
 * with next/image in unoptimized mode so the original animation and the
 * original file are served as-is, with no re-encoding and no srcset variants.
 *
 * The section is full bleed: the animation spans the entire viewport width
 * with no side padding, and the 2:1 aspect ratio is preserved at every size,
 * so nothing is cropped or stretched.
 */
export function FooterShowcase() {
  return (
    <section className="border-t border-border bg-background" aria-label="Minimalist Toolkit animation">
      <Image
        src="/Footer.gif"
        alt="A looping dot matrix animation of the Minimalist Toolkit mark."
        width={1280}
        height={640}
        sizes="100vw"
        unoptimized
        loading="lazy"
        className="block h-auto w-full"
      />
    </section>
  )
}
