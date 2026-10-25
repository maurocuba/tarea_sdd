# CLAUDE.md — Cuentas Claras (constitución del proyecto)

Reglas que valen para todo el proyecto. Si una instrucción puntual choca con
algo de aquí, se avisa y se pregunta antes de seguir.

## Proyecto

Cuentas Claras: app web para dividir gastos compartidos entre un grupo de
personas (un viaje, una cena, un departamento compartido). Registra quién pagó
qué, calcula cuánto debe o le deben a cada uno y sugiere las transferencias
para quedar a mano. Corre solo en el navegador: sin backend y sin deploy.

## Idioma

- Documentos (`spec.md`, `plan.md`, `tasks.md`, `verification.md`, `README.md`
  y este archivo): español.
- Código (identificadores y comentarios) y mensajes de commit: inglés.
- Los textos visibles de la app los define la spec, palabra por palabra.

## Stack y límites

- React + TypeScript (`strict: true`) + Vite. Pruebas con Vitest y React
  Testing Library.
- Sin frameworks sobre React (Next, Remix, etc.).
- Sin librerías de UI (MUI, Chakra, etc.) ni de CSS (Tailwind, Bootstrap,
  etc.). Estilos propios con CSS Modules.
- Sin librerías de estado (Redux, Zustand, etc.): `useReducer` alcanza.
- Sin backend ni llamadas de red. La persistencia es solo `localStorage`.
- Los montos se manejan siempre como enteros en centavos. Prohibido sumar o
  dividir dinero con números decimales (`0.1 + 0.2`).
- Se pueden instalar dependencias de desarrollo sin pedir permiso si respetan
  estos límites. Una dependencia de producción nueva (además de React) se
  consulta antes.

## Documentos

- `specs/cuentas-claras/spec.md`: **qué** hace la app. Requisitos `RQ-xx`, cada
  uno con criterios de aceptación verificables.
- `specs/cuentas-claras/plan.md`: **cómo** se construye (stack, arquitectura,
  decisiones y estrategia de pruebas).
- `specs/cuentas-claras/tasks.md`: tareas `T-xx` ordenadas. Cada una lista los
  `RQ-xx` que cubre, sus pruebas y cuándo está hecha, con un checkbox.
- `specs/cuentas-claras/verification.md`: cada criterio de la spec con su
  estado y su evidencia.
- Orden de trabajo: constitución → spec → plan → tasks → código → verificación.
  La spec manda: si el código y la spec no coinciden, el error es del código,
  salvo que se acuerde cambiar la spec.

## Spec-anchored

- La spec no se descarta al terminar: se mantiene viva junto al código.
- Si una tarea cambia el comportamiento visible de la app, la spec (y el plan,
  si aplica) se actualiza en el mismo commit que el código.
- Nunca se cambia el comportamiento sin cambiar antes o a la vez el requisito
  `RQ-xx` correspondiente.
- Si un cambio no tiene requisito, se propone uno nuevo y se consulta antes de
  escribirlo.

## Pruebas

- Se escriben antes del código (TDD), por tarea, a partir de los criterios de
  aceptación de los `RQ-xx` que la tarea cubre. Primero se ven fallar, luego se
  implementa hasta ponerlas en verde.
- Cada prueba nombra en su título el `RQ-xx` que comprueba cuando aplica.
- Una tarea está "verde" cuando, sin errores:
  1. pasa la suite completa de pruebas (`npm test`), no solo las nuevas,
  2. pasa el chequeo de tipos (`npm run typecheck`),
  3. pasa el linter (`npm run lint`),
  4. compila el build de producción (`npm run build`).
- Prohibido saltar (`skip`/`only`), borrar o debilitar pruebas para ponerlas en
  verde. Si algo falla, se reporta con su salida.

## Commits

- Un commit por tarea de `tasks.md`, solo si la tarea está en verde.
- El commit incluye: código, pruebas, el checkbox marcado en `tasks.md` y, si
  aplica, los cambios de spec y plan.
- Formato Conventional Commits, en inglés, en imperativo, sin ID de tarea:
  `tipo: descripción`, p. ej. `feat: add equal split of expenses`.
  Tipos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`.

## Permisos

Requieren OK explícito antes de hacerse:
- Cambiar la spec o el plan fuera de una tarea (se propone el texto exacto
  antes de editar).
- Acciones destructivas o de git remoto que reescriben historia:
  `reset --hard`, `rebase`, `push --force`, amend de commits ya publicados,
  borrar ramas.

Se hacen sin preguntar:
- Instalar dependencias de desarrollo (dentro de los límites del stack).
- Los commits normales de tarea, cuando está en verde, y `git push` a `main`.
