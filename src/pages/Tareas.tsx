const Tareas = () => {
  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px]">
      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
        <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all">Por Fecha</button>
        <button className="px-5 py-2.5 bg-white/40 text-slate-700 rounded-xl text-[11px] font-bold border border-white/50 hover:bg-white/60 transition-all">Retrasadas</button>
        <button className="px-5 py-2.5 bg-white/40 text-slate-700 rounded-xl text-[11px] font-bold border border-white/50 hover:bg-white/60 transition-all">Urgentes</button>
        <button className="px-5 py-2.5 bg-white/40 text-slate-700 rounded-xl text-[11px] font-bold border border-white/50 hover:bg-white/60 transition-all">Mis Tareas</button>
        <button className="px-5 py-2.5 bg-white/40 text-slate-700 rounded-xl text-[11px] font-bold border border-white/50 hover:bg-white/60 transition-all">Asignadas</button>
      </div>
      
      {/* Detailed List View */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/30 flex justify-between items-center bg-white/10">
          <h2 className="text-lg font-headline font-bold text-slate-900 tracking-tight">Tareas Activas</h2>
          <div className="flex gap-4 items-center">
            <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border border-primary/10">
              <span className="material-symbols-outlined text-base">add</span>
              Crear Tarea
            </button>
            <button className="p-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Nombre de la Tarea</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Proyecto</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Vencimiento</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Prioridad</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Responsables</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Estado</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {/* Row 1 */}
              <tr className="row-hover transition-all duration-300 cursor-pointer group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">radio_button_checked</span>
                    <span className="font-bold text-slate-900 text-[13px] tracking-tight">Rediseño de Interfaz v2</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[12px] text-slate-600 font-semibold">Sinergia Pro</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                    15 Oct, 2023
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 text-[9px] font-bold rounded-lg uppercase tracking-wider border border-blue-500/10">Media</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex -space-x-2">
                    <img alt="Usuario" className="w-7 h-7 rounded-lg border-2 border-white shadow-md ring-1 ring-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB02u8uRR2_qKO0C0b2opG5XvrO9NXWB0b4JtASWE_38gAtzF6_3r9YLQ4bLsHpVBJPcgrDMpxb_ioeITdqawg19dLMvPhi71qrzxtWzJ0V5BJ3fnHk2NSiVyNqSOQXHdZcmL60U6H7zXwem6a1edb0-kre4VyX5cI9cEBEaIgsZGkX6r_9zeA28z-Juu5yUTW26J3HjOgSyO9DS2MlXR-ENk1CLSZXxOEQL7OJEeyW2efi9P237mlg5sYJdeWgx6hYiEDwAxmKHL4j" />
                    <img alt="Usuario" className="w-7 h-7 rounded-lg border-2 border-white shadow-md ring-1 ring-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9wHhI69gP5RsO12yr-6EENvnzn5oleVPjv8TsDdc_bYL9d2-3-52E6xdR6T-YEIfK1RgcvP1Pe5RnZOjapTcjOJXSQnvNS612nXwj6vh5etJqJVyEfGTrkqCQnYq6jJQNDv4-MP2aXJpdlzEnJFvqoqyjGOZUq7uwd5GDGLeCm1v6rmcM-qzDSvmB-MnGkpYusy9RNclNENstAyV6u0KvWYiVRPjv_kPgSA1jvJIXKiknQkLHRygFZUy5zFPaEPKvaLhhUvIhRvm2" />
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 status-progreso text-[9px] font-bold rounded-lg uppercase tracking-wider">En Progreso</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-300 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="row-hover transition-all duration-300 cursor-pointer group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500 text-lg">priority_high</span>
                    <span className="font-bold text-slate-900 text-[13px] tracking-tight">Auditoría de Accesibilidad</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[12px] text-slate-600 font-semibold">Infraestructura</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-red-500">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    Hoy
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[9px] font-bold rounded-lg uppercase tracking-wider border border-red-500/10">Urgente</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex">
                    <img alt="Usuario" className="w-7 h-7 rounded-lg border-2 border-white shadow-md ring-1 ring-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp2epE7jibjwThcNlBKkGThSvngwbbYAWVREKbAOCSDfdeJz20CNs_7Tbh5hVmQvUDWp_QLX0SHDew14V_R-vVNSHYBlnGNYyczBSMr_yofelIhzL8KFLuQO1virq6eTNv2-wPs6jjpt-cpNXMsZAuJE4STG03Q9TiykW5ymZPNp5WBL_eGo6ShFupVanXIMfw5YQSKa--8yLjRYuC13daOqtDsfWoxmo1AcFOE-EAXOxHgHz9DpNKTc6lzdNP8C-yFN8dZqRv6rQo" />
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 status-retrasada text-[9px] font-bold rounded-lg uppercase tracking-wider">Retrasada</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-300 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="row-hover transition-all duration-300 cursor-pointer group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                    <span className="font-bold text-slate-900 text-[13px] tracking-tight">Feedback de Stakeholders</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[12px] text-slate-600 font-semibold">Estrategia 2024</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                    18 Oct, 2023
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-bold rounded-lg uppercase tracking-wider border border-amber-500/10">Alta</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex -space-x-2">
                    <img alt="Usuario" className="w-7 h-7 rounded-lg border-2 border-white shadow-md ring-1 ring-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBGh0BVG_QJvyIZ5M_ZNuPh90LJSCSNNhqi5N1qaicGkvcf-dnVOuNbhp8zMDQCLhVPBAzm7VDrx2y149nPYsYHYUrO_xqeYhvZrm_dy00U-QxsA6Y_uCgmNolOUM64cYisHIbJgrkbWQes9_0FDZcoo61Z60i7XF4fu3CnmTHjZMlk_dpbQpP41Cq94f9BA8QC2x8fe5a0dnzEDY3H59twdzWJ8I4e-hgGfezU-udpvPhiarHLIGpGBXvSNSwN5KpmiP96NF96kEM" />
                    <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-extrabold text-slate-500 shadow-sm ring-1 ring-slate-200">+3</div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-slate-500/10 text-slate-600 text-[9px] font-bold rounded-lg uppercase tracking-wider border border-slate-500/10">Planificado</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-300 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="p-5 bg-white/5 border-t border-white/20 flex justify-center">
          <button className="text-[11px] font-extrabold text-primary hover:underline uppercase tracking-[0.2em] transition-all">Ver historial completo</button>
        </div>
      </div>
    </div>
  );
};

export default Tareas;
