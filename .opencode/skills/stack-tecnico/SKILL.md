---
name: stack-tecnico
description: Stack oficial de Hotelica (React 18 + TypeScript + Vite + Tailwind v4 + Supabase). Archivos, rutas y convenciones técnicas. Usar al crear o modificar componentes, páginas o servicios.
---

# Stack técnico oficial — Hotelica

## Tecnologías obligatorias
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS v4
- Estado global: Context API en src/store.tsx
- Datos simulados (Fase 1): src/data.ts
- Backend/BD: Supabase (PostgreSQL) — cliente en src/lib/supabase.ts
- Iconos: SVG inline en src/icons.tsx
- Siluetas de departamentos: src/siluetas.tsx

## Estructura de archivos (NO inventes carpetas nuevas)
src/
├── App.tsx              → Componente raíz y enrutamiento
├── main.tsx             → Punto de entrada React
├── layout.tsx           → Layout global (Header, Footer, Marca)
├── rutas.ts             → Definición de rutas
├── store.tsx            → Estado global (Context API)
├── data.ts              → Datos simulados (hoteles, destinos)
├── ui.tsx               → Componentes base reutilizables (Marca, Botón, etc.)
├── tarjeta.tsx          → Componente de tarjeta de hotel
├── icons.tsx            → Iconos SVG inline
├── siluetas.tsx         → Siluetas SVG de departamentos de Nicaragua
├── index.css            → Estilos globales y Tailwind
└── pages/
    ├── Home.tsx             → Portada turística (buscador)
    ├── Results.tsx          → Resultados de búsqueda
    ├── HotelDetail.tsx      → Detalle del hotel y habitaciones
    ├── BookingModal.tsx     → Modal de reserva (3 pasos)
    ├── MyReservations.tsx   → Historial del turista
    ├── HotelPanel.tsx       → Dashboard del hotelero
    └── AdminPanel.tsx       → Consola del administrador

## Convenciones técnicas
- Componentes: PascalCase (ej: BookingModal.tsx).
- Variables/funciones: camelCase (ej: calcularTotal).
- Tipos TypeScript: definilos cerca del componente o en un archivo types.ts si son compartidos.
- Tailwind: usá clases utilitarias directamente en el JSX. Evitá CSS personalizado salvo en index.css para variables globales.
- Rutas: definilas en src/rutas.ts y usalas en App.tsx.
- Estado global: cualquier dato que necesiten varias páginas va en src/store.tsx.
- Datos simulados: mientras estemos en Fase 1, los hoteles y destinos vienen de src/data.ts. NO hardcodees datos dentro de los componentes.
