import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';

type Seguimiento = Database['public']['Tables']['seguimientos']['Row'];
type Historial = Database['public']['Tables']['historial']['Row'];
type InsertSeguimiento = Omit<Seguimiento, 'id' | 'completado'>;

export function useSeguimientos() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskDetails = useCallback(async (tareaId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch seguimientos
      const { data: segData, error: segError } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('tarea_id', tareaId)
        .order('fecha_seguimiento', { ascending: false });
        
      if (segError) throw segError;
      setSeguimientos(segData || []);

      // Fetch historial
      const { data: histData, error: histError } = await supabase
        .from('historial')
        .select('*')
        .eq('tarea_id', tareaId)
        .order('fecha', { ascending: false });
        
      if (histError) throw histError;
      setHistorial(histData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSeguimiento = async (payload: Omit<InsertSeguimiento, 'id' | 'completado'>) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .insert([{ ...payload, completado: false }])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setSeguimientos(prev => [data, ...prev]);
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  const completeSeguimiento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seguimientos')
        .update({ completado: true })
        .eq('id', id);

      if (error) throw error;
      
      setSeguimientos(prev => prev.map(s => s.id === id ? { ...s, completado: true } : s));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    seguimientos,
    historial,
    isLoading,
    error,
    fetchTaskDetails,
    addSeguimiento,
    completeSeguimiento
  };
}
