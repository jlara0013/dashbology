import { useState, useEffect, useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useUsuarios } from '../hooks/useUsuarios';
import { useProyectos } from '../hooks/useProyectos';
import { supabase } from '../lib/supabase';

export default function Reportes() {
  const { tareas, isLoading } = useTareas();
  const { usuarios } = useUsuarios();
  const { proyectos } = useProyectos();

  const [activeView, setActiveView] = useState<'tareas' | 'tiempo'>('tareas');
  const [registros, setRegistros] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('registros_tiempo')
      .select('duracion_minutos, tarea_id, user_id, fecha, tareas(proyecto_id, titulo)')
      .then(({data}) => {
        if (data) setRegistros(data);
      });
  }, []);

  // Aggregation Logic - Tareas
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

  // Aggregation Logic - Tiempos
  const timeStats = useMemo(() => {
    let totalMinutos = 0;
    const userMins: Record<string, number> = {};
    const projectMins: Record<string, number> = {};

    registros.forEach(r => {
      totalMinutos += r.duracion_minutos;
      userMins[r.user_id] = (userMins[r.user_id] || 0) + r.duracion_minutos;
      
      const pId = r.tareas?.proyecto_id || 'general';
      projectMins[pId] = (projectMins[pId] || 0) + r.duracion_minutos;
    });

    const userLeaderboard = Object.entries(userMins).map(([uid, mins]) => {
      const u = usuarios.find(x => x.id === uid);
      return { id: uid, nombre: u?.nombre_completo || 'Usuario Oculto', mins };
    }).sort((a,b) => b.mins - a.mins);

    const projectLeaderboard = Object.entries(projectMins).map(([pid, mins]) => {
      if (pid === 'general') return { id: pid, nombre: 'Sin Proyecto (General)', mins };
      const p = proyectos.find(x => x.id === pid);
      return { id: pid, nombre: p?.nombre || 'Proyecto Eliminado', mins };
    }).sort((a,b) => b.mins - a.mins);

    return { totalMinutos, userLeaderboard, projectLeaderboard };
  }, [registros, usuarios, proyectos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse mt-20">
         <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
         <p className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Generando Analítica...</p>
      </div>
    );
  }

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Centro de Inteligencia</h1>
          <p className="text-slate-500 font-medium mt-2">Métricas globales y radiografía de ejecución de tu portafolio.</p>
        </div>
        
        <div className="flex bg-white/40 p-1 rounded-2xl border border-white/60 backdrop-blur-md shadow-sm w-fit">
          <button 
            onClick={() => setActiveView('tareas')}
            className={`px-6 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeView === 'tareas' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tablero de Tareas
          </button>
          <button 
            onClick={() => setActiveView('tiempo')}
            className={`px-6 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeView === 'tiempo' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Analítica de Tiempo
          </button>
        </div>
      </div>

      {activeView === 'tareas' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500 mb-8">
            {/* Card: Tasa de Completitud */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-[transform] duration-300 cursor-default overflow-hidden relative">
              <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[80px] text-blue-500/5 select-none pointer-events-none">monitoring</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Global</span>
              <div>
                <h3 className="text-4xl font-headline font-black text-slate-900 tracking-tight tabular-nums">{stats.completionRate}%</h3>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Tasa de Completitud</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-b-3xl" />
            </div>

            {/* Card: Críticas */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-[transform] duration-300 cursor-default overflow-hidden relative">
              <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[80px] text-red-500/5 select-none pointer-events-none">priority_high</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Atención</span>
              <div>
                <h3 className="text-4xl font-headline font-black text-red-500 tracking-tight tabular-nums">{String(stats.criticas).padStart(2, '0')}</h3>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Tareas Críticas</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-400 to-red-600 rounded-b-3xl" />
            </div>

            {/* Card: Vencidas */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-[transform] duration-300 cursor-default overflow-hidden relative">
              <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[80px] text-amber-500/5 select-none pointer-events-none">hourglass_empty</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Riesgo</span>
              <div>
                <h3 className="text-4xl font-headline font-black text-amber-500 tracking-tight tabular-nums">{String(stats.vencidas).padStart(2, '0')}</h3>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Entregas Vencidas</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-b-3xl" />
            </div>

            {/* Card: Volumen */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-36 hover:translate-y-[-4px] transition-[transform] duration-300 cursor-default overflow-hidden relative">
              <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[80px] text-emerald-500/5 select-none pointer-events-none">layers</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Volumen</span>
              <div>
                <h3 className="text-4xl font-headline font-black text-slate-900 tracking-tight tabular-nums">{String(stats.total).padStart(2, '0')}</h3>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Total Registrado</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-b-3xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
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
        </>
      ) : (
        /* VISTA DE TIEMPO */
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 col-span-1 md:col-span-3 lg:col-span-1 relative overflow-hidden">
               <div className="absolute -right-10 -top-10 text-[150px] material-symbols-outlined opacity-10 pointer-events-none">schedule</div>
               <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-100 mb-2">Total Horas Productivas</h3>
               <div className="text-6xl font-headline font-black tracking-tight mt-4">
                 {Math.floor(timeStats.totalMinutos / 60)}<span className="text-2xl opacity-70">h</span> {timeStats.totalMinutos % 60}<span className="text-2xl opacity-70">m</span>
               </div>
               <p className="text-sm font-medium text-indigo-100 mt-6">Cronometradas históricamente en tu infraestructura.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Esfuerzo por Usuario */}
            <div className="glass-panel p-8 rounded-[2.5rem] bg-white/30 shadow-xl border border-white/50 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-headline font-black text-slate-800 tracking-tight flex items-center gap-2">
                   <span className="material-symbols-outlined text-indigo-500">group</span>
                   Esfuerzo por Miembro
                </h2>
              </div>
              <div className="flex-1 space-y-4">
                {timeStats.userLeaderboard.length === 0 && (
                   <p className="text-sm text-slate-500 italic mt-10 text-center pr-4">No hay registros de tiempo todavía.</p>
                )}
                {timeStats.userLeaderboard.map((user, index) => {
                  const maxMins = timeStats.userLeaderboard[0].mins;
                  const ratio = (user.mins / maxMins) * 100;
                  return (
                    <div key={user.id} className="relative">
                      <div className="flex justify-between items-end mb-1 relative z-10 px-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">#{index + 1}</span>
                          {user.nombre}
                        </span>
                        <span className="text-xs font-black text-indigo-600">{formatHours(user.mins)}</span>
                      </div>
                      <div className="h-8 w-full bg-white/40 rounded-xl overflow-hidden relative">
                        <div 
                          className="absolute inset-y-0 left-0 bg-indigo-100 border-r-2 border-indigo-400 rounded-l-xl transition-all duration-1000" 
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Consumo por Proyecto */}
            <div className="glass-panel p-8 rounded-[2.5rem] bg-white/30 shadow-xl border border-white/50 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-headline font-black text-slate-800 tracking-tight flex items-center gap-2">
                   <span className="material-symbols-outlined text-purple-500">folder_open</span>
                   Consumo por Iniciativa
                </h2>
              </div>
              <div className="flex-1 space-y-4">
                {timeStats.projectLeaderboard.length === 0 && (
                   <p className="text-sm text-slate-500 italic mt-10 text-center pr-4">No hay datos de consumo asociados a proyectos.</p>
                )}
                {timeStats.projectLeaderboard.map((proj) => {
                  const maxMins = timeStats.projectLeaderboard[0].mins;
                  const ratio = (proj.mins / maxMins) * 100;
                  return (
                    <div key={proj.id} className="relative">
                      <div className="flex justify-between items-end mb-1 relative z-10 px-2">
                        <span className="text-xs font-bold text-slate-700 truncate pr-4" title={proj.nombre}>{proj.nombre}</span>
                        <span className="text-xs font-black text-purple-600 shrink-0">{formatHours(proj.mins)}</span>
                      </div>
                      <div className="h-8 w-full bg-white/40 rounded-xl overflow-hidden relative">
                        <div 
                          className="absolute inset-y-0 left-0 bg-purple-100 border-r-2 border-purple-400 rounded-l-xl transition-all duration-1000" 
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
