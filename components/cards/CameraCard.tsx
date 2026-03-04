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
    <div className="rounded-3xl border border-gray-400 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-40 from-slate-1000 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone="sky">Camera</Badge>
            <span className="text-[12px] text-slate-600">{camLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={scanning || !zxingReady}
              className="rounded-xl px-3 py-2 text-[12px] font-semibold text-white bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-800 transition"
            >
              Start
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={!scanning}
              className="rounded-xl px-3 py-2 text-[12px] font-semibold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
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
          <div className="absolute inset-0 grid place-items-center bg-slate-950/20">
            <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur px-4 py-3 text-center shadow">
              <p className="text-[13px] font-semibold text-slate-900">
                {zxingReady ? "Tap Start to scan" : "Loading scanner…"}
              </p>
              <p className="mt-1 text-[12px] text-slate-600">
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
