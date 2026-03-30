import { useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';

const Panel = () => {
  const { tareas } = useTareas();

  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let hoy = 0;
    let enMarcha = 0;
    let retrasadas = 0;
    let completadas = 0;

    tareas.forEach((t) => {
      // Si la fecha limite cae hoy
      if (t.fecha_limite && t.fecha_limite.startsWith(todayStr)) hoy++;
      
      if (t.estado === 'en_progreso') enMarcha++;
      if (t.estado === 'vencida' || (t.fecha_limite && t.fecha_limite < todayStr && t.estado !== 'completada')) retrasadas++;
      if (t.estado === 'completada') completadas++;
    });

    const total = tareas.length;
    const kpi = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return { hoy, enMarcha, retrasadas, kpi, completadas };
  }, [tareas]);

  const heatmap = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 44; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      
      // Contar tareas creadas o con fecha límite en ese día
      const tasksToday = tareas.filter(t => t.fecha_creacion?.startsWith(dayStr) || t.fecha_limite?.startsWith(dayStr));
      const comps = tasksToday.filter(t => t.estado === 'completada').length;
      
      let intensityClass = 'bg-red-400/10 border border-red-400/5'; 
      
      if (tasksToday.length > 0) {
        if (comps > 0) {
           const ratio = comps / tasksToday.length;
           if (ratio >= 0.8) intensityClass = 'bg-emerald-500 heatmap-glow-high';
           else if (ratio >= 0.4) intensityClass = 'bg-emerald-400 heatmap-glow-high';
           else intensityClass = 'bg-emerald-300';
        } else {
           intensityClass = 'bg-red-400/30 border border-red-400/20';
        }
      }
      
      if (i === 0) {
        // Force today to be active white with primary dot if it has no specific class or preserve it
        intensityClass = `bg-white heatmap-active flex items-center justify-center relative`;
      }
      
      days.push({
        date: dayStr,
        isToday: i === 0,
        intensityClass,
        count: tasksToday.length
      });
    }
    return days;
  }, [tareas]);

  return (
    <div className="mt-20 w-full animate-in fade-in duration-500">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-transform duration-300 cursor-default group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 shadow-sm border border-blue-200/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">today</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Hoy</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{String(metrics.hoy).padStart(2, '0')}</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Tareas del Día</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-transform duration-300 cursor-default group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 shadow-sm border border-amber-200/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">En Marcha</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{String(metrics.enMarcha).padStart(2, '0')}</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Actividades Activas</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 border-red-200/40 hover:translate-y-[-4px] transition-transform duration-300 cursor-default group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 shadow-sm border border-red-200/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">priority_high</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Crítico</span>
          </div>
          <div>
            <h3 className="text-3xl font-headline font-bold text-red-500 tracking-tight">{String(metrics.retrasadas).padStart(2, '0')}</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Tareas Retrasadas</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-transform duration-300 cursor-default group">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shadow-sm border border-emerald-200/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">KPI</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{metrics.kpi}%</h3>
              <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-200/20 mx-2">Completado</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">Índice de Productividad Total</p>
          </div>
        </div>
        
      </div>

      {/* Estado Semanal Heatmap */}
      <div className="glass-panel rounded-[2.5rem] p-8 shadow-2xl mt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg font-headline font-bold text-slate-900 tracking-tight">Estado Semanal</h2>
            <p className="text-[11px] text-slate-500 font-medium">Progreso de actividades en los últimos 45 días</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-[3px] shadow-sm shadow-emerald-400/50"></span>
              <span className="text-[11px] text-slate-600 font-bold tracking-tight">Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400/30 rounded-[3px] border border-red-400/20"></span>
              <span className="text-[11px] text-slate-600 font-bold tracking-tight">Asignado</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 max-w-4xl">
          {heatmap.map((day) => (
            <div 
              key={day.date} 
              title={`${day.date}: ${day.count} tareas`}
              className={`heatmap-square ${day.intensityClass}`}
            >
              {day.isToday && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Panel;
