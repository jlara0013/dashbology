import { useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';

export default function Reportes() {
  const { tareas, isLoading } = useTareas();

  // Aggregation Logic
  const stats = useMemo(() => {
    const total = tareas.length;
    let completadas = 0;
    let pendientes = 0;
    let enProgreso = 0;
    
    let criticas = 0;
    let vencidas = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    // Priority + Category maps
    const categoryCount: Record<string, number> = {};
    const projectCount: Record<string, { total: number; completadas: number }> = {};
    
    // Tareas con fecha_limite <= hoy que no estén completadas
    const tareasVencidasArr = [] as typeof tareas;

    tareas.forEach(t => {
      // Estado
      if (t.estado === 'completada') completadas++;
      if (t.estado === 'pendiente') pendientes++;
      if (t.estado === 'en_progreso') enProgreso++;

      // Prioridad
      if (t.prioridad === 'critica') criticas++;

      // Vencimientos
      if (t.estado !== 'completada' && t.fecha_limite && t.fecha_limite < todayStr) {
        vencidas++;
        tareasVencidasArr.push(t);
      }

      // Categoría
      const cat = t.categoria || 'sin_categoria';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;

      // Proyecto
      if (t.proyecto_id) {
        if (!projectCount[t.proyecto_id]) {
          projectCount[t.proyecto_id] = { total: 0, completadas: 0 };
        }
        projectCount[t.proyecto_id].total++;
        if (t.estado === 'completada') {
          projectCount[t.proyecto_id].completadas++;
        }
      }
    });

    const completionRate = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    // Format categories for easier iteration
    const categoriesFormatted = Object.entries(categoryCount)
      .map(([name, val]) => ({ name, val, percentage: Math.round((val / total) * 100) }))
      .sort((a, b) => b.val - a.val);

    return {
      total,
      completadas,
      pendientes,
      enProgreso,
      criticas,
      vencidas,
      completionRate,
      categoriesFormatted,
      tareasVencidasArr: tareasVencidasArr.sort((a,b) => (a.fecha_limite || '').localeCompare(b.fecha_limite || '')),
      projectCount
    };
  }, [tareas]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse mt-20">
         <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
         <p className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Generando Analítica...</p>
      </div>
    );
  }

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Centro de Inteligencia</h1>
        <p className="text-slate-500 font-medium mt-2">Métricas globales y radiografía de ejecución de tu portafolio de tareas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Tasa de Completitud */}
        <div className="glass-panel p-6 rounded-[2.5rem] bg-gradient-to-br from-[#4facfe]/10 to-[#6b47ff]/10 border border-indigo-200/50 shadow-lg shadow-indigo-500/10 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-white/60 rounded-2xl text-primary shadow-sm">
               <span className="material-symbols-outlined text-2xl">monitoring</span>
             </div>
             <span className="px-3 py-1 bg-white/50 border border-white/60 rounded-full text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Global</span>
           </div>
           <div>
              <h3 className="text-4xl font-headline font-black text-slate-900 tracking-tight">{stats.completionRate}%</h3>
              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider mt-1">Tasa de Completitud</p>
           </div>
        </div>

        {/* Criticas */}
        <div className="glass-panel p-6 rounded-[2.5rem] border border-red-200/50 bg-red-50/50 shadow-lg flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm">
               <span className="material-symbols-outlined text-2xl">priority_high</span>
             </div>
             <span className="text-[10px] uppercase font-bold text-red-500 tracking-widest">Atención</span>
           </div>
           <div>
              <h3 className="text-4xl font-headline font-black text-red-600 tracking-tight">{stats.criticas}</h3>
              <p className="text-[11px] text-red-500/80 font-bold uppercase tracking-wider mt-1">Tareas Críticas</p>
           </div>
        </div>

        {/* Vencidas */}
        <div className="glass-panel p-6 rounded-[2.5rem] border border-amber-200/50 bg-amber-50/50 shadow-lg flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shadow-sm">
               <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
             </div>
             <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Riesgo</span>
           </div>
           <div>
              <h3 className="text-4xl font-headline font-black text-amber-600 tracking-tight">{stats.vencidas}</h3>
              <p className="text-[11px] text-amber-500/80 font-bold uppercase tracking-wider mt-1">Entregas Vencidas</p>
           </div>
        </div>

        {/* Volumen */}
        <div className="glass-panel p-6 rounded-[2.5rem] bg-white/40 border border-white/50 shadow-lg flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 shadow-sm">
               <span className="material-symbols-outlined text-2xl">layers</span>
             </div>
             <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Volumen</span>
           </div>
           <div>
              <h3 className="text-4xl font-headline font-black text-slate-800 tracking-tight">{stats.total}</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Total Registrado</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Distribución de Tareas */}
        <div className="glass-panel p-8 rounded-[2.5rem] bg-white/20 shadow-xl border border-white/40 flex flex-col h-[400px]">
          <h2 className="text-lg font-headline font-black text-slate-800 tracking-tight mb-6">Estado del Sistema</h2>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">Completadas ({stats.completadas})</span>
                <span className="text-sm font-black text-emerald-700">{stats.completionRate}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${stats.completionRate}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">En Progreso ({stats.enProgreso})</span>
                <span className="text-sm font-black text-blue-700">{stats.total > 0 ? Math.round((stats.enProgreso / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${stats.total > 0 ? (stats.enProgreso / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">Pendientes ({stats.pendientes})</span>
                <span className="text-sm font-black text-slate-700">{stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${stats.total > 0 ? (stats.pendientes / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Tasks List */}
        <div className="glass-panel p-8 rounded-[2.5rem] bg-white/20 shadow-xl border border-white/40 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-headline font-black text-slate-800 tracking-tight">Atención Requerida</h2>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full">{stats.tareasVencidasArr.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
            {stats.tareasVencidasArr.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">check_circle</span>
                <p className="text-sm font-bold text-slate-500">Nada vencido.</p>
              </div>
            ) : (
              stats.tareasVencidasArr.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-white/70 border border-red-100 hover:border-red-300 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate pr-4">{t.titulo}</h4>
                    <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest shrink-0">Vencida</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Debió entregarse el: <strong className="text-slate-700">{t.fecha_limite}</strong>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
