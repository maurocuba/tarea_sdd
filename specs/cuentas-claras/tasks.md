# Tareas — Cuentas Claras

Una tarea = un commit, solo cuando está en verde (pruebas, tipos, lint y build
sin errores). El commit incluye el checkbox marcado. Cada tarea empieza con sus
pruebas, escritas a partir de los criterios de los RQ que cubre. Ver CLAUDE.md.

## [x] T-01 Preparar el proyecto
- **Cubre**: ninguno (infraestructura)
- **Qué**: Vite + React + TypeScript estricto, Vitest + RTL + jsdom, ESLint, y
  los scripts `dev`, `build`, `test`, `lint`, `typecheck`. App mínima con el
  título "Cuentas Claras".
- **Pruebas primero**: prueba de humo que renderiza `App` y encuentra el
  título.
- **Hecho cuando**: los cuatro chequeos de "verde" pasan.

## [x] T-02 Dinero: leer y mostrar montos
- **Cubre**: RQ-03 (monto), RQ-09
- **Qué**: `money.ts` con `parseAmount(text)` → centavos o `null`,
  `formatAmount(cents)` y `formatSigned(cents)`.
- **Pruebas primero**: acepta "12", "12.5", "12,50", " 0,01 ", "1000000";
  rechaza "", "0", "0,001", "1.000,00", "-5", "abc", "1000000,01"; "0.10" son
  10 centavos exactos; formatea 5, 1250, 123450, 100000000 y los signos
  "+Bs 20,00", "-Bs 5,00", "Bs 0,00".
- **Hecho cuando**: ningún cálculo de dinero usa decimales.

## [x] T-03 Reparto y saldos
- **Cubre**: RQ-04, RQ-07
- **Qué**: `types.ts`, `split.ts` (`splitEqually`) y `balances.ts`
  (`computeBalances`).
- **Pruebas primero**: Bs 10,00 entre 3 da 334/333/333 y el sobrante va a los
  primeros; la suma de partes es el monto; un pagador que no está en "dividir
  entre"; saldos de un grupo con varios gastos; la suma de saldos es cero.
- **Hecho cuando**: los saldos de cualquier grupo suman cero.

## [x] T-04 Liquidación sugerida
- **Cubre**: RQ-08
- **Qué**: `settle.ts` (`suggestTransfers`).
- **Pruebas primero**: casos fijos (una deuda, dos deudores y un acreedor,
  empates resueltos por orden de la lista); sin deudas no hay transferencias;
  con grupos generados al azar, aplicar las transferencias deja todo en cero y
  hay como máximo k − 1.
- **Hecho cuando**: cumple los tres criterios de RQ-08 para cualquier grupo.

## [x] T-05 Validación y reducer del grupo
- **Cubre**: RQ-01, RQ-02, RQ-03 (validación y alta), RQ-06 (baja), RQ-12
- **Qué**: `validation.ts` (`validateName`, `validateExpense`) y
  `groupReducer.ts` con sus acciones y el selector `isParticipantInUse`.
- **Pruebas primero**: los tres mensajes de nombre y el tope de 20; los
  mensajes de descripción, monto y "dividir entre"; agregar al final; nombres
  repetidos sin distinguir mayúsculas; no se elimina un participante con
  gastos; `splitAmong` queda en el orden de la lista; `clearAll` vuelve al
  estado inicial.
- **Hecho cuando**: ninguna acción puede dejar el grupo inconsistente.

## [x] T-06 Persistencia
- **Cubre**: RQ-10
- **Qué**: `storage.ts` (`loadGroup`, `saveGroup`) y `useGroup.ts`.
- **Pruebas primero**: ida y vuelta de un grupo; datos ausentes, JSON roto,
  tipos incorrectos, montos fuera de rango, ids inexistentes y nombres
  repetidos dan el grupo vacío; `getItem` o `setItem` que lanzan no rompen
  nada; el hook guarda tras cada acción.
- **Hecho cuando**: recargar restaura el grupo y datos corruptos no rompen la
  app.

## [x] T-07 Interfaz: participantes
- **Cubre**: RQ-01, RQ-02, RQ-11
- **Qué**: `ParticipantsPanel.tsx`, `App.tsx` con `useGroup`, estilos base e
  `index.css` con foco visible.
- **Pruebas primero**: agregar con botón y con Enter; el campo se vacía y
  conserva el foco; mensajes de error con `aria-invalid` y
  `aria-describedby`; tope de 20 con su texto; "Eliminar <nombre>"
  deshabilitado con "Tiene gastos registrados"; lista vacía con su texto.
- **Hecho cuando**: se puede armar la lista de participantes.

## [x] T-08 Interfaz: gastos
- **Cubre**: RQ-03, RQ-05, RQ-06, RQ-11
- **Qué**: `ExpenseForm.tsx` y `ExpenseList.tsx` conectados a `App`.
- **Pruebas primero**: sin participantes muestra el texto; valores por
  defecto; todo o nada con los cuatro mensajes; tras registrar se limpian
  descripción y monto y el foco vuelve; participante nuevo aparece marcado;
  lista del más reciente al más antiguo con "Pagó" y "Entre:"; total;
  eliminar con confirmación aceptada y cancelada.
- **Hecho cuando**: se pueden registrar y borrar gastos.

## [x] T-09 Interfaz: saldos, liquidación y borrar todo
- **Cubre**: RQ-07, RQ-08, RQ-09, RQ-12
- **Qué**: `BalancesPanel.tsx`, `SettlementPanel.tsx` y el botón "Borrar
  todo" en `App`.
- **Pruebas primero**: filas con "+Bs", "-Bs" y "Bs 0,00" y sus textos;
  transferencias con su texto; "No hay deudas pendientes."; "Borrar todo"
  solo con participantes, con confirmación aceptada y cancelada; flujo
  completo en `App` de una cena entre tres.
- **Hecho cuando**: la app cubre las historias HU-1 a HU-4.

## [ ] T-10 Verificar contra la spec y cerrar
- **Cubre**: RQ-01 a RQ-12 (verificación)
- **Qué**: `verification.md` con el estado de cada criterio y su evidencia
  (pruebas, navegador y revisión estática); `README.md`; sincronizar spec,
  plan y tareas con el código final.
- **Pruebas primero**: no aplica (documentación); los cuatro chequeos siguen
  en verde.
- **Hecho cuando**: ningún criterio queda sin estado y el README explica cómo
  correr la app y cómo se aplicó SDD.

## Cobertura de requisitos

RQ-01 T-05, T-07 · RQ-02 T-05, T-07 · RQ-03 T-02, T-05, T-08 · RQ-04 T-03 ·
RQ-05 T-08 · RQ-06 T-05, T-08 · RQ-07 T-03, T-09 · RQ-08 T-04, T-09 ·
RQ-09 T-02, T-09 · RQ-10 T-06 · RQ-11 T-07, T-08 · RQ-12 T-05, T-09 ·
T-10 verifica RQ-01 a RQ-12
