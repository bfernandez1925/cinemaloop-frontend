# Cinemaloop — Frontend

Cliente web de Cinemaloop: un juego de encadenar actores y películas contra reloj, con ranking global — el jugador recibe un actor o una película y tiene que llegar al siguiente encadenando reparto y filmografía, sin repetir nodos, antes de que se acabe el tiempo. Este repositorio contiene únicamente la interfaz (Next.js + React + Tailwind CSS). Toda la lógica de negocio, la validación de cada turno y el único acceso a los datos viven en el repositorio hermano, [cinemaloop-backend](https://github.com/bfernandez1925/cinemaloop-backend) (Cloud Functions de Firebase) — este frontend nunca se conecta a Firestore directamente, ni siquiera para leer.

Las especificaciones funcionales completas (mecánica de juego, modelo de datos, fases de desarrollo) y las decisiones de arquitectura (ADRs) están en [cinemaloop-specs](https://github.com/bfernandez1925/cinemaloop-specs), el tercer repositorio del proyecto.

## Qué parte de Firebase usa este repositorio

Solo una: **Firebase Authentication**, a través de su SDK de cliente, para el login y el registro con email/contraseña. Todo lo demás — Firestore, Cloud Functions, Cloud Scheduler — vive exclusivamente en `cinemaloop-backend`; este repositorio ni siquiera tiene las credenciales para tocarlo. Las llamadas al backend se hacen con `httpsCallable` del SDK de Firebase Functions, nunca con `fetch` a mano.

El propio hosting de esta aplicación es **Firebase Hosting**: el build es un export estático de Next.js (no hay servidor Next.js corriendo en ningún sitio), servido desde el mismo proyecto de Firebase que usa el backend (`cinemaloop-platform`). La app está publicada en <https://cinemaloop-platform.web.app>.

## Stack

- Next.js (App Router) con TypeScript en modo estricto, exportado como sitio estático (`output: "export"`).
- Tailwind CSS.
- Firebase Authentication (SDK de cliente) para login/registro.
- ESLint + Prettier.
- Vitest + React Testing Library (tests de componente) y Playwright (e2e, incluida comparación visual contra el handoff de diseño).

## Estructura

```
src/
  app/            rutas de la aplicación (App Router)
  components/     componentes de UI compartidos entre rutas
  design/         tokens.ts (colores, tipografía) e icons.ts (mapeo a Lucide),
                  extraídos del handoff de diseño entregado fuera de este repo
  lib/            clientes de las Cloud Functions, sesión, autenticación
public/           assets estáticos servidos tal cual
test/
  unit/           tests de componente (Vitest + React Testing Library)
e2e/              tests e2e (Playwright): flujo completo + comparación visual
                  contra el handoff, con capturas de referencia por sistema
                  operativo (macOS y Linux, este último el mismo runner que CI)
```

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Comprobaciones de calidad

```bash
npm run lint         # ESLint
npm run format:check # Prettier, solo verifica
npm run format       # Prettier, aplica el formato
npm run typecheck    # tsc --noEmit
npm test             # Vitest + React Testing Library (componente)
npm run test:e2e     # Playwright, contra un build levantado automáticamente
```

Los navegadores de Playwright se instalan automáticamente en `npm install` (script `postinstall`), sin pasos manuales. `npm run test:e2e` compila el export estático apuntando al Auth Emulator de Firebase (`npm run build:e2e`, no al proyecto real) y lo sirve con `serve` en el puerto 3100 antes de correr los tests, y lo para al terminar — no requiere tener el servidor de desarrollo corriendo.

## CI

GitHub Actions (`.github/workflows/ci.yml`) tiene dos jobs. `test` (lint, typecheck, tests de componente, build) corre en cada push a `main`/`develop` y en cada pull request; un job en rojo bloquea el merge en `develop` (branch protection). `e2e` (Playwright) corre solo en push a `main`/`develop`, no en cada PR, para no alargar la vuelta de cada PR con el tiempo de build+start+navegador. Tiempos de referencia (medidos en la primera ejecución real, CIN-11): `test` ~63 s, `e2e` ~64 s (corren en paralelo, cada uno en su propio job).

## Build de producción

```bash
npm run build
npm run start   # sirve out/ con `serve`; next start no sirve un export estático
```

`npm run build` genera el sitio estático en `out/`. No hay `next start` real: el `package.json` usa el paquete `serve` para previsualizar ese mismo export en local, igual que hace Firebase Hosting en producción.

## Variables de entorno

La configuración del SDK de cliente de Firebase vive en `.env`, ya commiteado en el repositorio — no es un secreto: Firebase depende de las reglas de seguridad de Firestore/Auth para protegerse, no de ocultar esta configuración (ver [ADR-0001](https://github.com/bfernandez1925/cinemaloop-specs/blob/main/adr/0001-firebase-firestore-cloud-functions.md) en `cinemaloop-specs`). Apunta al proyecto real `cinemaloop-platform`; no hace falta generar nada para levantar el proyecto en local.

## Despliegue

Firebase Hosting, en el mismo proyecto `cinemaloop-platform` que usa el backend (ver [ADR-0007](https://github.com/bfernandez1925/cinemaloop-specs/blob/main/adr/0007-frontend-firebase-hosting-en-vez-de-vercel.md): se descartó Vercel porque no hay nada que renderizar en servidor, y todo lo demás del proyecto ya vive en Firebase).

```bash
npm run build
firebase deploy --only hosting --project cinemaloop-platform
```

El despliegue es manual, después de cada bloque de trabajo de frontend relevante — no hay despliegue continuo desde CI todavía.

## Relación con el resto del proyecto

- [cinemaloop-backend](https://github.com/bfernandez1925/cinemaloop-backend): Cloud Functions, Firestore y reglas de seguridad. El frontend consume exclusivamente las Cloud Functions expuestas por ese repositorio.
- [cinemaloop-specs](https://github.com/bfernandez1925/cinemaloop-specs): especificaciones funcionales y técnicas, y registro de decisiones de arquitectura (ADRs).
- Backlog y seguimiento de tareas: proyecto Cinemaloop en Linear.
