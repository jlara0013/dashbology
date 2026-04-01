-- Migration 0002: Add Time Tracking (registros_tiempo) Table

CREATE TABLE IF NOT EXISTS public.registros_tiempo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duracion_minutos INTEGER NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.registros_tiempo ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso para que los usuarios solo puedan leer/escribir sus propios registros de su organización
-- Nota: Como esto es un MVP cerrado y `tareas` verifica el usuario, podemos simplificarlo a `user_id = auth.uid()`
CREATE POLICY "Users can CRUD their own registros_tiempo." 
ON public.registros_tiempo 
FOR ALL USING (auth.uid() = user_id);
