# Hackstler Brand System

> **Cyberpunk Terminal** — Futurista y retro a la vez. Glassmorphism oscuro, glows neón contenidos, tipografía mono de terminal y micro-animaciones que respiran.

---

## Filosofía

El estilo Hackstler se basa en 4 principios:

1. **Terminal Heritage** — Tipografía monospace como protagonista. SF Mono, Cascadia Code, Fira Code. El código es la interfaz.
2. **Neon Restraint** — Glows y acentos de color que iluminan sin cegar. Azul eléctrico como primario, púrpura como secundario, rosa como acento. Siempre sobre fondos casi-negros.
3. **Glass Depth** — Capas de glassmorphism con blur y saturación. Superficies semitransparentes que sugieren profundidad sin perder legibilidad.
4. **Living UI** — Micro-animaciones en todo: hover lifts, press scales, shimmer en loading, gradient borders que rotan. La interfaz respira.

---

## Paleta de Colores

### Fondos (de más oscuro a más claro)

| Token | Hex | Uso |
|-------|-----|-----|
| `bg` | `#09090b` | Fondo principal |
| `surface` | `#0f0f12` | Cards, paneles |
| `surface-hi` | `#17171c` | Elementos elevados |
| `surface-hover` | `#1c1c22` | Estado hover |
| `surface-raised` | `#222228` | Máxima elevación |

### Bordes

| Token | Hex | Uso |
|-------|-----|-----|
| `border` | `#1c1c24` | Bordes estándar |
| `border-hi` | `#2a2a35` | Bordes elevados |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `text-bright` | `#fafafa` | Títulos, énfasis |
| `text` | `#a1a1aa` | Texto principal |
| `text-muted` | `#63636e` | Texto secundario |
| `text-dim` | `#33333d` | Deshabilitado, terciario |

### Brand (la triada Hackstler)

| Token | Hex | Rol |
|-------|-----|-----|
| `accent` | `#3b82f6` | Azul eléctrico — acción primaria, confianza |
| `brand` | `#8b5cf6` | Púrpura — innovación, marca |
| `brand-accent` | `#ec4899` | Rosa — energía, acento |

Variantes de opacidad para cada uno:
- Hover: `accent-hover: #2563eb`
- Muted: `accent-muted: #1d4ed8`
- Dim (8% opacity): `accent-dim: rgba(59, 130, 246, 0.08)`

### Status

| Token | Hex | Significado |
|-------|-----|-------------|
| `green` | `#22c55e` | Éxito, conectado, positivo |
| `yellow` | `#eab308` | Advertencia, en proceso |
| `red` | `#ef4444` | Error, peligro, desconectado |

Cada status tiene su variante `-muted` al 8% opacity para fondos.

### Glass

| Token | Valor | Uso |
|-------|-------|-----|
| `glass` | `rgba(15, 15, 18, 0.80)` | Paneles principales + `blur(20px) saturate(180%)` |
| `glass-subtle` | `rgba(15, 15, 18, 0.60)` | Overlays sutiles + `blur(12px) saturate(150%)` |

---

## Tipografía

### Font Stacks

