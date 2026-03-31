import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSeguimientos } from '../../hooks/useSeguimientos';
import type { Database } from '../../lib/types';
import { Button } from './Button';

type Tarea = Database['public']['Tables']['tareas']['Row'];

interface TaskHistoryPanelProps {
  tarea: Tarea | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskHistoryPanel({ tarea, isOpen, onClose }: TaskHistoryPanelProps) {
  const { user } = useAuth();
  const { seguimientos, isLoading, fetchTaskDetails, addSeguimiento, completeSeguimiento } = useSeguimientos();
  
  const [newNote, setNewNote] = useState('');
  const [newType, setNewType] = useState<'nota' | 'recordatorio' | 'revision' | 'escalamiento'>('nota');

  useEffect(() => {
    if (isOpen && tarea) {
      fetchTaskDetails(tarea.id);
    }
  }, [isOpen, tarea, fetchTaskDetails]);

  const handleAddSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tarea || !newNote.trim()) return;

    await addSeguimiento({
      tarea_id: tarea.id,
      user_id: user.id,
      tipo: newType,
      nota: newNote,
      fecha_seguimiento: new Date().toISOString(),
      posicion_cola: 0 // Optional default
    });
    setNewNote('');
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio': return { icon: 'notifications', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'revision': return { icon: 'preview', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'escalamiento': return { icon: 'warning', color: 'text-red-500', bg: 'bg-red-500/10' };
      default: return { icon: 'sticky_note_2', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && tarea && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-white/40 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1 block">Centro de Control</span>
                <h2 className="text-xl font-headline font-bold text-slate-900 tracking-tight leading-snug pr-4">{tarea.titulo}</h2>
                <div className="flex gap-2 mt-2">
                   <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{tarea.referencia || 'General'}</span>
                   <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{tarea.estado}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-slate-50/30">
              
              {/* Write New Note Form */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden p-4">
                <form onSubmit={handleAddSeguimiento}>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Registra una nueva acción o nota..."
                    rows={3}
                    className="w-full text-sm font-medium text-slate-700 placeholder:text-slate-400 bg-transparent border-none outline-none resize-none px-2 py-1 focus-visible:ring-2 focus-visible:ring-primary/20 rounded"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                    <select
                      value={newType}
                      onChange={(e: any) => setNewType(e.target.value)}
                      className="text-xs font-bold text-slate-500 bg-slate-50 border-none outline-none rounded-lg px-2 py-1 cursor-pointer hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <option value="nota">📝 Observación</option>
                      <option value="recordatorio">🔔 Recordatorio</option>
                      <option value="revision">👀 Revisión QC</option>
                      <option value="escalamiento">⚠️ Escalamiento</option>
                    </select>
                    
                    <Button type="submit" variant="primary" disabled={!newNote.trim()} className="h-8 px-4 text-xs font-bold shadow-md shadow-primary/20">
                      Registrar
                    </Button>
                  </div>
                </form>
              </div>

              {/* Feed de Seguimientos */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 ml-1">Bitácora de Seguimientos ({seguimientos.length})</h3>
                {isLoading ? (
                  <p className="text-xs text-slate-400 font-medium">Cargando...</p>
                ) : seguimientos.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic">No hay registros manuales para esta tarea.</p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-5 before:w-[2px] before:bg-slate-100">
                    {seguimientos.map((seg) => {
                      const mode = getTypeIcon(seg.tipo);
                      return (
                        <div key={seg.id} className="relative flex items-start gap-4 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${mode.bg} ${mode.color}`}>
                            <span className="material-symbols-outlined text-[18px]">{mode.icon}</span>
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{seg.tipo}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{new Date(seg.fecha_seguimiento).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{seg.nota}</p>
                            
                            {!seg.completado && seg.tipo !== 'nota' && (
                              <button 
                                onClick={() => completeSeguimiento(seg.id)}
                                className="mt-3 text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                              >
                                Marcar Resuelto
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
