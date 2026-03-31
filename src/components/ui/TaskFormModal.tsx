import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTareas } from '../../hooks/useTareas';
import { useProyectos } from '../../hooks/useProyectos';
import { Button } from './Button';
import { Input } from './Input';
import type { Database } from '../../lib/types';

type InsertTarea = Database['public']['Tables']['tareas']['Insert'];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskFormModal({ isOpen, onClose }: TaskFormModalProps) {
  const { user } = useAuth();
  const { createTarea } = useTareas();
  const { proyectos } = useProyectos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<InsertTarea>>({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    categoria: 'programada',
    estado: 'pendiente',
    fecha_limite: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
    proyecto_id: null,

  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error } = await createTarea({
      ...formData as InsertTarea,
      user_id: user.id,
      // responsable_id is omitted since auth trigger for public.usuarios is not in place yet
    });

    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onClose(); // Reset and close
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        categoria: 'programada',
        estado: 'pendiente',
        fecha_limite: new Date().toISOString().split('T')[0],
        proyecto_id: null,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden glass-panel rounded-3xl shadow-2xl bg-white/60 border border-white/50"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-slate-900 tracking-tight">Nueva Tarea</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Ingresa los detalles para planificar el seguimiento.</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors border border-white/40 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-xs font-medium text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Título de la Tarea</label>
                    <Input
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej. Rediseño de flujos"
                      required
                      autoFocus
                      className="bg-white/50 border-white/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Prioridad</label>
                      <select
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-white/60 bg-white/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow appearance-none"
                      >
                        <option value="critica">Crítica</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Vencimiento</label>
                      <Input
                        type="date"
                        name="fecha_limite"
                        value={formData.fecha_limite}
                        onChange={handleChange}
                        required
                        className="bg-white/50 border-white/60 text-slate-700 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Categoría</label>
                      <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-white/60 bg-white/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow appearance-none"
                      >
                        <option value="urgente">Urgente</option>
                        <option value="reporte">Reporte</option>
                        <option value="recurrente">Recurrente</option>
                        <option value="programada">Programada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Estado Inicial</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-white/60 bg-white/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow appearance-none"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Proyecto (Opcional)</label>
                    <select
                      name="proyecto_id"
                      value={formData.proyecto_id || ''}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-white/60 bg-white/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow appearance-none"
                    >
                      <option value="">Ninguno</option>
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Descripción corta (Opcional)</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion || ''}
                      onChange={handleChange}
                      placeholder="Notas adicionales..."
                      rows={2}
                      className="w-full p-4 rounded-xl border border-white/60 bg-white/50 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-shadow resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="px-6">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    {loading ? 'Guardando...' : 'Crear Tarea'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
