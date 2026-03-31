import { useState, useMemo } from 'react';
import { useSeguimientos } from '../hooks/useSeguimientos';
import { useTareas } from '../hooks/useTareas';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

type TipoFiltro = 'todos' | 'recordatorio' | 'revision' | 'escalamiento' | 'nota';
type EstadoFiltro = 'pendientes' | 'completados';

const TIPO_CONFIG = {
  recordatorio: { label: 'Recordatorio', icon: 'alarm', color: 'bg-amber-500/10 text-amber-600 border-amber-500/15' },
  revision:     { label: 'Revisión',      icon: 'rate_review', color: 'bg-blue-500/10 text-blue-600 border-blue-500/15' },
  escalamiento: { label: 'Escalamiento',  icon: 'trending_up', color: 'bg-red-500/10 text-red-600 border-red-500/15' },
  nota:         { label: 'Nota',          icon: 'sticky_note_2', color: 'bg-slate-500/10 text-slate-600 border-slate-500/15' },
};

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isOverdue = (iso: string, completado: boolean) => {
  if (completado) return false;
  return new Date(iso) < new Date();
};

export default function Seguimientos() {
  const { seguimientos, isLoading, createSeguimiento, completeSeguimiento, deleteSeguimiento } = useSeguimientos();
  const { tareas } = useTareas();
  const { session } = useAuth();

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('pendientes');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    tarea_id: '',
    tipo: 'recordatorio' as Seguimiento['tipo'],
    nota: '',
    fecha_seguimiento: '',
  });

  type Seguimiento = typeof seguimientos[0];

  const filtered = useMemo(() => {
    return seguimientos.filter(s => {
      const estadoOk = estadoFiltro === 'pendientes' ? !s.completado : s.completado;
      const tipoOk = tipoFiltro === 'todos' || s.tipo === tipoFiltro;
      return estadoOk && tipoOk;
    });
  }, [seguimientos, estadoFiltro, tipoFiltro]);

  const pendingCount = seguimientos.filter(s => !s.completado).length;
  const overdueCount = seguimientos.filter(s => isOverdue(s.fecha_seguimiento, s.completado)).length;

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.tarea_id || !form.fecha_seguimiento) return;

    await createSeguimiento({
      tarea_id: form.tarea_id,
      tipo: form.tipo,
      nota: form.nota || null,
      fecha_seguimiento: new Date(form.fecha_seguimiento).toISOString(),
      posicion_cola: null,
      user_id: session!.user.id,
    });

    setForm({ tarea_id: '', tipo: 'recordatorio', nota: '', fecha_seguimiento: '' });
    setIsCreating(false);
    setEstadoFiltro('pendientes');
  };

  const getTareaTitle = (tareaId: string) => {
    return tareas.find(t => t.id === tareaId)?.titulo || 'Tarea no encontrada';
  };

  const getTareaRef = (tareaId: string) => {
    return tareas.find(t => t.id === tareaId)?.referencia || null;
  };

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Cola de Seguimientos</h1>
          <p className="text-slate-500 font-medium mt-2">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-500 font-bold">· {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] hover:brightness-110 text-white px-6 py-3 rounded-full text-[12px] font-bold shadow-xl shadow-indigo-500/20 border-0"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            Nuevo Seguimiento
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="glass-panel p-6 rounded-[2.5rem] shadow-xl border border-white/50 bg-white/40 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Programar Seguimiento</h3>
          <form onSubmit={handleCreate} className="space-y-4">

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Tarea vinculada</label>
              <select
                value={form.tarea_id}
                onChange={e => setForm(f => ({ ...f, tarea_id: e.target.value }))}
                required
                className="w-full bg-white/70 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium text-sm appearance-none"
              >
                <option value="">Seleccionar tarea...</option>
                {tareas.filter(t => t.estado !== 'completada' && t.estado !== 'archivada').map(t => (
                  <option key={t.id} value={t.id}>{t.referencia ? `[${t.referencia}] ` : ''}{t.titulo}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}
                  className="w-full bg-white/70 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium text-sm appearance-none"
                >
                  <option value="recordatorio">Recordatorio</option>
                  <option value="revision">Revisión</option>
                  <option value="escalamiento">Escalamiento</option>
                  <option value="nota">Nota</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={form.fecha_seguimiento}
                  onChange={e => setForm(f => ({ ...f, fecha_seguimiento: e.target.value }))}
                  required
                  className="w-full bg-white/70 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Nota (opcional)</label>
              <textarea
                value={form.nota}
                onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                placeholder="Agrega contexto o instrucciones para este seguimiento..."
                className="w-full bg-white/70 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 text-slate-700 font-medium text-sm resize-none h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Programar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Estado tabs */}
        <div className="glass-panel rounded-2xl p-1.5 flex gap-1">
          {(['pendientes', 'completados'] as EstadoFiltro[]).map(f => (
            <button
              key={f}
              onClick={() => setEstadoFiltro(f)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                estadoFiltro === f
                  ? 'bg-white shadow-md text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'pendientes' ? 'Pendientes' : 'Completados'}
            </button>
          ))}
        </div>

        {/* Tipo chips */}
        <div className="glass-panel rounded-2xl p-1.5 flex gap-1 flex-wrap">
          {(['todos', 'recordatorio', 'revision', 'escalamiento', 'nota'] as TipoFiltro[]).map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                tipoFiltro === t
                  ? 'bg-white shadow-md text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'todos' ? 'Todos' : TIPO_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
          <p className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Cargando seguimientos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 opacity-60">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">
            {estadoFiltro === 'completados' ? 'task_alt' : 'checklist'}
          </span>
          <p className="font-bold text-slate-600 mb-1">
            {estadoFiltro === 'completados' ? 'Ningún seguimiento completado aún' : 'No hay seguimientos pendientes'}
          </p>
          {estadoFiltro === 'pendientes' && (
            <p className="text-xs text-slate-500">Programa un seguimiento para no perder el hilo de tus tareas.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((seg, idx) => {
            const cfg = TIPO_CONFIG[seg.tipo];
            const overdue = isOverdue(seg.fecha_seguimiento, seg.completado);
            const tareaTitle = getTareaTitle(seg.tarea_id);
            const tareaRef = getTareaRef(seg.tarea_id);

            return (
              <div
                key={seg.id}
                className={`glass-panel rounded-2xl border transition-[box-shadow,transform,opacity] duration-300 group ${
                  seg.completado
                    ? 'bg-white/10 border-white/20 opacity-60'
                    : overdue
                    ? 'bg-red-50/40 border-red-200/40 hover:-translate-y-0.5'
                    : 'bg-white/20 border-white/40 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Position indicator */}
                  {!seg.completado && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-[11px] font-black text-slate-500 mt-0.5">
                      {idx + 1}
                    </div>
                  )}
                  {seg.completado && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Tipo badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>

                      {/* Overdue badge */}
                      {overdue && (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 border border-red-500/15">
                          Vencido
                        </span>
                      )}
                    </div>

                    {/* Task title */}
                    <p className="text-slate-800 font-semibold text-sm leading-snug truncate">
                      {tareaRef && (
                        <span className="text-slate-500 font-bold mr-1.5">{tareaRef}</span>
                      )}
                      {tareaTitle}
                    </p>

                    {/* Nota */}
                    {seg.nota && (
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">{seg.nota}</p>
                    )}

                    {/* Fecha */}
                    <p className={`text-[11px] font-bold mt-2 ${overdue ? 'text-red-700' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[13px] align-middle mr-1">schedule</span>
                      {formatFecha(seg.fecha_seguimiento)}
                    </p>
                  </div>

                  {/* Actions */}
                  {!seg.completado && (
                    <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => completeSeguimiento(seg.id)}
                        title="Marcar como completado"
                        className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                      </button>
                      <button
                        onClick={() => deleteSeguimiento(seg.id)}
                        title="Eliminar"
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
