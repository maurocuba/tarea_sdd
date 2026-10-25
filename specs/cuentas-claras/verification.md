# Verificación contra la spec

- **Fecha**: 2026-10-25
- **Código verificado**: commit `372378e` (T-01 a T-09 completas) más los cambios
  de T-10 (una prueba nueva y la sincronización de la spec, hallazgos H-1 y H-2).
- **Entorno**: Node v24.15.0, npm 12.1.0, Windows 11.
- **Spec**: `specs/cuentas-claras/spec.md` (Modelo y RQ-01 a RQ-12).

## Resultado de los comandos

| Comando | Resultado |
|---|---|
| `npm test` | 143 pruebas pasan, 15 archivos, 0 fallos |
| `npm run typecheck` | sin errores |
| `npm run lint` | sin errores |
| `npm run build` | compila; `dist/` = 1 HTML + 1 JS + 1 CSS |

## Resumen

52 criterios revisados:

| Estado | Cantidad |
|---|---|
| Cumple | 52 |
| No cumple | 0 |
| No verificable | 0 |

## Cómo se obtuvo la evidencia

- **Prueba**: nombre de la prueba automática (`archivo › nombre`). Corren en jsdom
  con Vitest y React Testing Library.
- **NAV**: navegador integrado sobre la build de producción (`npx vite preview`),
  con el escenario de la cena: Ana, Beto y Caro; "Cena" Bs 90 pagada por Ana entre
  los tres, "Taxi" Bs 30 pagado por Beto entre los tres y "Helado" Bs 10 pagado por
  Caro entre Beto y Caro. Captura en `docs/captura.jpg`.
- **Estático**: revisión del código fuente.

## Hallazgos

| ID | Hallazgo | Resolución |
|---|---|---|
| H-1 | RQ-11 pedía `aria-invalid` en "un campo con error", pero "Dividir entre" es un grupo de casillas y ARIA 1.2 no admite `aria-invalid` en el rol `group`. El código asociaba el mensaje al grupo con `aria-describedby`. | Hueco de la spec. Se aclaró RQ-11: `aria-invalid` en los campos de texto y el mensaje de "Dividir entre" asociado al grupo. Sin cambio de código. |
| H-2 | Al agregar un participante o registrar un gasto válidos, los mensajes de error anteriores desaparecen. El código lo hacía (y el panel de participantes tenía prueba), pero la spec no lo decía. | Se sincronizó la spec (RQ-01 y RQ-03) y se agregó la prueba `ExpenseForm.test.tsx › clears the error messages after a valid expense`. |

## Tabla de verificación

