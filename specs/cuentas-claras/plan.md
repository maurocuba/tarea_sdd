# Plan técnico — Cuentas Claras

## Stack y herramientas

- React + TypeScript (`strict`) + Vite, gestionado con npm.
- Pruebas: Vitest + React Testing Library + `@testing-library/user-event` +
  `@testing-library/jest-dom`, en entorno jsdom. Sin pruebas e2e en v1.
- Lint: ESLint con `typescript-eslint` y `eslint-plugin-react-hooks`.
- Scripts de `package.json`: `dev`, `build`, `test` (`vitest run`), `lint`
  (`eslint .`) y `typecheck` (`tsc --noEmit`). "Verde" = `test`, `typecheck`,
  `lint` y `build` sin errores (ver CLAUDE.md).
- Estilos: CSS Modules con variables CSS, `:focus-visible` para el foco y
  `prefers-color-scheme` para el tema claro u oscuro. Sin librerías.

## Ejecución

- Desarrollo: `npm run dev` y abrir la dirección que muestra Vite.
- Build: `npm run build` y servirla con `npx vite preview` (no funciona con
  doble clic en `dist/index.html` porque usa rutas absolutas).

## Arquitectura

Tres capas. El **dominio** son funciones puras sin React (el dinero y las
cuentas). El **estado** es un reducer puro más un hook que lo conecta a
`localStorage`. Los **componentes** solo muestran datos y despachan acciones.

```
src/
  main.tsx, App.tsx, App.module.css, index.css, setupTests.ts
  domain/
    types.ts         Participant, Expense, Group, Balance, Transfer
    money.ts         parseAmount y formatAmount / formatSigned (RQ-03, RQ-09)
    split.ts         splitEqually: partes con reparto de centavos (RQ-04)
    balances.ts      computeBalances: pagado, consumido y saldo (RQ-07)
    settle.ts        suggestTransfers: liquidación greedy (RQ-08)
    validation.ts    validateName y validateExpense (RQ-01, RQ-03)
  state/
    groupReducer.ts  acciones del grupo y selectores (RQ-01 a RQ-03, RQ-06, RQ-12)
    storage.ts       loadGroup / saveGroup con validación (RQ-10)
    useGroup.ts      useReducer + guardado tras cada cambio
  components/
    ParticipantsPanel.tsx   alta y baja de participantes (RQ-01, RQ-02)
    ExpenseForm.tsx         formulario de gasto (RQ-03)
    ExpenseList.tsx         lista, total y baja de gastos (RQ-05, RQ-06)
    BalancesPanel.tsx       saldos (RQ-07)
    SettlementPanel.tsx     transferencias sugeridas (RQ-08)
```

Las pruebas viven junto a cada archivo (`*.test.ts` / `*.test.tsx`).

## Decisiones

- **Dinero en centavos**: todo monto es un `number` entero de centavos. Solo
  `parseAmount` convierte texto a centavos (con una expresión regular, sin
  `parseFloat`, para no arrastrar errores de coma flotante) y solo
  `formatAmount` convierte centavos a texto. El formato se arma a mano en vez
  de con `Intl.NumberFormat`, porque el resultado de `Intl` varía entre
  navegadores y versiones de Node y la spec fija el texto exacto.
- **Identificadores**: el grupo guarda un contador `nextId`; cada participante
  y gasto recibe `p<n>` o `e<n>`. Es determinista (útil en pruebas) y no
  depende de `crypto`.
- **Estado**: `Group = { participants: Participant[], expenses: Expense[],
  nextId: number }` con `Participant = { id, name }` y
  `Expense = { id, description, amount, paidBy, splitAmong }`
  (`paidBy` y `splitAmong` son ids). Los gastos se guardan en orden de alta;
  la lista los invierte para mostrar el más reciente primero (RQ-05).
- **Reducer**: acciones `addParticipant(name)`, `removeParticipant(id)`,
  `addExpense(draft)`, `removeExpense(id)` y `clearAll`. Recibe datos ya
  validados por la UI, pero igual protege las invariantes: ignora un nombre
  inválido o repetido, la baja de un participante con gastos y un gasto que
  nombre ids inexistentes. Así un error de la UI no puede romper el modelo.
- **Orden en "dividir entre"**: `splitAmong` se normaliza al orden de la lista
  al crear el gasto, para que el reparto de centavos (RQ-04) y el texto
  "Entre:" (RQ-05) usen ese orden sin volver a ordenar.
- **Saldos derivados**: los saldos y la liquidación no se guardan; se calculan
  en cada render con `computeBalances` y `suggestTransfers`. Son O(gastos ×
  personas), despreciable con 20 personas.
- **Liquidación (RQ-08)**: algoritmo greedy. Se toman las personas con saldo
  distinto de cero; en cada paso el mayor deudor paga al mayor acreedor el
  mínimo de ambos importes, y al menos uno de los dos queda en cero. Por eso
  hay como máximo k − 1 transferencias para k personas con saldo. Los empates
  se resuelven por índice en la lista. No se busca el mínimo absoluto de
  transferencias (es un problema NP-difícil); el greedy cumple la cota de la
  spec.
- **Formulario de gasto (RQ-03)**: guarda en borrador los textos, el pagador y
  el conjunto de ids **desmarcados** (no el de marcados): así un participante
  nuevo aparece marcado sin código extra. Si el pagador elegido ya no existe,
  se usa el primero. Valida los cuatro campos al enviar y solo despacha si
  todos son válidos.
- **Confirmaciones (RQ-06, RQ-12)**: `window.confirm`. En las pruebas se
  simula con `vi.spyOn(window, 'confirm')`.
- **Persistencia (RQ-10)**: clave `cuentas-claras.v1`, JSON del `Group`.
  `useGroup` lee una vez al montar y escribe en un efecto tras cada cambio.
  `loadGroup` valida estructura, tipos, rangos, nombres únicos e ids
  referenciados; ante cualquier fallo devuelve el grupo vacío. Lectura y
  escritura van en `try/catch`.
- **Accesibilidad (RQ-11)**: `<label htmlFor>` en cada campo, `aria-invalid` y
  `aria-describedby` apuntando al mensaje de error, casillas dentro de un
  `<fieldset>` con `<legend>Dividir entre</legend>`, y botones de eliminar con
  `aria-label` que incluye el nombre o la descripción.

## Estrategia de pruebas (TDD por tarea)

| RQ | Dónde se prueba |
|---|---|
| 03 (monto), 09 | `money.test.ts` |
| 04 | `split.test.ts` |
| 07 | `balances.test.ts` |
| 08 | `settle.test.ts` (casos fijos y una prueba de propiedades con grupos generados) |
| 01, 03 (validación) | `validation.test.ts` |
| 01, 02, 03, 06, 12 | `groupReducer.test.ts` |
| 10 | `storage.test.ts` y `useGroup.test.tsx` |
| 01, 02, 11 | `ParticipantsPanel.test.tsx` |
| 03, 11 | `ExpenseForm.test.tsx` |
| 05, 06 | `ExpenseList.test.tsx` |
| 07, 08 | `BalancesPanel.test.tsx` y `SettlementPanel.test.tsx` |
| 01 a 12 (integración) | `App.test.tsx`: flujos completos con `user-event` |
| 11 (foco visible) | `focus.test.ts` lee los CSS del disco (jsdom no calcula estilos) |

## Orden de construcción

Ver `tasks.md` (T-01 a T-10): setup, dominio del dinero, reparto y saldos,
liquidación, reducer, persistencia, y después la interfaz por secciones
(participantes, gastos, resumen) para terminar con la verificación contra la
spec.
