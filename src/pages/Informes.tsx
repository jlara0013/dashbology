import { useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useSeguimientos } from '../hooks/useSeguimientos';

// ─── Mini SVG donut chart ───────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="w-32 h-32 rounded-full bg-slate-100/60 flex items-center justify-center text-xs text-slate-400 font-bold">Sin datos</div>;

  const r = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth="12"
          strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
          strokeDashoffset={-arc.offset}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ─── Vertical bar ───────────────────────────────────────────────────────────
function VBar({ label, value, max, sublabel }: { label: string; value: number; max: number; sublabel?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-[11px] font-extrabold text-slate-700">{value}</span>
      <div className="w-full flex-1 flex items-end">
        <div className="w-full bg-slate-100 rounded-full overflow-hidden" style={{ height: '80px' }}>
          <div
            className="w-full rounded-full bg-gradient-to-t from-[#4facfe] to-[#6b47ff] transition-[height] duration-700"
            style={{ height: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 text-center leading-tight">{label}</span>
      {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Informes() {
  const { tareas } = useTareas();
  const { seguimientos } = useSeguimientos();

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = tareas.length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    const enProgreso = tareas.filter(t => t.estado === 'en_progreso').length;
    const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
    const vencidas = tareas.filter(t =>
      t.estado !== 'completada' && t.estado !== 'archivada' && t.fecha_limite && t.fecha_limite < todayStr
    ).length;
    const archivadas = tareas.filter(t => t.estado === 'archivada').length;
    const kpi = total > 0 ? Math.round((completadas / total) * 100) : 0;

    // By priority
    const byPriority = {
      critica: tareas.filter(t => t.prioridad === 'critica').length,
      alta: tareas.filter(t => t.prioridad === 'alta').length,
      media: tareas.filter(t => t.prioridad === 'media').length,
      baja: tareas.filter(t => t.prioridad === 'baja').length,
    };

    // By category
    const categories = ['urgente', 'reporte', 'recurrente', 'delegada', 'programada', 'fijada'] as const;
    const byCategory = Object.fromEntries(
      categories.map(c => [c, tareas.filter(t => t.categoria === c).length])
    ) as Record<typeof categories[number], number>;

    // Last 6 months: completed tasks
    const months: { label: string; key: string; completed: number; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7); // "2026-01"
      const label = d.toLocaleDateString('es-MX', { month: 'short' });
      const monthTareas = tareas.filter(t => t.fecha_creacion?.startsWith(key));
      months.push({
        label,
        key,
        completed: monthTareas.filter(t => t.estado === 'completada').length,
        total: monthTareas.length,
      });
    }

    // Seguimientos
    const segPendientes = seguimientos.filter(s => !s.completado).length;
    const segCompletados = seguimientos.filter(s => s.completado).length;

    return {
      total, completadas, enProgreso, pendientes, vencidas, archivadas, kpi,
      byPriority, byCategory, months, segPendientes, segCompletados,
    };
  }, [tareas, seguimientos]);

  // 90-day heatmap
  const heatmap = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const tasksDay = tareas.filter(t => t.fecha_limite?.startsWith(dayStr));
      const comps = tasksDay.filter(t => t.estado === 'completada').length;
      let cls = 'bg-slate-100/60 border border-slate-200/30';
      if (tasksDay.length > 0) {
        const ratio = comps / tasksDay.length;
        if (ratio >= 0.8) cls = 'bg-emerald-500 shadow-sm shadow-emerald-400/40';
        else if (ratio >= 0.4) cls = 'bg-emerald-300';
        else cls = 'bg-red-300/50 border border-red-300/20';
      }
      if (i === 0) cls = 'bg-primary/20 border-2 border-primary/40';
      days.push({ date: dayStr, cls, count: tasksDay.length, comps });
    }
    return days;
  }, [tareas]);

  const maxPriority = Math.max(...Object.values(stats.byPriority), 1);
  const maxCategory = Math.max(...Object.values(stats.byCategory), 1);
  const maxMonth = Math.max(...stats.months.map(m => m.total), 1);

  const PRIORITY_COLORS = {
    critica: { bar: '#ef4444', icon: 'text-red-500', label: 'Crítica' },
    alta:    { bar: '#f59e0b', icon: 'text-amber-500', label: 'Alta' },
    media:   { bar: '#3b82f6', icon: 'text-blue-500', label: 'Media' },
    baja:    { bar: '#94a3b8', icon: 'text-slate-400', label: 'Baja' },
  };

  const CATEGORY_ICONS: Record<string, string> = {
    urgente: 'bolt', reporte: 'description', recurrente: 'autorenew',
    delegada: 'person_add', programada: 'schedule', fijada: 'push_pin',
  };

  const donutSegments = [
    { label: 'Completadas', value: stats.completadas, color: '#10b981' },
    { label: 'En Progreso', value: stats.enProgreso, color: '#3b82f6' },
    { label: 'Pendientes',  value: stats.pendientes, color: '#94a3b8' },
    { label: 'Vencidas',    value: stats.vencidas,   color: '#ef4444' },
    { label: 'Archivadas',  value: stats.archivadas, color: '#e2e8f0' },
  ];

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Informes y Métricas</h1>
        <p className="text-slate-500 font-medium mt-2">Visión global del rendimiento y estado de tus tareas.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tareas', value: stats.total, icon: 'checklist', color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-200/20' },
          { label: 'Completadas', value: stats.completadas, icon: 'task_alt', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200/20' },
          { label: 'Vencidas', value: stats.vencidas, icon: 'timer_off', color: 'text-red-500', bg: 'bg-red-500/10 border-red-200/20' },
          { label: 'KPI Global', value: `${stats.kpi}%`, icon: 'trending_up', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-200/20' },
        ].map(card => (
          <div key={card.label} className="glass-panel p-5 rounded-3xl flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl ${card.bg} border`}>
                <span className={`material-symbols-outlined text-lg ${card.color}`}>{card.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
            </div>
            <h3 className={`text-3xl font-headline font-black tracking-tight ${card.color}`}>{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts row 1: Donut + Priority bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut: Estado */}
        <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-5">Estado de Tareas</h2>
          <div className="flex items-center gap-8">
            <DonutChart segments={donutSegments} />
            <div className="flex-1 space-y-2.5">
              {donutSegments.map(seg => (
                seg.value > 0 && (
                  <div key={seg.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                      <span className="text-[12px] font-bold text-slate-600">{seg.label}</span>
                    </div>
                    <span className="text-[12px] font-extrabold text-slate-800">{seg.value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Priority bars */}
        <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-5">Por Prioridad</h2>
          <div className="space-y-4">
            {(Object.entries(stats.byPriority) as [keyof typeof PRIORITY_COLORS, number][]).map(([p, v]) => (
              <div key={p} className="flex items-center gap-3">
                <span className="text-[11px] font-extrabold w-14 text-right" style={{ color: PRIORITY_COLORS[p].bar }}>{PRIORITY_COLORS[p].label}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-[width] duration-700 flex items-center pl-2"
                    style={{ width: `${Math.max((v / maxPriority) * 100, v > 0 ? 8 : 0)}%`, background: PRIORITY_COLORS[p].bar + '30', border: `1px solid ${PRIORITY_COLORS[p].bar}20` }}
                  />
                  {v > 0 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold" style={{ color: PRIORITY_COLORS[p].bar }}>
                      {v}
                    </span>
                  )}
                </div>
                {v === 0 && <span className="text-[11px] text-slate-300 font-bold">—</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2: Monthly trend + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly vertical bars */}
        <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-6">Actividad Mensual (6 meses)</h2>
          <div className="flex items-end gap-3 h-[120px]">
            {stats.months.map(m => (
              <VBar key={m.key} label={m.label} value={m.total} max={maxMonth} sublabel={m.completed > 0 ? `✓${m.completed}` : undefined} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest">Tareas creadas por mes · ✓ = completadas</p>
        </div>

        {/* Category breakdown */}
        <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-5">Por Categoría</h2>
          <div className="space-y-3">
            {(Object.entries(stats.byCategory) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([cat, v]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[15px] text-slate-400 flex-shrink-0 w-5">{CATEGORY_ICONS[cat]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[11px] font-bold text-slate-600 capitalize">{cat}</span>
                      <span className="text-[11px] font-extrabold text-slate-800">{v}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4facfe] to-[#6b47ff] transition-[width] duration-700"
                        style={{ width: `${(v / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Seguimientos mini-stat */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-200/20">
            <span className="material-symbols-outlined text-amber-600 text-xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Seguimientos Pendientes</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.segPendientes}</h3>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-200/20">
            <span className="material-symbols-outlined text-emerald-600 text-xl">fact_check</span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Seguimientos Completados</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.segCompletados}</h3>
          </div>
        </div>
      </div>

      {/* 90-day heatmap */}
      <div className="glass-panel rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Mapa de Actividad</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Últimos 90 días · verde = alta completitud · rojo = tareas sin completar</p>
          </div>
          <div className="flex gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-400/40" />
              <span className="text-[10px] text-slate-500 font-bold">Completado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-300/50 rounded-sm border border-red-300/20" />
              <span className="text-[10px] text-slate-500 font-bold">Pendiente</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {heatmap.map(day => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} tareas (${day.comps} completadas)`}
              className={`w-5 h-5 rounded-[4px] cursor-default transition-transform hover:scale-125 ${day.cls}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
