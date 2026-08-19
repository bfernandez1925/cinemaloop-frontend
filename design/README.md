# Design

Esta carpeta aloja los artefactos de diseño consumidos por la aplicación:

- `handoff/` — referencia de diseño entregada (`CinemaLoop.dc.html`, `assets/`, `README.md`). Se copia aquí tal cual desde la carpeta de handoff recibida; no se modifica. Solo se usa como referencia de lectura, nunca se despliega.
- `tokens.ts` — tokens de diseño (color, tipografía, espaciado) extraídos del handoff, consumidos por `tailwind.config.ts` como fuente única de verdad. Se genera en un paso posterior (ver issue "Extraer tokens del handoff a design/tokens.ts + Tailwind config" en Linear).

Ver `spec-design-fidelity.md` en `cinemaloop-specs` para el detalle completo de tokens, mapeo de iconos y reglas de fidelidad visual.
