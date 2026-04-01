import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/types';

type InsertRegistro = Database['public']['Tables']['registros_tiempo']['Insert'];

export interface ActiveTimer {
  tarea_id: string;
  tarea_titulo: string;
  startTime: string; // ISO string
}

interface TimeTrackerContextType {
  activeTimer: ActiveTimer | null;
  startTimer: (tarea_id: string, tarea_titulo: string) => void;
  stopTimer: (descripcion?: string) => Promise<{ success: boolean; minutos?: number; error?: string }>;
  discardTimer: () => void;
  fetchRegistrosForTarea: (tarea_id: string) => Promise<any[]>;
  lastTimerUpdate: number;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export function TimeTrackerProvider({ children }: { children: ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [lastTimerUpdate, setLastTimerUpdate] = useState<number>(Date.now());
  const { session } = useAuth();

  useEffect(() => {
    const savedTimer = localStorage.getItem('dashbology_active_timer');
    if (savedTimer) {
      try {
        setActiveTimer(JSON.parse(savedTimer));
      } catch (e) {
        console.error('Error parsing active timer', e);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('dashbology_active_timer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('dashbology_active_timer');
    }
  }, [activeTimer]);

  const startTimer = (tarea_id: string, tarea_titulo: string) => {
    setActiveTimer({
      tarea_id,
      tarea_titulo,
      startTime: new Date().toISOString()
    });
  };

  const stopTimer = async (descripcion?: string) => {
    if (!activeTimer || !session) return { success: false, error: 'No active session' };
    
    const startTime = new Date(activeTimer.startTime);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    // Fallback exactly to 1 minute to avoid 0 minute records if stopped too early
    const minsToSave = Math.max(1, diffMins); 

    const newRegistro: InsertRegistro = {
      tarea_id: activeTimer.tarea_id,
      user_id: session.user.id,
      duracion_minutos: minsToSave,
      descripcion: descripcion || null,
      fecha: now.toISOString()
    };

    try {
      const { error } = await supabase.from('registros_tiempo').insert([newRegistro]);
      if (error) throw error;
      
      setActiveTimer(null);
      setLastTimerUpdate(Date.now());
      return { success: true, minutos: minsToSave };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const discardTimer = () => {
    setActiveTimer(null);
  };

  const fetchRegistrosForTarea = async (tarea_id: string) => {
    if (!session) return [];
    const { data, error } = await supabase
      .from('registros_tiempo')
      .select('id, tarea_id, user_id, duracion_minutos, descripcion, fecha')
      .eq('tarea_id', tarea_id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('fetchRegistrosForTarea error:', error);
      return [];
    }
    return data || [];
  };

  return (
    <TimeTrackerContext.Provider value={{ activeTimer, startTimer, stopTimer, discardTimer, fetchRegistrosForTarea, lastTimerUpdate }}>
      {children}
    </TimeTrackerContext.Provider>
  );
}

export function useTimeTracker() {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
}
