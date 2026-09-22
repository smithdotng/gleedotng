import Image from "next/image";
import Link from "next/link";
import logoLight from "../../public/brand/glee-logo-light.png";
import logoDark from "../../public/brand/glee-logo-dark.png";

/** Official glee.ng wordmark. `light` = ivory version for dark backgrounds. */
export default function Logo({ light = true, height = 44 }: { light?: boolean; height?: number }) {
  const src = light ? logoLight : logoDark;
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="glee.ng home">
      <Image
        src={src}
        alt="glee.ng"
        priority
        style={{ height, width: "auto" }}
        sizes={`${Math.round((height * src.width) / src.height)}px`}
      />
    </Link>
  );
}
