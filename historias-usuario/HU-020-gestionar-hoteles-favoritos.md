# HU-020 — Gestionar hoteles favoritos

**Módulo:** Reservas  
**Prioridad:** Baja (Could Have)  
**Estado:** ✅ Terminada  
**Sprint:** 3  
**Interfaz:** tarjeta de hotel (`src/tarjeta.tsx`), ficha del hotel, header, página `/favoritos`

## Redacción estándar

> Como **turista de Hotelica**, quiero **marcar hoteles como favoritos** para **encontrarlos fácilmente en futuras búsquedas**.

## Contexto

En cada tarjeta de hotel y en la ficha del hotel hay un **corazón**: un clic guarda o quita el hotel de la lista de favoritos. El header muestra el **contador** de favoritos de la cuenta, y la página **Favoritos** lista los hoteles guardados con su corazón para seguir gestionándolos.

La lista **pertenece a la cuenta**: cada turista (y cada invitado sin sesión) tiene su propia lista, guardada en el navegador en Fase 1 y lista para migrar a la tabla `favoritos (id_usuario, id_hotel)` en Fase 2.

## Criterios de aceptación (BDD)

### Escenario 1: Marcar desde la tarjeta del hotel
**Dado** que el turista está viendo los resultados de búsqueda  
**Cuando** hace clic en el corazón de una tarjeta  
**Entonces** el corazón se llena, sube el contador del header y aparece el aviso "Guardado en tus favoritos"

### Escenario 2: Quitar desde la tarjeta
**Dado** que el hotel ya estaba marcado como favorito  
**Cuando** vuelve a hacer clic en el corazón  
**Entonces** el corazón se vacía, baja el contador y aparece el aviso "Se quitó de tus favoritos"

### Escenario 3: Marcar y desmarcar desde la ficha del hotel
**Dado** que el turista abrió el detalle de un hotel  
**Cuando** pulsa el botón "Guardar" / "En favoritos"  
**Entonces** el hotel entra o sale de la lista igual que en la tarjeta

### Escenario 4: Contador en el header
**Dado** que el turista tiene N hoteles guardados  
**Cuando** mira el enlace "Favoritos" del header (y el menú móvil)  
**Entonces** ve el número de favoritos de su cuenta junto al enlace

### Escenario 5: Página de favoritos con el listado
**Dado** que el turista tiene hoteles guardados  
**Cuando** entra a la página **Favoritos**  
**Entonces** ve sus hoteles con el mismo formato de las demás tarjetas y puede abrir cada ficha

### Escenario 6: Estado vacío de la página
**Dado** que la cuenta no tiene ningún favorito  
**Cuando** abre la página  
**Entonces** ve "Tu lista de favoritos está vacía" con un botón para explorar hoteles (nada en blanco)

### Escenario 7: Cada cuenta tiene su propia lista
**Dado** que el turista A marcó 2 hoteles y el turista B marcó 1  
**Cuando** inicia sesión cualquiera de los dos (o entra un invitado sin sesión)  
**Entonces** cada uno ve solo sus propios favoritos y su propio contador

### Escenario 8: Los favoritos se conservan
**Dado** que el turista marcó un hotel  
**Cuando** cierra y vuelve a abrir el navegador (F5)  
**Entonces** su lista sigue intacta y asociada a su cuenta

### Escenario 9: Sin duplicados
**Dado** que un hotel ya está en la lista  
**Cuando** se marca de nuevo (desde tarjeta y ficha a la vez)  
**Entonces** aparece una sola vez en la lista y en el contador

## MoSCoW

- **Must Have:** ✅ corazón en tarjeta y en ficha del hotel; ✅ toggle al hacer clic; ✅ página de favoritos con listado; ✅ persistencia de la lista.
- **Should Have:** ✅ contador de favoritos en el header y menú móvil; ✅ estado vacío amigable; ✅ lista por cuenta (una cuenta no ve los favoritos de otra).
- **Could Have:** ✅ aviso (toast) al marcar o quitar; ✅ animación del corazón; ✅ funciones puras `claveDeFavoritos()`, `favoritosDe()` y `alternarFavoritoDe()` con pruebas.
- **Won't Have:** sincronización con Supabase (Fase 2), favoritos de destinos o habitaciones, notificaciones cuando baja de precio, compartir la lista.

## Notas de implementación

- **Corazón**: ya estaba en `src/tarjeta.tsx` y `src/pages/HotelDetail.tsx` con `aria-label`, animación y toast; se verificó contra los subtaskos 181 y 183.
- **Contador**: `src/layout.tsx` muestra `favoritos.length` en el enlace del header y en el menú móvil (subtasko 184).
- **Página**: `Favoritos` en `src/pages/MyReservations.tsx`, ruta `favoritos` en `src/rutas.ts` y `src/App.tsx` (subtasko 185).
- **Por cuenta (subtaskos 182 y 186)**: `favoritos` en `src/store.tsx` deja de ser una lista plana y pasa a `Record<string, string[]>` guardada **por clave de cuenta** (`correo` en minúsculas, o `"invitado"` sin sesión). En Fase 2 esa clave se reemplaza por `id_usuario`.
  - `claveDeFavoritos(usuario)` — devuelve la clave de la cuenta.
  - `favoritosDe(mapa, usuario)` — lista de la cuenta consultada.
  - `alternarFavoritoDe(lista, hotelId)` — agrega o quita sin duplicar.
  - `cargar()` migra los guardados viejos (lista plana) a la lista del invitado.

### Regla implementada

```ts
// src/data.ts — Favoritos por cuenta (HU-020)

// La lista pertenece a una cuenta; sin sesión se usa la clave de invitado
export function claveDeFavoritos(usuario: { correo: string } | null | undefined): string {
  const correo = usuario?.correo?.trim().toLowerCase();
  return correo ? correo : "invitado";
}

export function favoritosDe(
  mapa: Record<string, string[]>,
  usuario: { correo: string } | null | undefined
): string[] {
  return mapa[claveDeFavoritos(usuario)] ?? [];
}

// Marcar o quitar sin duplicar el hotel
export function alternarFavoritoDe(lista: string[], hotelId: string): string[] {
  return lista.includes(hotelId)
    ? lista.filter((f) => f !== hotelId)
    : [...lista, hotelId];
}
```
