# Instrucciones de estilo — Dashbology (Liquid Glass)

Este archivo define las especificaciones visuales y de diseño para **Dashbology**. Debe aplicarse sobre la estructura funcional ya existente del proyecto, sin modificar la lógica ni el modelo de datos.

---

## Contexto visual

Dashboard de gestión de tareas con una estética **Ultra-Premium Liquid Glassmorphism** en modo claro. La aplicación debe ser altamente densa en información, responsiva y estar completamente localizada al español.

---

## Stack de diseño

- **Estilos:** Tailwind CSS + Framer Motion (efectos de cristal y animaciones líquidas)
- **Íconos:** Lucide-React
- **Tipografía:** Manrope (Google Fonts)

---

## Especificaciones visuales

### 1. Fondo (Background)

- Implementar un **Mesh Gradient** animado que combine tonos:
  - `#EFF6FF` (azul muy claro)
  - `#DBEAFE` (azul suave)
  - `#F5F3FF` (violeta sutil)
- Añadir formas orgánicas desenfocadas que se muevan lentamente para potenciar el efecto traslúcido.

### 2. Contenedores de cristal (Glass Panels)

| Propiedad | Valor |
|---|---|
| Backdrop Blur | `backdrop-blur(20px)` |
| Transparencia | `rgba(255, 255, 255, 0.4)` |
| Bordes | `1px solid rgba(255, 255, 255, 0.5)` — simula brillo de canto de vidrio |
| Sombra | `shadow-[0_8px_32px_rgba(0,0,0,0.05)]` — suave, gran radio |

---

## Estructura de la interfaz

### A. Barra lateral (SideNavBar) — Total Clear

- Fondo de cristal claro alineado con el centro del sitio.
- **Secciones:** Panel principal, Mis tareas, Calendario, Equipo, Reportes.
- **Sección inferior:** «Próximas entregas» con tarjetas compactas de reportes y logos.

### B. Cabecera (Top Bar)

- Buscador centralizado con efecto de cristal.
- Perfil de usuario y notificaciones a la derecha.

### C. Cuerpo principal (Dashboard)

#### 1. Tarjetas de resumen (parte superior)

- Tareas del día, Actividades activas, Tareas retrasadas, Índice de productividad.
- Diseño compacto con íconos vibrantes y microgradientes.

#### 2. Filtros de vista

- Botonera para filtrar por: Fecha, Retrasadas, Urgentes, Mis tareas, Asignadas.

#### 3. Lista de tareas (alta densidad)

- Tabla compacta con las siguientes columnas:
  - Nombre de tarea
  - Proyecto
  - Vencimiento (con íconos)
  - Prioridad — badges: Baja, Media, Alta, Urgente
  - Responsables — avatar stack
  - Estado
- Tipografía pequeña (`text-sm` / `text-xs`) y espaciado ajustado.

#### 4. Estado semanal (heatmap inferior)

- Sección con microcuadrados redondeados.
- Lógica de color:
  - **Verde:** pasado / completado
  - **Rojo:** futuro / asignado
  - **Borde azul:** día actual

---

## Redacción y ortografía

- **Idioma:** Todo el contenido visible debe estar en español.
- Cumplir estrictamente las reglas ortográficas: tildes, signos de apertura (¿, ¡), mayúsculas tras punto.
- Términos técnicos correctos: «Planificado», «En progreso», «Retrasada», etc.

---

## Objetivo

Aplicar el efecto **Liquid Glass** como protagonista visual del proyecto sin comprometer la velocidad de carga ni la legibilidad. El código de estilos debe ser modular y estar separado de la lógica funcional.