| ID | Criterio | Estado | Evidencia |
|---|---|---|---|
| MOD-1 | Estado inicial: sin participantes y sin gastos | Cumple | Prueba: `groupReducer.test.ts › starts with no participants and no expenses`; `storage.test.ts › starts empty when nothing is stored`. NAV: al abrir sin datos, "Todavía no hay participantes.", "Todavía no hay gastos." y "Total gastado: Bs 0,00". |
| RQ-01.1 | Se ignoran espacios al inicio y al final del nombre | Cumple | Prueba: `validation.test.ts › accepts a name and trims it`; `ParticipantsPanel.test.tsx › adds a trimmed name with the button, clears the field and keeps the focus (RQ-01)`. |
| RQ-01.2 | Nombre de 1 a 30 caracteres, único sin distinguir mayúsculas | Cumple | Prueba: `validation.test.ts › accepts 30 characters and rejects 31`; `rejects a repeated name ignoring case and outer spaces`; `groupReducer.test.ts › ignores invalid or repeated names`. NAV: "ana" con "Ana" ya cargada no se agregó. |
| RQ-01.3 | Botón o Enter agregan al final; el campo se vacía, conserva el foco y se limpia el error | Cumple | Prueba: `ParticipantsPanel.test.tsx › adds a trimmed name with the button, clears the field and keeps the focus (RQ-01)`; `adds a name with Enter (RQ-01)`; `clears the error after a valid name`; `groupReducer.test.ts › adds trimmed names at the end of the list with fresh ids`. NAV: Ana, Beto y Caro agregados con Enter, en ese orden. |
| RQ-01.4 | Mensajes "Ingresa un nombre.", "El nombre puede tener hasta 30 caracteres." y "Ya existe un participante con ese nombre." | Cumple | Prueba: `ParticipantsPanel.test.tsx › rejects "" / "xxx…" / "ana" with its message tied to the field (RQ-01, RQ-11)`. NAV: "Ya existe un participante con ese nombre." al intentar "ana". |
| RQ-01.5 | Máximo 20: campo y botón deshabilitados con "Máximo 20 participantes." | Cumple | Prueba: `ParticipantsPanel.test.tsx › disables adding at 20 participants with a text (RQ-01)`; `groupReducer.test.ts › stops at the maximum number of participants`. |
| RQ-01.6 | Sin participantes: "Todavía no hay participantes." | Cumple | Prueba: `ParticipantsPanel.test.tsx › shows a text when there are no participants (RQ-01)`. NAV: visible al abrir sin datos. |
| RQ-02.1 | Botón "Eliminar" con nombre accesible "Eliminar <nombre>" | Cumple | Prueba: `ParticipantsPanel.test.tsx › removes a participant without expenses at once (RQ-02)` (lo busca por ese nombre). |
| RQ-02.2 | Con gastos: botón deshabilitado y "Tiene gastos registrados" | Cumple | Prueba: `ParticipantsPanel.test.tsx › cannot remove a participant with expenses (RQ-02)`; `App.test.tsx › blocks removing a participant with expenses until the expense is removed (RQ-02, RQ-06)`; `groupReducer.test.ts › keeps a participant who paid or shares an expense`. NAV: los tres muestran "Tiene gastos registrados" tras cargar los gastos. |
| RQ-02.3 | Sin gastos: se elimina de inmediato, sin confirmación | Cumple | Prueba: `App.test.tsx › adds and removes participants (RQ-01, RQ-02)` (sin simular `confirm`); `groupReducer.test.ts › removes a participant without expenses`. |
| RQ-03.1 | Sección "Nuevo gasto" con Descripción, Monto (Bs), Pagó, Dividir entre y "Registrar gasto" | Cumple | Prueba: `ExpenseForm.test.tsx › starts with the first payer and everyone checked`; `registers a valid expense and resets the form`. NAV: los cinco controles presentes. |
| RQ-03.2 | Sin participantes: "Agrega participantes para registrar gastos." | Cumple | Prueba: `ExpenseForm.test.tsx › asks for participants when there are none`. NAV: visible al abrir sin datos. |
| RQ-03.3 | Descripción de 1 a 60 caracteres, con su mensaje | Cumple | Prueba: `validation.test.ts › accepts 60 characters of description and rejects 61 or none`; `ExpenseForm.test.tsx › registers nothing and shows every message when fields are invalid (RQ-03, RQ-11)`. |
| RQ-03.4 | Monto con punto o coma, hasta 2 decimales, 0,01 a 1.000.000, con su mensaje | Cumple | Prueba: `money.test.ts › parseAmount (RQ-03)` (8 casos aceptados y 15 rechazados); `keeps cents exact without floating point errors`; `validation.test.ts › rejects an invalid amount`. NAV: "1.000,00" mostró el mensaje del monto. |
| RQ-03.5 | "Pagó" empieza en el primero y vuelve al primero si se elimina el elegido | Cumple | Prueba: `ExpenseForm.test.tsx › starts with the first payer and everyone checked`; `falls back to the first payer when the chosen one is removed`. |
| RQ-03.6 | "Dividir entre": todas marcadas, las nuevas marcadas, al menos una | Cumple | Prueba: `ExpenseForm.test.tsx › starts with the first payer and everyone checked`; `checks a participant added later`; `App.test.tsx › shows a new participant checked in the expense form (RQ-03)`; `validation.test.ts › requires at least one person to split with`. |
| RQ-03.7 | Todo o nada, con botón o Enter; cada campo inválido muestra su mensaje | Cumple | Prueba: `ExpenseForm.test.tsx › registers nothing and shows every message when fields are invalid (RQ-03, RQ-11)`; `only flags the fields that are invalid`; `registers with Enter in a text field`; `validation.test.ts › reports every invalid field at once`. NAV: con descripción vacía y monto inválido no se registró nada y aparecieron ambos mensajes. |
| RQ-03.8 | Tras registrar: se vacían descripción y monto, "Pagó" se conserva, casillas marcadas, errores limpios, foco en Descripción | Cumple | Prueba: `ExpenseForm.test.tsx › registers a valid expense and resets the form`; `clears the error messages after a valid expense`. NAV: tras "Taxi" con Pagó = Beto, el campo "Pagó" siguió en Beto. |
| RQ-04.1 | Cada persona recibe ⌊M / n⌋ centavos | Cumple | Prueba: `split.test.ts › splits evenly when there is no leftover`; `gives everything to a single person`. |
| RQ-04.2 | Los centavos sobrantes van de a uno a los primeros, en orden de la lista | Cumple | Prueba: `split.test.ts › hands out several leftover cents one by one in order`; `gives a cent only to the first people when the amount is smaller than the group`; `groupReducer.test.ts › adds the expense with splitAmong in participant list order`. |
| RQ-04.3 | La suma de las partes es el monto exacto | Cumple | Prueba: `split.test.ts › always adds up to the exact amount` (montos de 1 a 500 con 1 a 20 personas). |
| RQ-04.4 | Ejemplo: Bs 10,00 entre tres → 3,34 / 3,33 / 3,33 | Cumple | Prueba: `split.test.ts › gives the leftover cents to the first people: Bs 10,00 among 3`; `App.test.tsx › splits Bs 10,00 among three with the extra cent to the first (RQ-04)`. |
| RQ-05.1 | Gastos del más reciente al más antiguo | Cumple | Prueba: `ExpenseList.test.tsx › shows the newest expense first with payer and split`; `App.test.tsx › registers expenses and lists them newest first (RQ-03, RQ-05)`. NAV: Helado, Taxi, Cena. |
| RQ-05.2 | Descripción, monto, "Pagó <nombre>" y "Entre: <nombres>" en orden de la lista | Cumple | Prueba: `ExpenseList.test.tsx › shows the newest expense first with payer and split`. NAV: "Helado · Bs 10,00 · Pagó Caro · Entre: Beto, Caro". |
| RQ-05.3 | "Total gastado: <monto>" | Cumple | Prueba: `ExpenseList.test.tsx › shows the total spent`. NAV: "Total gastado: Bs 130,00". |
| RQ-05.4 | Sin gastos: "Todavía no hay gastos." y "Total gastado: Bs 0,00" | Cumple | Prueba: `ExpenseList.test.tsx › shows a text and a zero total without expenses`. NAV: visible al abrir sin datos. |
| RQ-06.1 | Botón con nombre accesible "Eliminar gasto <descripción>" | Cumple | Prueba: `ExpenseList.test.tsx › asks for confirmation and removes it when accepted` (lo busca por ese nombre). |
| RQ-06.2 | Confirmación `¿Eliminar el gasto "<descripción>"?` | Cumple | Prueba: `ExpenseList.test.tsx › asks for confirmation and removes it when accepted`. |
| RQ-06.3 | Si se acepta, el gasto desaparece y todo se recalcula | Cumple | Prueba: `App.test.tsx › blocks removing a participant with expenses until the expense is removed (RQ-02, RQ-06)`; `groupReducer.test.ts › removes only that expense`. Estático: saldos, liquidación y total se derivan del grupo en cada render (`App.tsx`, `ExpenseList.tsx`). |
| RQ-06.4 | Si se cancela, no cambia nada | Cumple | Prueba: `ExpenseList.test.tsx › keeps it when cancelled`. |
| RQ-07.1 | Una fila por participante, en orden, con saldo y "le deben" / "debe" / "está al día" | Cumple | Prueba: `BalancesPanel.test.tsx › shows one row per participant in list order with sign and status`; `balances.test.ts › keeps the order of the participant list`; `App.test.tsx › settles a dinner among three friends (RQ-04, RQ-07, RQ-08)`. NAV: Ana +Bs 50,00 le deben, Beto -Bs 15,00 debe, Caro -Bs 35,00 debe. |
| RQ-07.2 | La suma de los saldos es cero | Cumple | Prueba: `balances.test.ts › always adds up to zero`; `settle.test.ts › settles everyone with at most k - 1 transfers for any generated group` (300 grupos generados). NAV: 50 − 15 − 35 = 0. |
| RQ-07.3 | Sin participantes: "Todavía no hay participantes." | Cumple | Prueba: `BalancesPanel.test.tsx › shows a text without participants`. NAV: visible al abrir sin datos. |
| RQ-08.1 | Texto "<deudor> paga <monto> a <acreedor>" | Cumple | Prueba: `SettlementPanel.test.tsx › lists each transfer as "<deudor> paga <monto> a <acreedor>"`. NAV: "Caro paga Bs 35,00 a Ana", "Beto paga Bs 15,00 a Ana". |
| RQ-08.2 | Mayor deudor paga al mayor acreedor el menor importe; empates por orden de la lista | Cumple | Prueba: `settle.test.ts › pairs the largest debtor with the largest creditor first`; `splits a large debt across creditors`; `breaks ties by participant list order`. |
| RQ-08.3 | Aplicar todas las transferencias deja todo en cero | Cumple | Prueba: `settle.test.ts › settles everyone with at most k - 1 transfers for any generated group`. |
| RQ-08.4 | Como máximo k − 1 transferencias | Cumple | Prueba: `settle.test.ts › settles everyone with at most k - 1 transfers for any generated group`; `has every debtor pay the only creditor`. |
| RQ-08.5 | Todos en cero: "No hay deudas pendientes." | Cumple | Prueba: `SettlementPanel.test.tsx › says there are no pending debts when there are no transfers`; `App.test.tsx › says there are no pending debts when everyone is even (RQ-08)`. NAV: visible al abrir sin datos. |
| RQ-09.1 | "Bs " + miles con punto + coma decimal + dos decimales | Cumple | Prueba: `money.test.ts › formatAmount (RQ-09)` (0, 5, 1250, 99999, 123450 y 100000000 centavos). Estático: formato armado a mano, sin `Intl`. |
| RQ-09.2 | Saldos con "+" y "-"; cero como "Bs 0,00" | Cumple | Prueba: `money.test.ts › formatSigned (RQ-09)`; `BalancesPanel.test.tsx › shows one row per participant in list order with sign and status`. NAV: "+Bs 50,00", "-Bs 15,00". |
| RQ-10.1 | Se guarda tras cada cambio y se restaura al recargar | Cumple | Prueba: `useGroup.test.tsx › saves after every change`; `restores the group after a remount, like a page reload`; `storage.test.ts › saves and loads a group as it was`; `App.test.tsx › keeps participants after a reload (RQ-10)`. NAV: tras recargar la página, los tres participantes, los tres gastos y los saldos siguieron iguales. |
| RQ-10.2 | Datos ausentes, ilegibles o inválidos: estado inicial sin errores | Cumple | Prueba: `storage.test.ts › starts empty when nothing is stored`, los 17 casos `starts empty with …` y `starts empty when the storage cannot be read`. |
| RQ-10.3 | Si no se puede escribir, la app sigue sin errores | Cumple | Prueba: `storage.test.ts › does not throw when the storage cannot be written`. Estático: `saveGroup` envuelve `setItem` en `try/catch`. |
| RQ-10.4 | Sin llamadas de red | Cumple | Estático: no hay `fetch`, `XMLHttpRequest`, `WebSocket` ni `sendBeacon` en `src/`. NAV: la página solo pidió `/`, el JS y el CSS de la build, todos a `localhost`. |
| RQ-11.1 | Textos visibles en español | Cumple | Estático: todos los textos de los componentes son los de la spec; las pruebas de componentes los buscan palabra por palabra. NAV: página completa en español. |
| RQ-11.2 | Etiqueta visible por campo; casillas en el grupo "Dividir entre" | Cumple | Prueba: todas las pruebas de componentes ubican los campos con `getByLabelText` y el grupo con `getByRole('group', { name: 'Dividir entre' })`. Estático: `<label htmlFor>` en cada campo y `<fieldset>` con `<legend>`. |
| RQ-11.3 | `aria-invalid` y `aria-describedby` en campos con error; mensaje de "Dividir entre" asociado al grupo | Cumple | Prueba: `ParticipantsPanel.test.tsx › rejects … with its message tied to the field (RQ-01, RQ-11)`; `ExpenseForm.test.tsx › registers nothing and shows every message when fields are invalid (RQ-03, RQ-11)`. NAV: los campos inválidos tenían `aria-invalid="true"` y su mensaje enlazado. |
| RQ-11.4 | Todo se usa con teclado y con foco visible | Cumple | Prueba: `focus.test.ts › defines a global :focus-visible outline`; `never removes the outline of a control`; las pruebas con `user-event` usan Enter en los campos. NAV: con Tab el foco pasa por "Borrar todo" y "Nombre" con contorno sólido de 3px; los participantes y gastos se cargaron con el teclado. Estático: todos los controles son `button`, `input` o `select` nativos. |
| RQ-12.1 | "Borrar todo" solo con al menos un participante | Cumple | Prueba: `App.test.tsx › Borrar todo (RQ-12) › is only shown when there are participants`. NAV: el botón no aparece sin datos y aparece con participantes. |
| RQ-12.2 | Confirmación "¿Borrar todos los participantes y gastos?" | Cumple | Prueba: `App.test.tsx › Borrar todo (RQ-12) › empties the group after confirming, and that is saved`. |
| RQ-12.3 | Si se acepta: estado inicial guardado | Cumple | Prueba: `App.test.tsx › Borrar todo (RQ-12) › empties the group after confirming, and that is saved`; `groupReducer.test.ts › goes back to the initial state`; `useGroup.test.tsx › saves after every change`. |
| RQ-12.4 | Si se cancela, no cambia nada | Cumple | Prueba: `App.test.tsx › Borrar todo (RQ-12) › changes nothing when cancelled`. |
