import { Badge } from "../ui/Badge";

export function CameraCard({
  zxingReady,
  scanning,
  camLabel,
  onStart,
  onStop,
}: {
  zxingReady: boolean;
  scanning: boolean;
  camLabel: string;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone="sky">Camera</Badge>
            <span className="text-[12px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">
              {camLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={scanning || !zxingReady}
              className="rounded-xl px-4 py-2 text-[12px] font-bold text-white bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Start
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={!scanning}
              className="rounded-xl px-4 py-2 text-[12px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="relative bg-blue-400" style={{ aspectRatio: "3/1" }}>
        <video
          id="preview"
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover block"
        />

        {!scanning && (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="rounded-3xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md px-6 py-4 text-center shadow-2xl">
              <p className="text-[14px] font-extrabold text-white">
                {zxingReady ? "Tap Start to scan" : "Loading scanner…"}
              </p>
              <p className="mt-1 text-[12px] text-white/80 font-medium tracking-wide">
                Hold barcode inside the frame
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none grid place-items-center">
          <div className="relative w-[82%] max-w-[320px] h-[108px] rounded-2xl border border-white/70 bg-white/5 shadow-[0_0_0_2000px_rgba(0,0,0,0.25)]">
            <span className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-2xl" />
            <span className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-white rounded-br-2xl" />
            {scanning && (
              <div className="absolute left-2 right-2 top-1/2 h-0.5 rounded-full bg-white/80 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
