/** Shown while the client-only 3D bundle loads. */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#05060d] text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-sky-400" />
      <p className="text-xs tracking-[0.3em] uppercase">Charting the system…</p>
    </div>
  );
}
