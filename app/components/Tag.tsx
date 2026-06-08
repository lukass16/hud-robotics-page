import type { ReactNode } from "react";

type Tone = "default" | "env" | "model" | "accent" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "border-black bg-white text-foreground",
  env: "border-env/40 bg-env-light text-env",
  model: "border-model/40 bg-model-light text-model",
  accent: "border-accent/50 bg-accent-light text-accent-hover",
  muted: "border-gray-200 bg-gray-50 text-muted",
};

export default function Tag({
  children,
  tone = "default",
  mono = false,
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  mono?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] leading-tight whitespace-nowrap ${
        mono ? "font-mono" : "font-medium"
      } ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
