import { useParams, useNavigate } from 'react-router-dom';
import { useProyectos } from '../hooks/useProyectos';
import { useTareas } from '../hooks/useTareas';
import { TaskHistoryPanel } from '../components/ui/TaskHistoryPanel';
import { useState } from 'react';
import type { Database } from '../lib/types';

type Tarea = Database['public']['Tables']['tareas']['Row'];

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proyectos, isLoading: isLoadingP } = useProyectos();
  const { tareas, isLoading: isLoadingT } = useTareas();

  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Find project
  const proyecto = proyectos.find(p => p.id === id);
  // Filter tasks
  const projectTasks = tareas.filter(t => t.proyecto_id === id);

  if (isLoadingP || isLoadingT) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse mt-20">
         <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
         <p className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Cargando Proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="mt-20 flex flex-col items-center justify-center p-20 text-center animate-in fade-in">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">folder_off</span>
        <h2 className="text-2xl font-bold text-slate-800">Proyecto no encontrado</h2>
        <button onClick={() => navigate('/proyectos')} className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-colors">
          Volver a Proyectos
        </button>
      </div>
    );
  }

  // Calculate Metrics
  const total = projectTasks.length;
  const completadas = projectTasks.filter(t => t.estado === 'completada').length;
  const enProgreso = projectTasks.filter(t => t.estado === 'en_progreso').length;
  const completionRate = total > 0 ? Math.round((completadas / total) * 100) : 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const criticasOVencidas = projectTasks.filter(t => 
    t.estado !== 'completada' && (t.prioridad === 'critica' || (t.fecha_limite && t.fecha_limite < todayStr))
  ).length;

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button 
            onClick={() => navigate('/proyectos')}
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-3"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Proyectos
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#4facfe] to-[#6b47ff] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
              <span className="material-symbols-outlined text-3xl">folder</span>
            </div>
            <div>
              <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">{proyecto.nombre}</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">{proyecto.descripcion || 'Iniciativa activa'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl bg-white/40 border border-white/50 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Tareas</span>
          <span className="text-3xl font-black text-slate-800">{total}</span>
        </div>
        <div className="glass-panel p-5 rounded-3xl bg-white/40 border border-white/50 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">En Progreso</span>
          <span className="text-3xl font-black text-blue-600">{enProgreso}</span>
        </div>
        <div className="glass-panel p-5 rounded-3xl bg-white/40 border border-white/50 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Progreso Total</span>
          <div className="flex items-end gap-2">
             <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
          </div>
        </div>
        <div className={`glass-panel p-5 rounded-3xl flex flex-col justify-center ${criticasOVencidas > 0 ? 'bg-red-50/50 border border-red-200' : 'bg-white/40 border border-white/50'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${criticasOVencidas > 0 ? 'text-red-500' : 'text-slate-500'}`}>Atención</span>
          <span className={`text-3xl font-black ${criticasOVencidas > 0 ? 'text-red-600' : 'text-slate-800'}`}>{criticasOVencidas}</span>
        </div>
      </div>

      {/* Tareas List */}
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-8 shadow-xl bg-white/20 border-white/40">
        <h2 className="text-lg font-headline font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">list_alt</span>
          Tareas Asignadas
        </h2>

        {projectTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 opacity-60">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">inbox</span>
            <p className="font-bold text-slate-600">No hay tareas en este proyecto.</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Usa el botón "Nueva Tarea" para agregar una y seleccionarla en el desplegable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTasks.sort((a,b) => (a.fecha_limite || '').localeCompare(b.fecha_limite || '')).map(tarea => (
              <div 
                key={tarea.id}
                onClick={() => { setSelectedTarea(tarea); setIsHistoryOpen(true); }}
                className="group p-5 rounded-3xl glass-panel bg-white/60 hover:bg-white border border-white/80 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Accent line for status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${tarea.estado === 'completada' ? 'bg-emerald-400' : tarea.estado === 'en_progreso' ? 'bg-blue-400' : 'bg-slate-300'}`} />

                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1">{tarea.categoria}</span>
                    <h3 className={`font-bold text-sm tracking-tight ${tarea.estado === 'completada' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {tarea.titulo}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase ml-3 shrink-0 ${
                    tarea.prioridad === 'critica' ? 'bg-red-100 text-red-600' : 
                    tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-600' : 
                    tarea.prioridad === 'media' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tarea.prioridad}
                  </span>
                </div>

                <div className="pl-2 flex items-center justify-between mt-4 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    {tarea.fecha_limite}
                  </div>
                  <div className="flex items-center gap-1.5 uppercase tracking-widest text-[9px]">
                    <span className={`w-2 h-2 rounded-full ${tarea.estado === 'completada' ? 'bg-emerald-400' : tarea.estado === 'en_progreso' ? 'bg-blue-400' : 'bg-slate-300'}`} />
                    {tarea.estado.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskHistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        tarea={selectedTarea}
      />
    </div>
  );
}
