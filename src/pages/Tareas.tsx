import { useState, useMemo, useEffect } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useUsuarios } from '../hooks/useUsuarios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useTimeTracker } from '../context/TimeTrackerContext';
import { useRegistrosTiempoAgregados } from '../hooks/useRegistrosTiempoAgregados';
import { TaskHistoryPanel } from '../components/ui/TaskHistoryPanel';

function formatFechaLimite(fecha: string | null): string {
  if (!fecha) return 'Sin Fecha';
  const dateOnly = fecha.substring(0, 10);
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (dateOnly === today) return 'Hoy';
  if (dateOnly === tomorrow) return 'Mañana';
  return new Date(fecha).toLocaleDateString();
}

function formatMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

type FilterType = 'all' | 'hoy' | 'retrasadas' | 'urgentes' | 'mis_tareas' | 'completadas';
type SortField = 'titulo' | 'categoria' | 'fecha_limite' | 'prioridad' | 'responsable' | 'estado' | 'tiempo';
type SortDir = 'asc' | 'desc';

const PRIORIDAD_ORDER: Record<string, number> = { critica: 0, alta: 1, media: 2, baja: 3 };
const ESTADO_ORDER: Record<string, number> = { en_progreso: 0, pendiente: 1, vencida: 2, completada: 3 };

