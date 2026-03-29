# Prompt de inicialización — Dashbology (solo funcionalidad)

Inicializa un proyecto en el repositorio antigravity con la siguiente estructura funcional para una aplicación web de gestión de tareas y seguimiento llamada **"Dashbology"**. Todo el texto de la aplicación debe estar en español, respetando estrictamente las reglas ortográficas (tildes, signos de apertura ¿¡, etc.).

---

## Stack técnico

- Vite + React 18 + TypeScript
- Tailwind CSS (solo utilidades base, sin diseño aplicado aún — el diseño se gestionará desde un archivo separado)
- Supabase (autenticación + base de datos + RLS)
- Despliegue en Vercel

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   └── RightPanel.tsx
│   ├── tareas/
│   │   ├── TareaCard.tsx
│   │   ├── TareaForm.tsx
│   │   ├── TareaList.tsx
│   │   └── TareaDetalle.tsx
│   ├── seguimientos/
│   │   ├── SeguimientoCard.tsx
│   │   ├── SeguimientoForm.tsx
│   │   └── ColaSeguimiento.tsx
│   ├── historial/
│   │   └── HistorialList.tsx
│   ├── busqueda/
│   │   └── BuscadorTareas.tsx
│   └── common/
│       ├── CategoriaGrid.tsx
│       └── AccionesRapidas.tsx
├── pages/
│   ├── Panel.tsx
│   ├── Tareas.tsx
│   ├── Seguimientos.tsx
│   ├── Mensajes.tsx
│   ├── Proyectos.tsx
│   ├── Informes.tsx
│   └── Ajustes.tsx
├── hooks/
│   ├── useTareas.ts
│   ├── useSeguimientos.ts
│   ├── useHistorial.ts
│   └── useBusqueda.ts
├── lib/
│   ├── supabase.ts
│   └── types.ts
├── context/
│   └── AuthContext.tsx
└── utils/
    ├── categorias.ts
    └── fechas.ts
```

---

## Modelo de datos (Supabase)

### Tabla: `tareas`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| titulo | text, NOT NULL | |
| descripcion | text | |
| estado | enum | `'pendiente'`, `'en_progreso'`, `'completada'`, `'vencida'`, `'archivada'` |
| prioridad | enum | `'critica'`, `'alta'`, `'media'`, `'baja'` |
| categoria | enum | `'urgente'`, `'reporte'`, `'recurrente'`, `'delegada'`, `'programada'`, `'fijada'` |
| responsable_id | uuid, FK → usuarios | |
| delegada_a | uuid, FK → usuarios | nullable |
| proyecto_id | uuid, FK → proyectos | nullable |
| fecha_limite | timestamptz | |
| fecha_creacion | timestamptz | default `now()` |
| fecha_completada | timestamptz | nullable |
| referencia | text | Código automático tipo `REG-Q1-2026-014` |
| recurrencia | jsonb | nullable — `{ intervalo: 'diaria'\|'semanal'\|'mensual', dia?: number }` |
| user_id | uuid, FK → auth.users | |

### Tabla: `seguimientos`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| tarea_id | uuid, FK → tareas | |
| tipo | enum | `'recordatorio'`, `'revision'`, `'escalamiento'`, `'nota'` |
| nota | text | |
| fecha_seguimiento | timestamptz | |
| completado | boolean | default `false` |
| posicion_cola | integer | |
| user_id | uuid, FK → auth.users | |

### Tabla: `historial`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| tarea_id | uuid, FK → tareas | |
| tipo_evento | enum | `'creada'`, `'completada'`, `'delegada'`, `'vencida'`, `'seguimiento'`, `'editada'`, `'archivada'` |
| detalle | text | |
| fecha | timestamptz | default `now()` |
| user_id | uuid, FK → auth.users | |

### Tabla: `proyectos`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| nombre | text, NOT NULL | |
| descripcion | text | |
| activo | boolean | default `true` |
| user_id | uuid, FK → auth.users | |

### Tabla: `usuarios` (perfil extendido)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid, PK | FK → auth.users |
| nombre_completo | text | |
| rol | text | |
| equipo | text | |

---

## Funcionalidad requerida

### 1. CRUD completo de tareas

- Crear, leer, actualizar, eliminar tareas
- Asignar prioridad, categoría, fecha límite, responsable
- Delegar tareas a miembros del equipo
- Generar referencia automática al crear
- Marcar como completada / archivar

### 2. Sistema de seguimientos

- Cola de seguimiento con posición, orden y fecha de vencimiento
- Crear seguimientos vinculados a tareas
- Tipos: recordatorio, revisión, escalamiento, nota
- Marcar seguimientos como completados

### 3. Búsqueda y filtrado

- Búsqueda por texto libre (título, descripción, referencia)
- Filtro por categoría (grid de 9 categorías)
- Filtro por estado, prioridad, responsable, fecha

### 4. Historial automático

- Registro automático de eventos (creación, completado, delegación, vencimiento)
- Listado cronológico con paginación

### 5. Panel principal

- Mostrar próxima tarea prioritaria (la más urgente por fecha límite)
- Acciones rápidas: nueva tarea, bandeja, equipo, calendario, informes
- Consejos de productividad (contenido estático)
- Historial reciente
- Cola de seguimiento activa

### 6. Navegación

- Rutas: `/panel`, `/tareas`, `/seguimientos`, `/mensajes`, `/proyectos`, `/informes`, `/ajustes`
- React Router v6
- Layout de 3 columnas: sidebar izquierdo + contenido central + panel derecho

### 7. Autenticación

- Login / registro con Supabase Auth (email + contraseña)
- RLS en todas las tablas filtrado por `user_id`
- Contexto de autenticación global

---

## Instrucciones importantes

1. **NO apliques estilos visuales**, colores, tipografías ni diseño. Usa solo clases utilitarias mínimas de Tailwind para estructura (`flex`, `grid`, `gap`, `p-`) sin colores ni decoración.
2. Cada componente debe exportar su estructura funcional limpia, lista para recibir clases de diseño desde un archivo de tema externo.
3. Todos los strings visibles al usuario deben estar en **español correcto** (tildes, ¿?, ¡!, etc.).
4. Genera los archivos SQL de migración para Supabase en `/supabase/migrations/`.
5. Configura las variables de entorno en `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
