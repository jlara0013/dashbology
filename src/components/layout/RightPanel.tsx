import { Card } from '../ui/Card';

export function RightPanel() {
  return (
    <aside className="w-[320px] hidden xl:flex flex-col h-screen border-l border-white/20 bg-white/30 backdrop-blur-[20px] shadow-[-8px_0_32px_rgba(0,0,0,0.02)]">
      <div className="p-6 h-full overflow-y-auto">
        <h3 className="font-headline font-semibold text-lg text-slate-800 mb-6">Productividad</h3>
        
        <div className="space-y-6">
          <Card glass className="p-5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-label text-slate-500">Índice semanal</span>
              <span className="text-2xl font-display font-bold text-primary-container">87%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
              <div className="bg-primary-container h-1.5 rounded-full w-[87%]"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">+5% respecto a la semana pasada</p>
          </Card>

          <div>
            <h4 className="font-label text-sm text-slate-600 mb-4 uppercase tracking-wider">Actividad Reciente</h4>
            <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-white/60">
              
              <div className="relative">
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-tertiary-fixed border-2 border-white shadow-sm z-10" />
                <p className="text-sm font-medium text-slate-800">Cierre de mes Q1 finalizado</p>
                <p className="text-xs text-slate-500 mt-1">Hace 2 horas</p>
              </div>

              <div className="relative">
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary-container border-2 border-white shadow-sm z-10" />
                <p className="text-sm font-medium text-slate-800">Nueva tarea asignada por Ana</p>
                <p className="text-xs text-slate-500 mt-1">Revisar reporte de métricas</p>
                <p className="text-xs text-slate-400 mt-1">Hace 4 horas</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
