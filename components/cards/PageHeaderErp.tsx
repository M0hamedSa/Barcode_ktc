import Image from "next/image";
import { Badge } from "../ui/Badge";

export function PageHeaderErp({
  scanning,
  zxingReady,
}: {
  scanning: boolean;
  zxingReady: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-500 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl border border-gray-500 bg-slate-50 grid place-items-center overflow-hidden">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </div>

        <div className="min-w-0">
          <h1 className="text-[14px] font-extrabold tracking-tight text-slate-900">
            ERP Scanner
          </h1>
          <p className="text-[12px] text-slate-500">
            Scan • Review • Export PDF
          </p>
        </div>

        <div className="ml-auto">
          {!zxingReady ? (
            <Badge tone="slate">Loading…</Badge>
          ) : scanning ? (
            <Badge tone="emerald">Live</Badge>
          ) : (
            <Badge tone="slate">Idle</Badge>
          )}
        </div>
      </div>
    </header>
  );
}
