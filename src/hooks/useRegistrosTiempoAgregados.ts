import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface TiempoAgregado {
  totalMinutos: number;
  sessionCount: number;
}

export function useRegistrosTiempoAgregados(tareaIds: string[], lastTimerUpdate?: number) {
  const { session } = useAuth();
  const [tiempoMap, setTiempoMap] = useState<Map<string, TiempoAgregado>>(new Map());

  const idsKey = useMemo(() => [...tareaIds].sort().join(','), [tareaIds]);

  useEffect(() => {
    if (!session || !idsKey) {
      setTiempoMap(new Map());
      return;
    }

    supabase
      .from('registros_tiempo')
      .select('tarea_id, duracion_minutos')
      .in('tarea_id', idsKey.split(','))
      .then(({ data }) => {
        if (!data) return;
        const map = new Map<string, TiempoAgregado>();
        for (const reg of data) {
          const existing = map.get(reg.tarea_id) ?? { totalMinutos: 0, sessionCount: 0 };
          map.set(reg.tarea_id, {
            totalMinutos: existing.totalMinutos + reg.duracion_minutos,
            sessionCount: existing.sessionCount + 1,
          });
        }
        setTiempoMap(map);
      });
  }, [session, idsKey, lastTimerUpdate]);

  return tiempoMap;
}
