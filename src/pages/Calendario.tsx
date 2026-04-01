import { useState, useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useModal } from '../context/ModalContext';
import { TaskHistoryPanel } from '../components/ui/TaskHistoryPanel';
import type { Database } from '../lib/types';

type Tarea = Database['public']['Tables']['tareas']['Row'];

export default function Calendario() {
  const { tareas, isLoading } = useTareas();
  const { openTaskModal } = useModal();
  
  // View State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // History Panel State
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Month navigation
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate Calendar Grid (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // JS getDay(): 0 is Sunday. We want Monday = 0
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // If Sunday

    const daysInMonth = lastDayOfMonth.getDate();
    
    // Previous month trailing days
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Fill previous month empty slots
    for (let i = 0; i < startingDayOfWeek; i++) {
       const day = prevMonthDays - startingDayOfWeek + i + 1;
       const d = new Date(year, month - 1, day);
       days.push({
         date: d,
         dateStr: d.toISOString().split('T')[0],
         isCurrentMonth: false,
         isToday: d.toDateString() === new Date().toDateString()
       });
    }
    
    // Fill current month
    for (let i = 1; i <= daysInMonth; i++) {
       const d = new Date(year, month, i);
       days.push({
         date: d,
         dateStr: d.toISOString().split('T')[0],
         isCurrentMonth: true,
         isToday: d.toDateString() === new Date().toDateString()
       });
    }
    
    // Fill next month leading slots to complete row of 7 (or 42 cells total)
    const remainingSlots = (Math.ceil(days.length / 7) * 7) - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
       const d = new Date(year, month + 1, i);
       days.push({
         date: d,
         dateStr: d.toISOString().split('T')[0],
         isCurrentMonth: false,
         isToday: d.toDateString() === new Date().toDateString()
       });
    }
    
    return days;
  }, [currentDate]);

  // Group Tasks By Date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Tarea[]>();
    tareas.forEach(t => {
      if (t.fecha_limite) {
        // Assume format is YYYY-MM-DD
        const dateStr = t.fecha_limite.split('T')[0];
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(t);
      }
    });
    return map;
  }, [tareas]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      
      {/* HEADER CONTROLS */}
      <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4facfe] to-[#6b47ff] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <div>
            <h1 className="text-2xl font-headline font-black text-slate-800 tracking-tight capitalize">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Calendario de Entregas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/40 p-1.5 rounded-full border border-white/50 backdrop-blur-md">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-slate-600 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button onClick={goToToday} className="px-4 text-[11px] font-bold text-slate-700 hover:text-primary transition-colors">
              Hoy
            </button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-slate-600 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <button 
            onClick={() => openTaskModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4facfe] to-[#6b47ff] hover:brightness-110 text-white px-6 py-3 rounded-full text-[11px] font-bold transition-[filter] shadow-lg shadow-indigo-500/20 border-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Programar
          </button>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden bg-white/20">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center animate-pulse">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
              <p className="mt-2 text-xs font-bold text-slate-500 tracking-widest uppercase">Cargando Tareas...</p>
            </div>
          </div>
        )}

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 lg:gap-4 mb-4">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
            <div key={day} className="text-center">
              <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                <span className="sm:hidden">{day.substring(0, 1)}</span>
                <span className="hidden sm:block">{day.substring(0, 3)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 auto-rows-[80px] sm:auto-rows-[140px] gap-2 lg:gap-4">
          {calendarDays.map((calDay, idx) => {
            const dayTasks = tasksByDate.get(calDay.dateStr) || [];
            
            return (
              <div 
                key={`${calDay.dateStr}-${idx}`}
                className={`flex flex-col p-2 sm:p-3 rounded-2xl sm:rounded-3xl border transition-[background-color,box-shadow,transform] duration-300 ${calDay.isToday ? 'bg-indigo-50/80 border-indigo-200 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] ring-2 ring-primary/20 ring-offset-2' : calDay.isCurrentMonth ? 'bg-white/60 border-white/80 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1' : 'bg-white/20 border-white/30 opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <span className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl sm:rounded-2xl text-[11px] sm:text-[13px] font-black tracking-tight ${calDay.isToday ? 'bg-gradient-to-br from-[#4facfe] to-[#6b47ff] text-white shadow-md shadow-indigo-500/30' : calDay.isCurrentMonth ? 'text-slate-800 bg-white/50' : 'text-slate-400'}`}>
                    {calDay.date.getDate()}
                  </span>
                  
                  {dayTasks.length > 0 && (
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-500 hidden sm:flex">
                      {dayTasks.length}
                    </div>
                  )}
                </div>

                {/* Mobile: colored dots per task */}
                <div className="flex flex-wrap gap-1 pt-1 sm:hidden">
                  {dayTasks.slice(0, 3).map(t => {
                    const isPrioridad = t.prioridad === 'critica' || t.prioridad === 'alta';
                    const isCompletada = t.estado === 'completada';
                    return (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTarea(t); setIsHistoryOpen(true); }}
                        className={`w-2 h-2 rounded-full cursor-pointer flex-shrink-0 ${isCompletada ? 'bg-emerald-400' : isPrioridad ? 'bg-red-400' : 'bg-indigo-400'}`}
                        title={t.titulo}
                      />
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" title={`+${dayTasks.length - 3} más`} />
                  )}
                </div>

                {/* Desktop: text chips */}
                <div className="hidden sm:flex flex-col flex-1 overflow-y-auto no-scrollbar space-y-1.5 pt-1">
                  {dayTasks.slice(0, 3).map(t => {
                    const isPrioridad = t.prioridad === 'critica' || t.prioridad === 'alta';
                    const isCompletada = t.estado === 'completada';
                    return (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTarea(t); setIsHistoryOpen(true); }}
                        className={`truncate text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-[box-shadow,transform,opacity] border ${isCompletada ? 'bg-emerald-50 text-emerald-600 border-emerald-100 line-through opacity-70 hover:opacity-100' : isPrioridad ? 'bg-red-50 text-red-600 border-red-100 hover:shadow-sm hover:shadow-red-500/20' : 'bg-white text-slate-700 border-slate-200 hover:shadow-sm hover:-translate-y-0.5'}`}
                        title={t.titulo}
                      >
                        {t.titulo}
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] font-bold text-slate-500 pl-1">
                      + {dayTasks.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskHistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        tarea={selectedTarea}
      />
    </div>
  );
}
