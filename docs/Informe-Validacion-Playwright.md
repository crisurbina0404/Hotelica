# Informe de validación de datos — Hotelica (Playwright)

**Suite:** [tests/CP-050-validacion-de-datos.spec.ts](../tests/CP-050-validacion-de-datos.spec.ts)
**Informe HTML:** [docs/informe-playwright/index.html](informe-playwright/index.html)
**Fecha:** 31 de octubre de 2026 · **Navegador:** Chromium (Desktop Chrome) · **Servidor:** Vite en `localhost:3000`

---

## 1. Resultado

Los seis defectos detectados en la auditoría **están corregidos** y sus pruebas quedaron como regresión permanente, sin `test.fail()`: si alguno vuelve, la suite se pone en rojo.

```bash
npm run typecheck                                   # 0 errores
npx playwright test tests/CP-050-…                  # 9 de 9
npm run test:e2e                                    # 27 de 27
```

| Comprobación | Resultado | Salida |
|---|---|---|
| `npm run typecheck` | Sin errores | `0` |
| Suite CP-050 | 9 de 9 | `0` |
| Suite completa `test:e2e` | 27 de 27 | `0` |

---

## 2. Correcciones aplicadas

### CP-050.1 — Fecha de llegada vacía en el buscador
**Archivo:** [src/pages/Home.tsx:55](../src/pages/Home.tsx#L55)
Se valida que las dos fechas existan y que la llegada no sea anterior a hoy, antes de comparar el rango. Antes, `""` pasaba la comparación de cadenas y la pantalla quedaba con **"Invalid Date"**.

### CP-050.2 — Rango de fechas invertido en Explorar hoteles
**Archivos:** [src/pages/Results.tsx:126](../src/pages/Results.tsx#L126), [src/data.ts:1050](../src/data.ts#L1050)
El envío del formulario ahora avisa con `role="alert"` ("La fecha de salida debe ser posterior a la fecha de llegada.") y el formulario usa `noValidate`. Además, mientras las fechas no sean válidas **la lista de hoteles se reemplaza** por "Elegí tus fechas": ya no se afirma disponibilidad con un rango imposible, que era el riesgo de sobreventa.

### CP-050.3 — Más de 10 adultos (o menos de 1)
**Archivos:** [src/pages/Results.tsx:145](../src/pages/Results.tsx#L145), [src/pages/HotelDetail.tsx:259](../src/pages/HotelDetail.tsx#L259)
El nuevo helper `acotarNumero()` en [src/data.ts:1042](../src/data.ts#L1042) lleva lo escrito al rango real en el momento de tipear: adultos 1–10, niños 0–8, huéspedes 1–10. El campo ya no se queda con 99.

### CP-050.4 — Disponibilidad afirmada sin fechas
**Archivo:** [src/pages/HotelDetail.tsx:50](../src/pages/HotelDetail.tsx#L50)
Con fechas incompletas o invertidas, la ficha muestra el distintivo **"Elegí tus fechas"** en cada habitación y un aviso en lugar de "4 disponibles". Los botones de reserva ya estaban deshabilitados; ahora el texto no contradice ese estado.

### CP-050.5 — Recuperación de contraseña sin validar el correo
**Archivos:** [src/store.tsx:1605](../src/store.tsx#L1605), [src/pages/ForgotPassword.tsx:25](../src/pages/ForgotPassword.tsx#L25)
`olvidarContrasena()` aplica `esCorreo()` **antes** de llamar a Supabase, igual que el acceso y el registro. Un correo como `ana@correo` recibe "Revisá tu correo: le falta el @ o el dominio." y no se hace ninguna petición.

### CP-050.6 — Registro con un nombre sin letras
**Archivos:** [src/layout.tsx:119](../src/layout.tsx#L119), [src/store.tsx:1501](../src/store.tsx#L1501)
El nombre debe incluir al menos una letra. La comprobación está en la ventana y otra vez en el store, que es quien crea la cuenta: "123" no llega a Supabase.

---

## 3. Qué cubren las nueve pruebas

| Prueba | Verifica |
|---|---|
| CP-050.1 | Con la llegada vacía no se navega, se avisa y no aparece "Invalid Date" |
| CP-050.2 | Rango invertido → aviso + lista reemplazada por "Elegí tus fechas" |
| CP-050.3 | Escribir 99 deja el campo en 10 y no hay resultados para 99 huéspedes |
| CP-050.4 | Sin fecha de llegada no aparece ningún "N disponibles" |
| CP-050.5 | Correo sin dominio → mensaje en español y **0 peticiones** a Supabase |
| CP-050.6 | Nombre "123" → aviso y **0 peticiones** de alta |
| Buscador | Sin departamento avisa y no navega |
| Registro | Contraseña sin símbolo rechazada con su criterio |
| Inscripción | Teléfono de 3 dígitos rechazado con el formato esperado |

Las pruebas de CP-050.5 y CP-050.6 no solo comparan textos: cuentan las peticiones, para probar que la validación ocurre antes de salir a la red.

---

## 4. Cómo abrir y repetir

```bash
# Informe HTML con las capturas de cada caso
npx playwright show-report docs/informe-playwright

# Solo esta auditoría
npx playwright test tests/CP-050-validacion-de-datos.spec.ts
```

---

## 5. Limitaciones

- Cubre pantallas públicas: buscador, resultados, ficha, acceso, registro, recuperación e inscripción.
- **No** cubre el panel del hotelero ni la consola de administración: requieren una cuenta de hotelero, y no hay ninguna sembrada ni acceso a Supabase desde este entorno.
- El flujo completo de reserva (modal de 3 pasos) no se ejecutó: exige sesión iniciada.
- Las pruebas bloquean la red externa (`sinRedExterna`) para no tocar la base real ni enviar correos; validan el cliente, no las políticas RLS ni la autenticación del servidor.
