# Cinemaloop — Frontend

Cliente web de Cinemaloop: un juego de encadenar actores y películas contra reloj, con ranking global. Este repositorio contiene únicamente la interfaz (Next.js + React + Tailwind CSS); toda la lógica de negocio, validación de partidas y acceso a datos vive en `cinemaloop-backend` (Cloud Functions de Firebase). El frontend nunca se conecta directamente a Firestore.

Las especificaciones funcionales completas (mecánica de juego, modelo de datos, fases de desarrollo) están en la carpeta `specs` del proyecto, fuera de este repositorio.

## Stack

- Next.js (App Router) con TypeScript en modo estricto.
- Tailwind CSS.
- Firebase Authentication (SDK de cliente) para login/registro.
- ESLint + Prettier.

El resto de herramientas (Vitest, React Testing Library, Playwright) se incorporan en un paso de configuración posterior; ver el backlog del proyecto en Linear.

## Estructura

```
src/
  app/            rutas de la aplicación (App Router)
design/
  handoff/        referencia de diseño entregada (no se modifica, solo se lee)
  tokens.ts       tokens de diseño extraídos del handoff (pendiente de generar)
public/           assets estáticos servidos tal cual
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
```

## Build de producción

```bash
npm run build
npm run start
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar con los valores del proyecto de Firebase correspondiente. Son valores de configuración del SDK de cliente (públicos por diseño); ninguna clave secreta vive en este repositorio ni en el frontend. Este proyecto no gestiona todavía entornos reales (desarrollo/staging/producción) — esa configuración se abordará más adelante.

## Despliegue

Pensado para desplegarse en Vercel a partir de este mismo repositorio, sin pasos de build adicionales fuera de `npm run build`. El despliegue concreto (proyecto de Vercel, dominio, variables de entorno de producción) se configura cuando el proyecto esté listo para publicarse.

## Relación con el resto del proyecto

- `cinemaloop-backend`: Cloud Functions, Firestore y reglas de seguridad. El frontend consume exclusivamente las Cloud Functions expuestas por ese repositorio.
- `specs`: especificaciones funcionales y técnicas, y registro de decisiones de arquitectura (ADRs).
- Backlog y seguimiento de tareas: proyecto Cinemaloop en Linear.