const Tareas = () => {
  const { tareas, isLoading, updateTarea } = useTareas();
  const { usuarios } = useUsuarios();
  const { user } = useAuth();
  const { openTaskModal } = useModal();
  const { lastTimerUpdate } = useTimeTracker();

  const tareaIds = useMemo(() => tareas.map(t => t.id), [tareas]);
  const tiempoMap = useRegistrosTiempoAgregados(tareaIds, lastTimerUpdate);

  const usuarioMap = useMemo(
    () => new Map(usuarios.map(u => [u.id, u.nombre_completo || u.id.slice(0, 8)])),
    [usuarios]
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('fecha_limite');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };
  
  // History Panel State
  const [selectedTarea, setSelectedTarea] = useState<any | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync selected tarea when global tareas list updates
  useEffect(() => {
    if (selectedTarea) {
      const updated = tareas.find(t => t.id === selectedTarea.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTarea)) {
        setSelectedTarea(updated);
      }
    }
  }, [tareas, selectedTarea]);

  const openHistory = (tarea: any) => {
    setSelectedTarea(tarea);
    setIsHistoryOpen(true);
  };

  const handleStateChange = async (id: string, newEstado: string) => {
    await updateTarea(id, { estado: newEstado as any });
  };

  const renderStatusDropdown = (tarea: any) => {
    const baseClass = "pl-2.5 pr-6 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer appearance-none bg-transparent outline-none border focus:ring-2 focus:ring-primary/20 ";
    let colorClass = "";
    
    switch(tarea.estado) {
      case 'completada': colorClass = "status-completado border-emerald-500/20"; break;
      case 'en_progreso': colorClass = "status-progreso border-blue-400/20"; break;
      case 'vencida': colorClass = "status-retrasada border-red-500/20"; break;
      default: colorClass = "bg-slate-500/10 text-slate-600 border-slate-500/10"; break;
    }

    return (
      <div className="relative inline-block" onClick={e => e.stopPropagation()}>
        <select 
          value={tarea.estado || 'pendiente'} 
          onChange={(e) => handleStateChange(tarea.id, e.target.value)}
          className={`${baseClass} ${colorClass}`}
        >
          <option value="pendiente" className="text-slate-800 font-medium">PENDIENTE</option>
          <option value="en_progreso" className="text-slate-800 font-medium">EN PROGRESO</option>
          <option value="completada" className="text-slate-800 font-medium">COMPLETADA</option>
          <option value="vencida" className="text-slate-800 font-medium">RETRASADA</option>
        </select>
        <span className="material-symbols-outlined text-[10px] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">arrow_drop_down</span>
      </div>
    );
  };

  const renderPriorityBadge = (prioridad: string) => {
    switch(prioridad) {
      case 'critica': return <span className="px-2.5 py-1 bg-red-500/10 text-red-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-500/10">Crítica</span>;
      case 'alta': return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-500/10">Alta</span>;
      case 'baja': return <span className="px-2.5 py-1 bg-slate-500/10 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-500/10">Baja</span>;
      default: return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-blue-500/10">Media</span>;
    }
  };

  const sortedAndFilteredTareas = useMemo(() => {
    const filtered = tareas.filter(t => {
      if (t.estado === 'completada' && activeFilter !== 'completadas') return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'retrasadas') return t.estado === 'vencida' || (t.fecha_limite && t.fecha_limite < new Date().toISOString().split('T')[0] && t.estado !== 'completada');
      if (activeFilter === 'hoy') return t.categoria === 'hoy';
      if (activeFilter === 'urgentes') return t.prioridad === 'critica' || t.prioridad === 'alta';
      if (activeFilter === 'completadas') return t.estado === 'completada';
      if (activeFilter === 'mis_tareas') return t.responsable_id === user?.id;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'titulo':       valA = a.titulo.toLowerCase(); valB = b.titulo.toLowerCase(); break;
        case 'categoria':    valA = a.categoria ?? ''; valB = b.categoria ?? ''; break;
        case 'fecha_limite': valA = a.fecha_limite ?? ''; valB = b.fecha_limite ?? ''; break;
        case 'prioridad':    valA = PRIORIDAD_ORDER[a.prioridad ?? 'media'] ?? 9; valB = PRIORIDAD_ORDER[b.prioridad ?? 'media'] ?? 9; break;
        case 'estado':       valA = ESTADO_ORDER[a.estado ?? 'pendiente'] ?? 9; valB = ESTADO_ORDER[b.estado ?? 'pendiente'] ?? 9; break;
        case 'responsable':  valA = usuarioMap.get(a.responsable_id ?? '') ?? ''; valB = usuarioMap.get(b.responsable_id ?? '') ?? ''; break;
        case 'tiempo':       valA = tiempoMap.get(a.id)?.totalMinutos ?? 0; valB = tiempoMap.get(b.id)?.totalMinutos ?? 0; break;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tareas, activeFilter, sortField, sortDir, user, usuarioMap, tiempoMap]);

  const filteredTareas = sortedAndFilteredTareas;

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'all' ? 'bg-gradient-to-r from-[#4facfe] to-[#6b47ff] border-0 text-white shadow-lg shadow-indigo-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Todas</button>
        <button
          onClick={() => setActiveFilter('hoy')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'hoy' ? 'bg-amber-400 border-0 text-white shadow-lg shadow-amber-400/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >⭐ Hoy</button>
        <button
          onClick={() => setActiveFilter('retrasadas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'retrasadas' ? 'bg-red-500 border-0 text-white shadow-lg shadow-red-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Retrasadas</button>
        <button 
          onClick={() => setActiveFilter('urgentes')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'urgentes' ? 'bg-amber-500 border-0 text-white shadow-lg shadow-amber-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Urgentes</button>
        <button 
          onClick={() => setActiveFilter('mis_tareas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'mis_tareas' ? 'bg-gradient-to-r from-[#4facfe] to-[#6b47ff] border-0 text-white shadow-lg shadow-indigo-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Mis Tareas</button>
        <button 
          onClick={() => setActiveFilter('completadas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-[background-color,box-shadow,transform] ${activeFilter === 'completadas' ? 'bg-emerald-500 border-0 text-white shadow-lg shadow-emerald-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Completadas</button>
      </div>
      
      {/* Detailed List View */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 border-b border-white/30 flex justify-between items-center bg-white/10">
          <h2 className="text-lg font-headline font-bold text-slate-900 tracking-tight">Registro de Tareas ({filteredTareas.length})</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => openTaskModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] hover:brightness-110 text-white px-6 py-2.5 rounded-full text-[11px] font-bold transition-[filter] shadow-lg shadow-indigo-500/20 border-0"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nueva
            </button>
          </div>
        </div>
        
        {/* Mobile card list — hidden on md+ */}
        <div className="md:hidden divide-y divide-white/20">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-slate-500 font-medium text-xs">Cargando tareas...</div>
          ) : filteredTareas.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500 font-medium text-xs">No hay tareas que coincidan con el filtro actual.</div>
          ) : (
            filteredTareas.map((tarea) => {
              const isOverdue = tarea.estado === 'vencida' || (tarea.fecha_limite && tarea.fecha_limite < new Date().toISOString().split('T')[0] && tarea.estado !== 'completada');
              return (
                <div
                  key={tarea.id}
                  onClick={() => openHistory(tarea)}
                  className="px-5 py-4 flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  {/* Title row */}
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-lg mt-0.5 flex-shrink-0 ${tarea.estado === 'completada' ? 'text-emerald-500' : 'text-primary'}`}>
                      {tarea.estado === 'completada' ? 'check_circle' : 'radio_button_checked'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-[13px] tracking-tight leading-snug">{tarea.titulo}</p>
                      {tarea.descripcion && <p className="text-[10px] text-slate-500 truncate mt-0.5">{tarea.descripcion}</p>}
                    </div>
                  </div>
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap pl-8">
                    {renderPriorityBadge(tarea.prioridad || 'media')}
                    <span className={`flex items-center gap-1 text-[10px] font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      {formatFechaLimite(tarea.fecha_limite)}
                    </span>
                    {tiempoMap.has(tarea.id) && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                        <span className="material-symbols-outlined text-[11px]">timer</span>
                        {formatMinutos(tiempoMap.get(tarea.id)!.totalMinutos)}
                      </span>
                    )}
                    {tarea.responsable_id && usuarioMap.has(tarea.responsable_id) && (
                      <div className="w-5 h-5 rounded-md border border-white bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                        {usuarioMap.get(tarea.responsable_id)!.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Status row */}
                  <div className="pl-8" onClick={e => e.stopPropagation()}>
                    {renderStatusDropdown(tarea)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table — hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                {([
                  ['titulo', 'Tarea'],
                  ['categoria', 'Categoría'],
                  ['fecha_limite', 'Vencimiento'],
                  ['prioridad', 'Prioridad'],
                  ['responsable', 'Responsable'],
                  ['estado', 'Estado'],
                  ['tiempo', 'Tiempo'],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 cursor-pointer select-none hover:text-primary transition-colors text-center${field !== 'titulo' ? ' w-px whitespace-nowrap' : ''}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      <span className="material-symbols-outlined text-[12px]">
                        {sortField === field ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {isLoading ? (
                <tr><td colSpan={8} className="px-8 py-10 text-center text-slate-500 font-medium text-xs">Cargando tareas...</td></tr>
              ) : filteredTareas.length === 0 ? (
                <tr><td colSpan={8} className="px-8 py-10 text-center text-slate-500 font-medium text-xs">No hay tareas que coincidan con el filtro actual.</td></tr>
              ) : (
                filteredTareas.map((tarea) => (
                  <tr 
                    key={tarea.id} 
                    onClick={() => openHistory(tarea)}
                    className="row-hover transition-colors duration-300 cursor-pointer group hover:bg-white/5"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-lg ${tarea.estado === 'completada' ? 'text-emerald-500' : 'text-primary'}`}>
                          {tarea.estado === 'completada' ? 'check_circle' : 'radio_button_checked'}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 text-[11px] tracking-tight group-hover:text-primary transition-colors">{tarea.titulo}</p>
                          {tarea.descripcion && <p className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">{tarea.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      <span className="text-[11px] text-slate-600 font-medium">{tarea.categoria || 'General'}</span>
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      <div className={`flex items-center gap-2 text-[11px] font-semibold ${tarea.estado === 'vencida' || (tarea.fecha_limite && tarea.fecha_limite < new Date().toISOString().split('T')[0] && tarea.estado !== 'completada') ? 'text-red-500' : 'text-slate-600'}`}>
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {formatFechaLimite(tarea.fecha_limite)}
                      </div>
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      {renderPriorityBadge(tarea.prioridad || 'media')}
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {tarea.responsable_id && usuarioMap.has(tarea.responsable_id) ? (
                          <>
                            <div className="w-7 h-7 rounded-lg border-2 border-white bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md text-white text-[10px] font-bold flex-shrink-0">
                              {usuarioMap.get(tarea.responsable_id)!.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                              {usuarioMap.get(tarea.responsable_id)}
                            </span>
                          </>
                        ) : (
                          <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      {renderStatusDropdown(tarea)}
                    </td>
                    <td className="px-5 py-3 w-px whitespace-nowrap">
                      {tiempoMap.has(tarea.id) ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                          <span className="material-symbols-outlined text-sm">timer</span>
                          {formatMinutos(tiempoMap.get(tarea.id)!.totalMinutos)}
                          <span className="text-[9px] font-medium text-slate-400 ml-0.5">
                            ({tiempoMap.get(tarea.id)!.sessionCount} ses.)
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 w-px text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openTaskModal(tarea); }}
                        title="Editar tarea"
                        className="text-slate-300 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task History Sidebar Panel */}
      <TaskHistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        tarea={selectedTarea}
      />
    </div>
  );
};

export default Tareas;
