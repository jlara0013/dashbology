import { useState } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useModal } from '../context/ModalContext';
import { TaskHistoryPanel } from '../components/ui/TaskHistoryPanel';

type FilterType = 'all' | 'retrasadas' | 'urgentes' | 'mis_tareas' | 'completadas';

const Tareas = () => {
  const { tareas, isLoading, updateTarea } = useTareas();
  const { openTaskModal } = useModal();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // History Panel State
  const [selectedTarea, setSelectedTarea] = useState<any | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
      case 'critica': return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-500/10">Crítica</span>;
      case 'alta': return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-500/10">Alta</span>;
      case 'baja': return <span className="px-2.5 py-1 bg-slate-500/10 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-slate-500/10">Baja</span>;
      default: return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-blue-500/10">Media</span>;
    }
  };

  const filteredTareas = tareas.filter(t => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'retrasadas') {
      const isOverdue = t.estado === 'vencida' || (t.fecha_limite && t.fecha_limite < new Date().toISOString().split('T')[0] && t.estado !== 'completada');
      return isOverdue;
    }
    if (activeFilter === 'urgentes') return t.prioridad === 'critica' || t.prioridad === 'alta';
    if (activeFilter === 'completadas') return t.estado === 'completada';
    if (activeFilter === 'mis_tareas') return t.estado !== 'completada';
    return true;
  });

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${activeFilter === 'all' ? 'bg-gradient-to-r from-[#4facfe] to-[#6b47ff] border-0 text-white shadow-lg shadow-indigo-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Todas</button>
        <button 
          onClick={() => setActiveFilter('retrasadas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${activeFilter === 'retrasadas' ? 'bg-red-500 border-0 text-white shadow-lg shadow-red-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Retrasadas</button>
        <button 
          onClick={() => setActiveFilter('urgentes')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${activeFilter === 'urgentes' ? 'bg-amber-500 border-0 text-white shadow-lg shadow-amber-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Urgentes</button>
        <button 
          onClick={() => setActiveFilter('mis_tareas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${activeFilter === 'mis_tareas' ? 'bg-gradient-to-r from-[#4facfe] to-[#6b47ff] border-0 text-white shadow-lg shadow-indigo-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Activas</button>
        <button 
          onClick={() => setActiveFilter('completadas')}
          className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${activeFilter === 'completadas' ? 'bg-emerald-500 border-0 text-white shadow-lg shadow-emerald-500/25 hover:scale-105' : 'bg-white/40 text-slate-700 border border-white/50 hover:bg-white/60'}`}
        >Completadas</button>
      </div>
      
      {/* Detailed List View */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="px-8 py-6 border-b border-white/30 flex justify-between items-center bg-white/10">
          <h2 className="text-lg font-headline font-bold text-slate-900 tracking-tight">Registro de Tareas ({filteredTareas.length})</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={openTaskModal}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] hover:brightness-110 text-white px-6 py-2.5 rounded-full text-[11px] font-bold transition-all shadow-lg shadow-indigo-500/20 border-0"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nueva
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Nombre de la Tarea</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Categoría</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Vencimiento</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Prioridad</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Responsable</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Estado</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {isLoading ? (
                <tr><td colSpan={7} className="px-8 py-10 text-center text-slate-500 font-medium text-xs">Cargando tareas...</td></tr>
              ) : filteredTareas.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-10 text-center text-slate-500 font-medium text-xs">No hay tareas que coincidan con el filtro actual.</td></tr>
              ) : (
                filteredTareas.map((tarea) => (
                  <tr 
                    key={tarea.id} 
                    onClick={() => openHistory(tarea)}
                    className="row-hover transition-all duration-300 cursor-pointer group hover:bg-white/5"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-lg ${tarea.estado === 'completada' ? 'text-emerald-500' : 'text-primary'}`}>
                          {tarea.estado === 'completada' ? 'check_circle' : 'radio_button_checked'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-primary transition-colors">{tarea.titulo}</p>
                          {tarea.descripcion && <p className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">{tarea.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[12px] text-slate-600 font-semibold uppercase">{tarea.categoria || 'General'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-2 text-[11px] font-semibold ${tarea.estado === 'vencida' || (tarea.fecha_limite && tarea.fecha_limite < new Date().toISOString().split('T')[0] && tarea.estado !== 'completada') ? 'text-red-500' : 'text-slate-600'}`}>
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString() : 'Sin Fecha'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {renderPriorityBadge(tarea.prioridad || 'media')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center shadow-md">
                           <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {renderStatusDropdown(tarea)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-300 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg">
                        <span className="material-symbols-outlined text-xl">open_in_new</span>
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
