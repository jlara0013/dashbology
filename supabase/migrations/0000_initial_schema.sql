-- Migration: Initial Schema for Dashbology
-- Creates all tables, enums, and basic RLS policies.

-- Create Enums
CREATE TYPE public.tarea_estado AS ENUM ('pendiente', 'en_progreso', 'completada', 'vencida', 'archivada');
CREATE TYPE public.tarea_prioridad AS ENUM ('critica', 'alta', 'media', 'baja');
CREATE TYPE public.tarea_categoria AS ENUM ('urgente', 'reporte', 'recurrente', 'delegada', 'programada', 'fijada');
CREATE TYPE public.seguimiento_tipo AS ENUM ('recordatorio', 'revision', 'escalamiento', 'nota');
CREATE TYPE public.historial_tipo_evento AS ENUM ('creada', 'completada', 'delegada', 'vencida', 'seguimiento', 'editada', 'archivada');

-- Create Tables

-- Usuarios (extends auth.users)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT,
    rol TEXT,
    equipo TEXT
);

-- Proyectos
CREATE TABLE public.proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tareas
CREATE TABLE public.tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado public.tarea_estado DEFAULT 'pendiente',
    prioridad public.tarea_prioridad DEFAULT 'media',
    categoria public.tarea_categoria,
    responsable_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    delegada_a UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    fecha_limite TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    fecha_completada TIMESTAMPTZ,
    referencia TEXT,
    recurrencia JSONB,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Seguimientos
CREATE TABLE public.seguimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    tipo public.seguimiento_tipo DEFAULT 'nota',
    nota TEXT,
    fecha_seguimiento TIMESTAMPTZ,
    completado BOOLEAN DEFAULT false,
    posicion_cola INTEGER,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Historial
CREATE TABLE public.historial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    tipo_evento public.historial_tipo_evento DEFAULT 'creada',
    detalle TEXT,
    fecha TIMESTAMPTZ DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Row Level Security (RLS) setup
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial ENABLE ROW LEVEL SECURITY;

-- Basic Policies: Users can only see and modify their own data
CREATE POLICY "Users can view their own profile." ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.usuarios FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD their own proyectos." ON public.proyectos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD their own tareas." ON public.tareas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD their own seguimientos." ON public.seguimientos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD their own historial." ON public.historial FOR ALL USING (auth.uid() = user_id);
