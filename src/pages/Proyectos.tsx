import { useState } from 'react';
import { useProyectos } from '../hooks/useProyectos';
import { useTareas } from '../hooks/useTareas';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function Proyectos() {
  const { proyectos, isLoading, createProyecto } = useProyectos();
  const { tareas } = useTareas();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProyectoName, setNewProyectoName] = useState('');
  const [newProyectoDesc, setNewProyectoDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProyectoName.trim()) return;
    
    await createProyecto({
      nombre: newProyectoName,
      descripcion: newProyectoDesc
    });
    
    setIsCreating(false);
    setNewProyectoName('');
    setNewProyectoDesc('');
  };

  // Helper to calculate project progress
  const getProjectStats = (projectId: string) => {
    const projectTasks = tareas.filter(t => t.proyecto_id === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.estado === 'completada').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress };
  };

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Proyectos y Carpetas</h1>
          <p className="text-slate-500 font-medium mt-2">Agrupa tus tareas y visualiza el progreso global de cada iniciativa.</p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] hover:brightness-110 text-white px-6 py-3 rounded-full text-[12px] font-bold shadow-xl shadow-indigo-500/20 border-0"
          >
            <span className="material-symbols-outlined text-base">create_new_folder</span>
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="glass-panel p-6 rounded-[2.5rem] shadow-xl border border-white/50 bg-white/40 mb-8 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crear Nuevo Proyecto</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Nombre del proyecto (Ej. Auditoría 2026)"
                value={newProyectoName}
                onChange={(e) => setNewProyectoName(e.target.value)}
                required
                autoFocus
                className="w-full bg-white/70 border-white/80 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-medium text-slate-700"
              />
            </div>
            <div>
              <textarea
                placeholder="Descripción opcional..."
                value={newProyectoDesc}
                onChange={(e) => setNewProyectoDesc(e.target.value)}
                className="w-full bg-white/70 border-white/80 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 font-medium text-slate-700 resize-none h-20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar Proyecto</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
         <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
            <p className="mt-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Cargando Proyectos...</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map(proyecto => {
            const stats = getProjectStats(proyecto.id);
            
            return (
              <Link to={`/proyectos/${proyecto.id}`} key={proyecto.id} className="block">
                <div className="glass-panel p-6 rounded-3xl shadow-lg border border-white/40 hover:-translate-y-1 transition-transform duration-300 group bg-white/20 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4facfe] to-[#6b47ff] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">folder</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/60 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-white/50">
                      {stats.total} Tareas
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-primary transition-colors">{proyecto.nombre}</h3>
                  <p className="text-xs text-slate-500 min-h-[40px] line-clamp-2">{proyecto.descripcion || 'Sin descripción'}</p>
                  
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Progreso</span>
                      <span className="text-lg font-black text-slate-800">{stats.progress}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#4facfe] to-[#6b47ff] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          
          {proyectos.length === 0 && !isCreating && (
             <div className="col-span-1 border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center opacity-70">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">folder_open</span>
                <p className="font-bold text-slate-600 mb-1">Aún no tienes proyectos</p>
                <p className="text-xs text-slate-500">Crea tu primer proyecto para agrupar tareas relacionadas.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
