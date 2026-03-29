# Sistema de Diseño: Guía Editorial de Alta Gama

Este documento establece las bases visuales y funcionales para una experiencia de gestión de tareas de nivel premium. El objetivo no es simplemente construir una interfaz funcional, sino crear un entorno digital que respire eficiencia, autoridad y una sofisticación colaborativa sin esfuerzo.

## 1. El "Norte Creativo": La Estructura Atmosférica
Nuestra visión se aleja del diseño "cuadriculado" tradicional para adoptar la **Estructura Atmosférica**. En lugar de separar el contenido con líneas rígidas, utilizamos capas de luz y profundidad tonal. La interfaz debe sentirse como una serie de planos de cristal esmerilado flotando en un espacio infinito y limpio.

**Principios clave:**
- **Asimetría Intencional:** Rompemos la monotonía con jerarquías tipográficas audaces y espacios en blanco generosos (aire).
- **Profundidad Tonal:** Sustituimos el "flat design" por una jerarquía de superficies que se elevan mediante el color, no solo mediante sombras.
- **Enfoque Editorial:** Tratamos cada pantalla como una página de una revista de alta gama, donde la tipografía guía el ojo de manera natural.

---

## 2. Paleta de Colores y Capas de Superficie
La paleta se basa en la pureza del blanco y la serenidad de los azules profundos, acentuados con un azul vibrante que denota acción y éxito.

### Regla de "No-Line" (Cero Bordes)
**Queda estrictamente prohibido el uso de bordes de 1px para delimitar secciones.** La separación de contenidos se logra exclusivamente mediante el cambio de tonos de superficie:
- Un contenedor `surface_container_low` sobre un fondo `surface` es suficiente para definir un área.
- Para elementos flotantes, utiliza el efecto **Glassmorphism**: aplica `surface` con una opacidad del 80% y un `backdrop-blur` de 16px.

### Jerarquía de Superficies (Anidamiento)
Tratamos la UI como capas físicas. Para crear profundidad, anidamos los tokens de la siguiente manera:
1. **Base:** `surface` (#f7f9fb)
2. **Secciones Secundarias:** `surface_container_low` (#f2f4f6)
3. **Tarjetas de Acción:** `surface_container_lowest` (#ffffff) para que "brillen" sobre el fondo.
4. **Elementos de Interacción:** `primary_container` (#2563eb) con texto `on_primary_container` (#eeefff).

---

## 3. Tipografía: El Ritmo de la Información
Combinamos dos familias para un contraste editorial sofisticado: **Manrope** para la expresividad y **Inter** para la claridad operativa.

| Nivel | Token | Fuente | Tamaño | Peso | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | Bold | Titulares de impacto en Landing |
| **Headline** | `headline-md` | Manrope | 1.75rem | Semibold | Títulos de sección en el Dashboard |
| **Title** | `title-lg` | Inter | 1.375rem | Medium | Títulos de tarjetas y modales |
| **Body** | `body-md` | Inter | 0.875rem | Regular | Cuerpo de texto y descripción de tareas |
| **Label** | `label-md` | Inter | 0.75rem | Bold | Etiquetas de estado, botones pequeños |

*Nota: La tipografía en español tiende a ser un 20% más larga que en inglés. Siempre deja espacio adicional en los contenedores de texto.*

---

## 4. Elevación y Profundidad: El Efecto "Luz Ambiente"
La profundidad debe sentirse natural, como si una luz cenital suave bañara la interfaz.

- **Sombras Ambientales:** Solo para elementos de alta prioridad (como menús desplegables o modales). Usa el color `on_surface` con una opacidad del 4% y un desenfoque (blur) de 32px. Evita sombras negras o grises genéricas.
- **Ghost Borders (Borde Fantasma):** Si la accesibilidad requiere un borde, utiliza el token `outline_variant` al 15% de opacidad. Nunca uses bordes 100% opacos.
- **Texturas Visuales:** Los botones principales (`primary`) deben usar un degradado sutil desde `primary` (#004ac6) hasta `primary_container` (#2563eb) para añadir una "vibración" profesional que el color plano no posee.

---

## 5. Componentes Primordiales

### Botones (Botones)
- **Primario:** Radio de esquina `md` (0.75rem). Relleno con degradado sutil. Texto en `on_primary`.
- **Secundario:** Fondo `secondary_container`, texto `on_secondary_container`. Sin bordes.
- **Terciario:** Solo texto en `primary`, con un estado de hover que active un fondo `surface_container_high` muy sutil.

### Tarjetas (Tarjetas)
- **Prohibido el uso de líneas divisorias.**
- Usa un espaciado `spacing-5` (1.7rem) entre elementos internos.
- La separación se marca por el cambio entre `surface_container_lowest` (la tarjeta) y el fondo de la página.

### Chips de Estado (Etiquetas)
- **Completado:** Fondo `tertiary_fixed`, texto `on_tertiary_fixed_variant`.
- **En Progreso:** Fondo `secondary_fixed`, texto `on_secondary_fixed_variant`.
- Las esquinas deben ser siempre `full` (9999px) para un aspecto orgánico.

### Campos de Entrada (Campos de Texto)
- Fondo `surface_container_highest` con un borde "fantasma" de `outline_variant` al 20%. 
- Radio de esquina `sm` (0.25rem).

---

## 6. Do's & Don'ts (Qué hacer y qué no)

### ✅ Qué hacer (Do)
- **Espacio Generoso:** Usa el token `spacing-8` (2.75rem) para separar grandes bloques de contenido. El aire es lujo.
- **Micro-interacciones:** Aplica transiciones de 200ms `ease-out` en todos los estados de hover.
- **Contraste de Color:** Asegúrate de que el texto `on_surface_variant` siempre cumpla con los estándares de accesibilidad WCAG sobre los fondos de superficie.

### ❌ Qué no hacer (Don't)
- **No uses sombras pesadas:** Si un elemento parece "sucio", es que la sombra es demasiado opaca.
- **No uses divisores horizontales de 1px:** Si necesitas separar contenido, usa un aumento en el `spacing` o un cambio sutil en el tono de gris del fondo.
- **No satures con el azul primario:** El color `primary` es una herramienta de enfoque, no una pintura de fondo. Úsalo solo para CTAs y estados activos críticos.

---

*Este sistema de diseño es un organismo vivo. Su éxito reside en la disciplina de mantener la pureza visual sin sacrificar la densidad de información necesaria para una gestión de tareas eficiente.*