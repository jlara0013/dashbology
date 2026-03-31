import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';
import { useAuth } from '../context/AuthContext';

type Usuario = Database['public']['Tables']['usuarios']['Row'];

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    upsertCurrentUser().then(fetchUsuarios);
  }, [user]);

  async function upsertCurrentUser() {
    if (!user) return;
    const displayName =
      user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
    // Ensures the logged-in user exists in public.usuarios even if
    // they signed up before the auth trigger was in place.
    await supabase
      .from('usuarios')
      .upsert({ id: user.id, nombre_completo: displayName }, { onConflict: 'id', ignoreDuplicates: true });
  }

  async function fetchUsuarios() {
    setIsLoading(true);
    const { data } = await supabase.from('usuarios').select('*').order('nombre_completo');
    setUsuarios(data || []);
    setIsLoading(false);
  }

  return { usuarios, isLoading };
}
