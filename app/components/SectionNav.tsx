"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Slim global switcher between Matrix and Launch (Launch hidden on GitHub Pages). */
export default function SectionNav() {
  const pathname = usePathname();
  const launchActive = pathname.startsWith("/launch");
  const isPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

  const base =
    "px-3 py-1 text-[12px] font-semibold rounded-sm border border-black";
  const active = "bg-black text-white shadow-brutal";
  const idle =
    "bg-white text-foreground shadow-brutal hover:-translate-x-px hover:-translate-y-px";

  return (
    <div className="bg-[#fafafa] border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-2">
        <span className="text-[11px] font-mono text-muted mr-1">
          hud robotics demo
        </span>
        <Link href="/" className={`${base} ${!launchActive ? active : idle}`}>
          Matrix
        </Link>
        {!isPages && (
          <Link
            href="/launch"
            className={`${base} ${launchActive ? active : idle}`}
          >
            Launch
          </Link>
        )}
      </div>
    </div>
  );
}
