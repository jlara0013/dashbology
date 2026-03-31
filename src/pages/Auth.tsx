import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setError('Revisa tu correo para verificar la cuenta.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* Background blobs handled by body::before / body::after in index.css */}

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-[2.5rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden">
          {/* Internal gradient shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="material-symbols-outlined text-white text-3xl">dashboard_customize</span>
            </div>
            <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight mb-2">Dashbology</h1>
            <p className="text-sm text-slate-500 font-medium px-4">
              {mode === 'login' ? 'Bienvenido de nuevo a tu centro de control.' : 'Únete a la plataforma de gestión premium.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className={`p-4 rounded-2xl text-xs font-bold ${error.includes('Revisa tu correo') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 pl-1">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  required
                  className="w-full bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 pl-11 pr-4 py-3.5 placeholder:text-slate-400 font-medium outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 pl-1">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 pl-11 pr-4 py-3.5 placeholder:text-slate-400 font-medium outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                className="w-full py-4 text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors inline-block"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] font-medium text-slate-400">
          <p>Al acceder, aceptas nuestros Términos de Servicio y Condiciones.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[10px]">shield</span>
            Tecnología segura de Dashbology
          </p>
        </div>
      </motion.div>
    </div>
  );
}