```css
--font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

> Cargadas via Google Fonts en `index.html`: Inter (400-800) + JetBrains Mono (400-600).

**Mono** es la fuente protagonista — IDs, códigos, datos técnicos, badges. Todo lo que tenga identidad técnica va en mono.

**Sans** es para texto de lectura — descripciones, labels, párrafos.

### Jerarquía

| Elemento | Clases | Ejemplo |
|----------|--------|---------|
| Page title | `text-2xl sm:text-3xl font-bold gradient-text tracking-tight` | "Knowledge Base" |
| Card title | `text-sm font-semibold text-text-bright` | "WhatsApp Status" |
| Body text | `text-sm text-text` | Descripciones |
| Label | `text-xs font-medium text-text-muted` | Labels de inputs |
| Caption | `text-xs text-text-dim` | Fechas, metadata |
| Mono data | `text-xs text-text-dim font-mono` | orgId, IDs |

### Gradient Text (títulos principales)

```css
.gradient-text {
  background: linear-gradient(135deg, #fafafa 0%, #3b82f6 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

Blanco → Azul → Púrpura. La firma visual Hackstler.

---

## Radios de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | `0.375rem` (6px) | Botones pequeños, badges |
| `radius-md` | `0.5rem` (8px) | Inputs, botones, items de lista |
| `radius-lg` | `0.75rem` (12px) | Cards, contenedores |
| `radius-xl` | `1rem` (16px) | Modales, paneles principales |

---

## Sistema de Sombras

### Cards
```css
/* Base */
--shadow-card: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.4);

/* Hover (con glow opcional) */
--shadow-card-hover: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5), 0 0 48px var(--card-glow, rgba(59,130,246,0.06));
```

### Glows de acento
```css
--shadow-glow-accent: 0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1);
--shadow-glow-green:  0 0 30px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.08);
```

### Nav activo
```css
--shadow-nav-active: inset 0 0 0 1px rgba(59,130,246,0.2), 0 0 16px rgba(59,130,246,0.08);
```

---

## Animaciones

### Principios de movimiento

- **Entradas**: 0.3-0.5s con easing elástico `cubic-bezier(0.16, 1, 0.3, 1)`
- **Micro-interacciones**: 0.1-0.2s para feedback inmediato
- **Idle/loading**: 1.8s+ para shimmer y pulsos sutiles
- **Hover**: 0.3-0.4s transiciones suaves

### Animaciones core

```css
/* Entrada con elevación sutil */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Entrada principal de contenido */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Navegación lateral */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Modales y popovers */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

/* Loading skeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Barra de gradiente animada */
@keyframes gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Rotación de borde gradiente */
@keyframes border-rotate {
  0%   { --border-angle: 0deg; }
  100% { --border-angle: 360deg; }
}
```

### Stagger pattern

Para listas, aplicar delays incrementales de 60ms:
```css
.stagger-1 { animation-delay: 0.06s; }
.stagger-2 { animation-delay: 0.12s; }
/* ... hasta stagger-6: 0.36s */
```

---

## Efectos Signature

### 1. Glow Card (hover interactivo)
```css
.glow-card:hover {
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5),
              0 0 40px var(--stat-glow, rgba(59,130,246,0.12));
  border-color: color-mix(in srgb, var(--stat-accent, #3b82f6) 25%, transparent);
  transform: translateY(-3px);
}
```

### 2. Button Press (micro-interacción)
```css
.btn-press:active:not(:disabled) {
  transform: scale(0.97);
}
```

### 3. Gradient Border (borde neón rotativo en hover)
```css
.gradient-border:hover::before {
  background: conic-gradient(from var(--border-angle),
    transparent 40%, #3b82f6 50%, #8b5cf6 55%, #ec4899 60%, transparent 70%);
  animation: border-rotate 4s linear infinite;
}
```

### 4. Gradient Bar (acento animado)
```css
.gradient-bar {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
}
```

### 5. Pulse Dot (indicador de estado vivo)
```css
.pulse-dot::after {
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 6. Noise Overlay (textura de grano sutil)
```css
.noise-bg::after {
  opacity: 0.012;
  /* SVG fractalNoise inline */
}
```

### 7. Ambient Orb (glow ambiental de fondo)
```css
.ambient-orb {
  border-radius: 9999px;
  filter: blur(100px);
  animation: glow-pulse 5s ease-in-out infinite;
}
```

---

## Patrones UX

### Loading
Siempre `<Skeleton>` con shimmer. Nunca spinners solos, nunca pantalla vacía.

### Feedback
Toda operación async muestra toast: éxito y error. `addToast("message", "success|error")`.

### Destructive Actions
Modal de confirmación obligatorio. Para cascade deletes, warning en rojo con `AlertCircleIcon`.

### Empty States
Icono + título + descripción + acción primaria opcional. Centrado vertical.

### Responsive
- Headers: `flex-col sm:flex-row`
- Search inputs: `w-full sm:w-64`
- Rows: `flex-wrap sm:flex-nowrap`

---

## CSS Variables Completas (copiar a cualquier proyecto)

```css
@theme {
  /* Surfaces */
  --color-bg:             #09090b;
  --color-surface:        #0f0f12;
  --color-surface-hi:     #17171c;
  --color-surface-hover:  #1c1c22;
  --color-surface-raised: #222228;
  --color-border:         #1c1c24;
  --color-border-hi:      #2a2a35;

  /* Text */
  --color-text:           #a1a1aa;
  --color-text-bright:    #fafafa;
  --color-text-muted:     #63636e;
  --color-text-dim:       #33333d;

  /* Brand Triad */
  --color-accent:         #3b82f6;
  --color-accent-hover:   #2563eb;
  --color-accent-muted:   #1d4ed8;
  --color-accent-dim:     rgba(59, 130, 246, 0.08);
  --color-brand:          #8b5cf6;
  --color-brand-dim:      rgba(139, 92, 246, 0.08);
  --color-brand-accent:   #ec4899;

  /* Status */
  --color-green:          #22c55e;
  --color-green-muted:    rgba(34, 197, 94, 0.08);
  --color-yellow:         #eab308;
  --color-yellow-muted:   rgba(234, 179, 8, 0.08);
  --color-red:            #ef4444;
  --color-red-muted:      rgba(239, 68, 68, 0.08);

  /* Glass */
  --color-glass:          rgba(15, 15, 18, 0.80);
  --color-glass-subtle:   rgba(15, 15, 18, 0.60);
  --color-shimmer:        rgba(255, 255, 255, 0.03);

  /* Shadows */
  --shadow-card:          0 0 0 1px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.4);
  --shadow-card-hover:    0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5), 0 0 48px var(--card-glow, rgba(59,130,246,0.06));
  --shadow-glow-accent:   0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1);
  --shadow-glow-green:    0 0 30px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.08);
  --shadow-nav-active:    inset 0 0 0 1px rgba(59,130,246,0.2), 0 0 16px rgba(59,130,246,0.08);

  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Fonts */
  --font-mono: 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
```

---

## Checklist "Es Hackstler?"

- [ ] Fondo `#09090b`, nunca blanco, nunca gris medio
- [ ] Colores solo con tokens semánticos, cero hex hardcodeados
- [ ] Títulos con `gradient-text` (blanco → azul → púrpura)
- [ ] Mono para datos técnicos, sans para lectura
- [ ] Glass con backdrop-blur en paneles
- [ ] Glow sutil en hover, no brillos agresivos
- [ ] Animaciones de entrada con stagger
- [ ] Press effect en botones (scale 0.97)
- [ ] Loading con skeletons shimmer, no spinners
- [ ] Gradient bar animado como acento top
- [ ] Noise overlay a 1.2% opacity
- [ ] Scrollbar custom (6px, border-hi)
- [ ] Triada de color: azul + púrpura + rosa
