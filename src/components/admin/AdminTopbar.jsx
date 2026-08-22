// src/components/admin/AdminTopbar.jsx
export default function AdminTopbar({ title, onOpenMobile }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onOpenMobile}
          className="md:hidden rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div className="flex-1">
          <p className="text-xs text-zinc-400">Administración</p>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <input
            placeholder="Buscar…"
            className="w-64 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-orange-500/70"
          />
        </div>
      </div>
    </header>
  );
}
