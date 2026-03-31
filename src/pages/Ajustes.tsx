import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

interface Perfil {
  nombre_completo: string;
  rol: string;
  equipo: string;
}

type Section = 'perfil' | 'cuenta' | 'sesion';

export default function Ajustes() {
  const { user, signOut } = useAuth();

  const [activeSection, setActiveSection] = useState<Section>('perfil');
  const [perfil, setPerfil] = useState<Perfil>({ nombre_completo: '', rol: '', equipo: '' });
  const [isLoadingPerfil, setIsLoadingPerfil] = useState(true);
  const [isSavingPerfil, setIsSavingPerfil] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('usuarios')
      .select('nombre_completo, rol, equipo')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setPerfil({ nombre_completo: data.nombre_completo ?? '', rol: data.rol ?? '', equipo: data.equipo ?? '' });
        setIsLoadingPerfil(false);
      });
  }, [user]);

  const handleSavePerfil = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPerfil(true);
    setPerfilMsg(null);
    const { error } = await supabase
      .from('usuarios')
      .upsert({ id: user.id, ...perfil });

    setIsSavingPerfil(false);
    if (error) setPerfilMsg({ type: 'error', text: 'Error al guardar: ' + error.message });
    else setPerfilMsg({ type: 'ok', text: 'Perfil actualizado correctamente.' });
  };

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);
    if (error) setPasswordMsg({ type: 'error', text: 'Error: ' + error.message });
    else {
      setPasswordMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: 'perfil', label: 'Perfil', icon: 'person' },
    { id: 'cuenta', label: 'Cuenta', icon: 'manage_accounts' },
    { id: 'sesion', label: 'Sesión', icon: 'logout' },
  ];

  const inputClass = "w-full bg-white/70 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium text-sm placeholder:text-slate-500";

  return (
    <div className="mt-20 space-y-8 animate-in fade-in duration-500 w-full max-w-[860px]">
      <div>
        <h1 className="text-3xl font-headline font-black text-slate-800 tracking-tight">Ajustes</h1>
        <p className="text-slate-500 font-medium mt-2">Administra tu perfil y preferencias de la cuenta.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar nav */}
        <div className="glass-panel rounded-2xl p-2 flex flex-col gap-1 w-44 flex-shrink-0">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold text-left transition-colors duration-200 ${
                activeSection === s.id
                  ? 'bg-white shadow-md text-primary'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* ── Perfil ── */}
          {activeSection === 'perfil' && (
            <div className="glass-panel p-7 rounded-3xl border border-white/50 bg-white/30">
              <h2 className="text-base font-extrabold text-slate-800 mb-1">Información Personal</h2>
              <p className="text-xs text-slate-500 mb-6">Visible dentro de tu espacio de trabajo.</p>

              {isLoadingPerfil ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                  Cargando perfil...
                </div>
              ) : (
                <form onSubmit={handleSavePerfil} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Nombre Completo</label>
                    <input
                      type="text"
                      value={perfil.nombre_completo}
                      onChange={e => setPerfil(p => ({ ...p, nombre_completo: e.target.value }))}
                      placeholder="Tu nombre completo"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Rol / Cargo</label>
                      <input
                        type="text"
                        value={perfil.rol}
                        onChange={e => setPerfil(p => ({ ...p, rol: e.target.value }))}
                        placeholder="Ej. Gerente de Proyecto"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Equipo / Área</label>
                      <input
                        type="text"
                        value={perfil.equipo}
                        onChange={e => setPerfil(p => ({ ...p, equipo: e.target.value }))}
                        placeholder="Ej. Operaciones"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {perfilMsg && (
                    <p className={`text-xs font-bold px-3 py-2 rounded-xl ${perfilMsg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {perfilMsg.text}
                    </p>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" disabled={isSavingPerfil}>
                      {isSavingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── Cuenta ── */}
          {activeSection === 'cuenta' && (
            <div className="space-y-5">
              {/* Email (read-only) */}
              <div className="glass-panel p-7 rounded-3xl border border-white/50 bg-white/30">
                <h2 className="text-base font-extrabold text-slate-800 mb-1">Correo Electrónico</h2>
                <p className="text-xs text-slate-500 mb-5">Tu correo de acceso. Contacta soporte para cambiarlo.</p>
                <div className="flex items-center gap-3 bg-slate-100/60 px-4 py-3 rounded-xl">
                  <span className="material-symbols-outlined text-slate-500 text-base">mail</span>
                  <span className="text-sm font-semibold text-slate-600">{user?.email}</span>
                  <span className="ml-auto px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold rounded-lg border border-emerald-200/20 uppercase tracking-widest">Verificado</span>
                </div>
              </div>

              {/* Change password */}
              <div className="glass-panel p-7 rounded-3xl border border-white/50 bg-white/30">
                <h2 className="text-base font-extrabold text-slate-800 mb-1">Cambiar Contraseña</h2>
                <p className="text-xs text-slate-500 mb-5">Mínimo 6 caracteres.</p>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                  </div>

                  {passwordMsg && (
                    <p className={`text-xs font-bold px-3 py-2 rounded-xl ${passwordMsg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {passwordMsg.text}
                    </p>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" disabled={isChangingPassword}>
                      {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Sesión ── */}
          {activeSection === 'sesion' && (
            <div className="glass-panel p-7 rounded-3xl border border-white/50 bg-white/30">
              <h2 className="text-base font-extrabold text-slate-800 mb-1">Sesión Activa</h2>
              <p className="text-xs text-slate-500 mb-6">Cerrar sesión te desconectará de todos los dispositivos.</p>

              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-white/60 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4facfe] to-[#6b47ff] flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20">
                  {user?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user?.email}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Sesión activa</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-2xl text-sm font-bold border border-red-500/15 transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
