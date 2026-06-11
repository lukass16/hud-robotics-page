import LaunchPanel from "./LaunchPanel";

export const metadata = {
  title: "Launch | HUD Robotics Demo",
  description:
    "Pick a model and a compatible environment, choose the tasks, and launch a benchmark run on the deployed serving stack.",
};

export default function LaunchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Launch a run
          </h1>
          <p className="mt-3 text-muted max-w-3xl leading-relaxed">
            Pick a <span className="font-semibold text-foreground">model</span>{" "}
            and a contract-compatible{" "}
            <span className="font-semibold text-foreground">environment</span>,
            choose the tasks, and hit Run. Env servers and the GPU policy spin
            up on the deployed Modal apps.
          </p>
        </div>
      </header>
      <main className="px-6 pb-16 flex-1">
        <div className="max-w-[1400px] mx-auto">
          <LaunchPanel />
        </div>
      </main>
    </div>
  );
}
