export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tareas: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'archivada'
          prioridad: 'critica' | 'alta' | 'media' | 'baja'
          categoria: 'urgente' | 'reporte' | 'recurrente' | 'delegada' | 'programada' | 'fijada'
          responsable_id: string
          delegada_a: string | null
          proyecto_id: string | null
          fecha_limite: string
          fecha_creacion: string
          fecha_completada: string | null
          referencia: string | null
          recurrencia: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          estado?: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'archivada'
          prioridad?: 'critica' | 'alta' | 'media' | 'baja'
          categoria?: 'urgente' | 'reporte' | 'recurrente' | 'delegada' | 'programada' | 'fijada'
          responsable_id: string
          delegada_a?: string | null
          proyecto_id?: string | null
          fecha_limite: string
          fecha_creacion?: string
          fecha_completada?: string | null
          referencia?: string | null
          recurrencia?: Json | null
          user_id: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          estado?: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'archivada'
          prioridad?: 'critica' | 'alta' | 'media' | 'baja'
          categoria?: 'urgente' | 'reporte' | 'recurrente' | 'delegada' | 'programada' | 'fijada'
          responsable_id?: string
          delegada_a?: string | null
          proyecto_id?: string | null
          fecha_limite?: string
          fecha_creacion?: string
          fecha_completada?: string | null
          referencia?: string | null
          recurrencia?: Json | null
          user_id?: string
        }
      }
      seguimientos: {
        Row: {
          id: string
          tarea_id: string
          tipo: 'recordatorio' | 'revision' | 'escalamiento' | 'nota'
          nota: string | null
          fecha_seguimiento: string
          completado: boolean
          posicion_cola: number | null
          user_id: string
        }
      }
      historial: {
        Row: {
          id: string
          tarea_id: string
          tipo_evento: 'creada' | 'completada' | 'delegada' | 'vencida' | 'seguimiento' | 'editada' | 'archivada'
          detalle: string | null
          fecha: string
          user_id: string
        }
      }
      proyectos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          activo: boolean
          user_id: string
        }
      }
      usuarios: {
        Row: {
          id: string
          nombre_completo: string | null
          rol: string | null
          equipo: string | null
        }
      }
    }
  }
}
