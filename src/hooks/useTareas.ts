import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';
import { useAuth } from '../context/AuthContext';

type Tarea = Database['public']['Tables']['tareas']['Row'];

export function useTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    fetchTareas();

    // Setup realtime subscription
    const subscription = supabase
      .channel('tareas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        fetchTareas();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  async function fetchTareas() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setTareas(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createTarea(tarea: Database['public']['Tables']['tareas']['Insert']) {
    try {
      const { data, error } = await supabase.from('tareas').insert([tarea]).select();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  async function updateTarea(id: string, updates: Database['public']['Tables']['tareas']['Update']) {
    try {
      const { data, error } = await supabase.from('tareas').update(updates).eq('id', id).select();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  async function deleteTarea(id: string) {
    try {
      const { error } = await supabase.from('tareas').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }

  return { tareas, isLoading, error, createTarea, updateTarea, deleteTarea, fetchTareas };
}
