import { useAuth } from '../../context/AuthContext';

export function TopBar() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-220px)] z-40 glass-topbar flex justify-between items-center px-8 h-16 font-headline">
      <div className="flex items-center bg-white/40 border border-white/50 rounded-2xl px-4 py-2 w-80 focus-within:w-96 transition-[width] duration-300 shadow-sm">
        <span className="material-symbols-outlined text-slate-500 mr-3 text-lg">search</span>
        <input
          className="bg-transparent border-none outline-none w-full text-slate-900 placeholder:text-slate-500 text-xs font-medium focus-visible:ring-0"
          placeholder="Buscar tareas, proyectos o miembros..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-600 hover:bg-white/40 rounded-xl transition-colors duration-200">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border border-white shadow-sm shadow-error/50"></span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-white/40 rounded-xl transition-colors duration-200">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-300/30"></div>

        <div className="flex items-center gap-3 bg-white/40 pl-3 pr-1 py-1 rounded-2xl border border-white/50">
          <div className="text-right">
            <p className="font-bold text-slate-900 text-[12px] leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{user?.email || ''}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
