import { NavLink } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Panel Principal', path: '/panel', icon: 'dashboard' },
  { name: 'Mis Tareas', path: '/tareas', icon: 'check_circle' },
  { name: 'Calendario', path: '/calendario', icon: 'calendar_today' },
  { name: 'Seguimientos', path: '/seguimientos', icon: 'pending_actions' },
  { name: 'Proyectos', path: '/proyectos', icon: 'folder_open' },
  { name: 'Reportes', path: '/informes', icon: 'insert_chart' },
];

export function Sidebar() {
  const { openTaskModal } = useModal();
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] z-50 glass-sidebar flex flex-col p-5 space-y-4 font-headline text-[12px] overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-2.5 mb-2 px-1">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
          <span className="material-symbols-outlined text-xl">rocket_launch</span>
        </div>
        <div>
          <h1 className="text-sm font-extrabold leading-tight tracking-tight text-slate-900">Gestión Premium</h1>
          <p className="text-[8px] uppercase tracking-[0.15em] font-bold mt-0.5 text-slate-600">Edición Editorial</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/10 shadow-lg shadow-primary/5 font-semibold'
                  : 'text-slate-600 hover:bg-white/60 hover:text-primary font-medium'
              }`
            }
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="rounded-2xl p-4 space-y-3 mt-4 bg-white/20 border border-white/40">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.1em] px-1 text-slate-600">Próximas Entregas</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 border border-white/30">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
              <span className="material-symbols-outlined text-base">description</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight">Reporte Q3</p>
              <p className="text-[8px] text-slate-500 font-medium">En 2 días</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 border border-white/30">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-base">palette</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight">Logo Final</p>
              <p className="text-[8px] text-slate-500 font-medium">En 4 días</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={openTaskModal}
        className="w-full py-3 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] text-white rounded-full text-xs font-bold shadow-xl shadow-indigo-500/30 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-auto tracking-wide border-0"
      >
        Nueva Tarea
      </button>

      <div className="pt-4 border-t border-slate-200">
        <NavLink
          to="/ajustes"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-[11px] font-medium ${isActive ? 'text-primary bg-primary/10' : 'text-slate-600 hover:text-primary'}`
          }
        >
          <span className="material-symbols-outlined text-base">settings</span>
          <span>Ajustes</span>
        </NavLink>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl transition-colors text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-500/5"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
