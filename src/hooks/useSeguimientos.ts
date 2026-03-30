import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';
import { useAuth } from '../context/AuthContext';

type Seguimiento = Database['public']['Tables']['seguimientos']['Row'];
type Historial = Database['public']['Tables']['historial']['Row'];

export function useSeguimientos() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    fetchAllSeguimientos();

    const subscription = supabase
      .channel('seguimientos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seguimientos' }, () => {
        fetchAllSeguimientos();
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [session]);

  async function fetchAllSeguimientos() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .select('*')
        .order('fecha_seguimiento', { ascending: true });

      if (error) throw error;
      setSeguimientos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTaskDetails = useCallback(async (tareaId: string) => {
    setError(null);
    try {
      const { data: segData, error: segError } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('tarea_id', tareaId)
        .order('fecha_seguimiento', { ascending: false });

      if (segError) throw segError;
      setSeguimientos(segData || []);

      const { data: histData, error: histError } = await supabase
        .from('historial')
        .select('*')
        .eq('tarea_id', tareaId)
        .order('fecha', { ascending: false });

      if (histError) throw histError;
      setHistorial(histData || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const createSeguimiento = async (payload: {
    tarea_id: string;
    tipo: Seguimiento['tipo'];
    nota?: string | null;
    fecha_seguimiento: string;
    posicion_cola?: number | null;
    user_id: string;
  }) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .insert([{ ...payload, completado: false }])
        .select()
        .single();

      if (error) throw error;
      setSeguimientos(prev => [...prev, data].sort(
        (a, b) => new Date(a.fecha_seguimiento).getTime() - new Date(b.fecha_seguimiento).getTime()
      ));
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  const addSeguimiento = async (payload: Omit<Seguimiento, 'id' | 'completado'>) => {
    return createSeguimiento({ ...payload });
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

  const deleteSeguimiento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seguimientos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSeguimientos(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    seguimientos,
    historial,
    isLoading,
    error,
    fetchAllSeguimientos,
    fetchTaskDetails,
    createSeguimiento,
    addSeguimiento,
    completeSeguimiento,
    deleteSeguimiento,
  };
}
