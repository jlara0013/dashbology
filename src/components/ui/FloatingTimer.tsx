import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeTracker } from '../../context/TimeTrackerContext';

export function FloatingTimer() {
  const { activeTimer, stopTimer, discardTimer } = useTimeTracker();
  const [elapsed, setElapsed] = useState('00:00:00');
  const [isFinishing, setIsFinishing] = useState(false);
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  // Update timer strictly every second
  useEffect(() => {
    if (!activeTimer || isFinishing) return;

    const interval = setInterval(() => {
      const start = new Date(activeTimer.startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isFinishing]);

  // Reset local state if timer is explicitly discarded remotely
  useEffect(() => {
    if (!activeTimer) {
      setIsFinishing(false);
      setNota('');
      setElapsed('00:00:00');
    }
  }, [activeTimer]);

  if (!activeTimer) return null;

  const handleStopClick = () => {
    setIsFinishing(true);
  };

  const handleCancelClick = () => {
    setIsFinishing(false); // go back to running
  };

  const handleSave = async () => {
    setSaving(true);
    await stopTimer(nota);
    setSaving(false);
    setIsFinishing(false);
    setNota('');
  };

  const handleDiscard = () => {
    discardTimer();
    setIsFinishing(false);
    setNota('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
      >
        <div className="glass-panel p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] border border-indigo-200/60 bg-white/70 backdrop-blur-xl min-w-[280px] overflow-hidden relative">
          
          {/* Subtle pulse background when running */}
          {!isFinishing && (
            <div className="absolute inset-0 rounded-3xl bg-indigo-400/5 animate-pulse pointer-events-none" />
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isFinishing ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
                 <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                   {isFinishing ? 'Guardando Registro' : 'Tracking Activo'}
                 </span>
               </div>
               <span className="text-xl font-headline font-black text-indigo-600 tracking-tight tabular-nums">
                 {elapsed}
               </span>
            </div>

            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-2 pr-4" title={activeTimer.tarea_titulo}>
              {activeTimer.tarea_titulo}
            </h4>

            {isFinishing ? (
              <div className="mt-3 border-t border-indigo-100 pt-3 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <input
                  type="text"
                  placeholder="¿Qué lograste? (opcional)"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="w-full bg-white/60 border border-indigo-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 text-[11px] font-bold transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Tiempo'}
                  </button>
                  <button 
                    onClick={handleCancelClick}
                    disabled={saving}
                    className="flex-none px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-bold transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    onClick={handleDiscard}
                    disabled={saving}
                    title="Descartar tiempo"
                    className="flex-none px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end mt-1">
                 <button
                   onClick={handleStopClick}
                   className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2.5 text-xs font-bold transition-transform active:scale-95 shadow-md"
                 >
                   <span className="material-symbols-outlined text-sm">stop</span>
                   Detener y Guardar
                 </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
