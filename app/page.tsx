import { loadDataset } from "@/lib/contracts";
import Explorer from "./components/Explorer";

function HudLogo() {
  return (
    <svg
      width="64"
      height="26"
      viewBox="140 320 750 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HUD"
    >
      <path
        d="M153.488 660.583V634.232H177.478V386.173L147.604 372.544V353.917L232.247 332.109H248.995V476.129L249.9 476.583C269.364 451.141 291.543 432.06 324.586 432.06C362.608 432.06 388.408 461.136 388.408 506.568V634.232H408.325V660.583H298.333V634.232H316.891V502.025C316.891 484.307 310.102 479.763 294.712 479.763C278.417 479.763 263.027 484.761 248.995 495.21V634.232H267.553V660.583H153.488Z"
        fill="#272727"
      />
      <path
        d="M467.193 664.217C428.719 664.217 403.371 635.595 403.371 589.709V465.68H378.928V439.329H474.888V598.795C474.888 616.06 481.678 621.057 496.615 621.057C514.268 621.057 527.847 612.879 542.784 601.067V465.68H516.984V439.329H614.301V618.785L642.818 631.052V648.771L562.248 662.854H545.953V618.331L545.047 617.877C523.773 644.227 500.688 664.217 467.193 664.217Z"
        fill="#272727"
      />
      <path
        d="M716.334 664.217C666.996 664.217 623.995 623.329 623.995 546.549C623.995 470.223 674.691 432.06 726.292 432.06C752.092 432.06 771.103 442.509 785.588 457.956V386.173L753.903 372.544V353.917L839.905 332.109H856.653V618.785L885.622 631.052V648.771L805.051 662.854H788.304V621.057L787.398 620.603C768.388 647.408 747.566 664.217 716.334 664.217ZM739.419 630.143C759.335 630.143 773.819 614.697 785.588 599.25V481.126C774.725 472.949 762.503 467.042 746.208 467.042C732.629 467.042 723.123 472.04 716.786 479.763C708.639 489.758 704.113 515.655 704.113 551.546C704.113 589.255 709.092 612.879 717.239 621.511C723.576 627.872 730.366 630.143 739.419 630.143Z"
        fill="#272727"
      />
    </svg>
  );
}

export default function Home() {
  const data = loadDataset();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HudLogo />
            <span className="text-sm font-semibold tracking-tight">
              Benchmark Compatibility Matrix
            </span>
          </div>
          <div className="flex items-center gap-2">
            {process.env.NEXT_PUBLIC_GITHUB_PAGES !== "true" && (
              <a
                href="/launch"
                className="text-[11px] text-foreground px-2.5 py-1 rounded-sm border border-black bg-white shadow-brutal hover:-translate-x-px hover:-translate-y-px"
              >
                Launch
              </a>
            )}
            <span className="text-[11px] text-muted font-mono px-2.5 py-1 rounded-sm border border-black bg-white shadow-brutal">
              {data.envs.length} envs · {data.models.length} models
            </span>
            <a
              href="https://hud.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-foreground px-2.5 py-1 rounded-sm border border-black bg-white shadow-brutal hover:-translate-x-px hover:-translate-y-px flex items-center gap-1"
            >
              hud.ai
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      <header className="px-6 pt-10 pb-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Match robots to models
          </h1>
          <p className="mt-3 text-muted max-w-3xl leading-relaxed">
            Every environment (embodiment) and model (policy) below is described
            by a HUD contract spec sharing one feature schema, so the two can be
            matched field-for-field. Filter both tables at once on a shared field
            — like{" "}
            <span className="font-semibold text-foreground">robot type</span>,
            action space, or camera count — or scope a filter to a single table.
          </p>
        </div>
      </header>

      <main className="px-6 pb-16 flex-1">
        <div className="max-w-[1400px] mx-auto">
          <Explorer data={data} />
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs text-muted">
          <span>HUD Benchmark Compatibility Matrix</span>
          <span>
            Built from{" "}
            <code className="font-mono text-[11px]">contracts/envs</code> +{" "}
            <code className="font-mono text-[11px]">contracts/models</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
