import Image from "next/image";
import { Badge } from "../ui/Badge";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PageHeader({
  scanning,
  zxingReady,
}: {
  scanning: boolean;
  zxingReady: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 grid place-items-center overflow-hidden">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="dark:brightness-200"
            />
          </Link>
        </div>

        <div className="min-w-0">
          <h1 className="text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Add Rolls to Lay No
          </h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Scan • Review • Add • Export PDF
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!zxingReady ? (
            <Badge tone="slate">Loading…</Badge>
          ) : scanning ? (
            <Badge tone="emerald">Live</Badge>
          ) : (
            <Badge tone="slate">Idle</Badge>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
