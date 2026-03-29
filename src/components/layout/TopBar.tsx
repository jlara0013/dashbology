export function TopBar() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-220px)] z-40 bg-white/10 backdrop-blur-3xl flex justify-between items-center px-8 h-16 border-b border-white/20 font-headline">
      <div className="flex items-center bg-white/40 border border-white/50 rounded-2xl px-4 py-2 w-80 focus-within:w-96 transition-all duration-300 shadow-sm">
        <span className="material-symbols-outlined text-slate-500 mr-3 text-lg">search</span>
        <input 
          className="bg-transparent border-none outline-none focus:ring-0 w-full text-slate-900 placeholder:text-slate-500 text-xs font-medium" 
          placeholder="Buscar tareas, proyectos o miembros..." 
          type="text" 
        />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-600 hover:bg-white/40 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border border-white shadow-sm shadow-error/50"></span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-white/40 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-300/30"></div>
        
        <div className="flex items-center gap-3 bg-white/40 pl-3 pr-1 py-1 rounded-2xl border border-white/50">
          <div className="text-right">
            <p className="font-bold text-slate-900 text-[12px] leading-tight">Alejandro Rivera</p>
            <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Director Creativo</p>
          </div>
          <img 
            alt="Foto de perfil" 
            className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-lg" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYtVGVmcpzaqvKiZ59MXV6_ekdXZi-UE4Zj0LPXM-erRDeij4vpCWull1dJx4AH5xojqr7wm-uccYlSotpJ4yVlkYvbuBFOBMpaPFI6mqoyBSngD8QjrR3lU9CQu--DN-33FaGclUtqmxFlNQP-rqpnW2f8ogSQePBi24BdwH5vfrx8hPDlKgQ3920Tl-cIbVYCmCjyerPDTYEwIxkcSpgb20ln8ymlZ8BcG5TtNzi6WUhnq_ZEAK_coP0ZGLWHkYoHBb29dUhTcho"
          />
        </div>
      </div>
    </header>
  );
}
