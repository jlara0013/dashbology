import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Database } from '../lib/types';

type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type InsertProyecto = Database['public']['Tables']['proyectos']['Insert'];

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchProyectos = useCallback(async () => {
    if (!session?.user.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('proyectos')
        .select('*')
        .order('nombre', { ascending: true });

      if (sbError) throw sbError;
      setProyectos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const createProyecto = async (proyecto: Partial<InsertProyecto>) => {
    try {
      if (!session?.user.id) throw new Error('Usuario no autenticado');
      
      const newProyecto = {
        ...proyecto,
        user_id: session.user.id
      };

      const { data, error: sbError } = await supabase
        .from('proyectos')
        .insert(newProyecto as InsertProyecto)
        .select()
        .single();

      if (sbError) throw sbError;
      setProyectos(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  return { proyectos, isLoading, error, fetchProyectos, createProyecto };
}
