# Cuentas Claras — Especificación

## Resumen

App web que corre solo en el navegador para dividir gastos compartidos entre
un grupo de personas. Se agregan los participantes, se registra cada gasto
(quién lo pagó y entre quiénes se divide) y la app muestra el saldo de cada
persona y una lista corta de transferencias para que todos queden a mano.

## Usuarios e historias

- **HU-1** Como organizador de un viaje, quiero anotar quién pagó cada gasto
  para no depender de la memoria al final del viaje.
- **HU-2** Como participante, quiero ver cuánto debo o cuánto me deben para
  saber mi situación sin hacer cuentas a mano.
- **HU-3** Como grupo, queremos la menor cantidad razonable de transferencias
  para saldar todo, en lugar de que cada uno le pague a cada uno.
- **HU-4** Como usuario, quiero que los datos sigan ahí si cierro y vuelvo a
  abrir la pestaña.

## Modelo

- **Grupo**: hay un único grupo por navegador, formado por una lista de
  participantes y una lista de gastos.
- **Participante**: tiene un nombre. La lista conserva el orden en que se
  agregaron ("orden de la lista"); ese orden se usa en todas las pantallas y en
  los desempates.
- **Gasto**: tiene descripción, monto, el participante que lo pagó ("pagador")
  y el conjunto de participantes entre quienes se divide ("dividir entre").
  El pagador puede o no estar entre quienes se divide.
- **Monto**: cantidad en bolivianos con dos decimales. Internamente se maneja
  en centavos enteros.
- **Parte**: lo que le toca pagar a una persona de un gasto (RQ-04).
- **Pagado** de una persona = suma de los montos de los gastos que pagó.
  **Consumido** = suma de sus partes en todos los gastos.
  **Saldo** = pagado − consumido. Saldo positivo: le deben. Negativo: debe.
  Cero: está al día.
- **Estado inicial**: sin participantes y sin gastos.

## Requisitos

### RQ-01 Agregar participante
La sección "Participantes" tiene un campo "Nombre" y un botón "Agregar".
- Se ignoran los espacios al inicio y al final del nombre.
- Nombre válido: de 1 a 30 caracteres, y distinto de los nombres existentes
  sin distinguir mayúsculas de minúsculas ("ana" y "Ana" son el mismo).
- Al pulsar "Agregar" (o Enter en el campo) con un nombre válido, el
  participante se agrega al final de la lista, el campo se vacía, conserva
  el foco y desaparece el mensaje de error si lo había.
- Con un nombre inválido no se agrega nada y el campo muestra uno de estos
  mensajes: "Ingresa un nombre." (vacío), "El nombre puede tener hasta 30
  caracteres." (largo) o "Ya existe un participante con ese nombre."
  (repetido).
- Máximo 20 participantes. Con 20, el campo y el botón aparecen deshabilitados
  junto al texto "Máximo 20 participantes."
- Sin participantes, la lista muestra "Todavía no hay participantes."

### RQ-02 Eliminar participante
Cada participante de la lista tiene un botón "Eliminar" cuyo nombre accesible
es "Eliminar <nombre>".
- Si el participante aparece en algún gasto (como pagador o en "dividir
  entre"), el botón está deshabilitado y junto al nombre se lee "Tiene gastos
  registrados".
- Si no aparece en ningún gasto, el botón lo elimina de inmediato, sin pedir
  confirmación.

### RQ-03 Registrar gasto
La sección "Nuevo gasto" tiene los campos "Descripción", "Monto (Bs)",
"Pagó" (lista desplegable con los participantes), "Dividir entre" (una
casilla por participante) y el botón "Registrar gasto".
- Sin participantes, en lugar del formulario se muestra "Agrega participantes
  para registrar gastos."
- Descripción válida: de 1 a 60 caracteres, ignorando espacios al inicio y al
  final. Mensaje de error: "Ingresa una descripción de hasta 60 caracteres."
- Monto válido: número con hasta 2 decimales, con punto o coma como separador
  decimal y sin separador de miles, entre 0,01 y 1.000.000. Se ignoran los
  espacios al inicio y al final. Mensaje de error: "Ingresa un monto entre
  0,01 y 1.000.000 con hasta 2 decimales."
- "Pagó" muestra por defecto al primer participante de la lista. Si se elimina
  el participante elegido, vuelve al primero.
- "Dividir entre" tiene todas las casillas marcadas por defecto; un
  participante agregado después aparece marcado. Debe quedar al menos una
  marcada. Mensaje de error: "Elige al menos una persona."
- Todo o nada: al pulsar "Registrar gasto" (o Enter en un campo de texto), si
  algún campo es inválido no se registra nada y cada campo inválido muestra su
  mensaje.
- Tras registrar un gasto válido, "Descripción" y "Monto (Bs)" se vacían,
  "Pagó" conserva su valor, "Dividir entre" vuelve a tener todas las casillas
  marcadas, desaparecen los mensajes de error y el foco pasa a
  "Descripción".

### RQ-04 Reparto en partes iguales
Cada gasto se divide en partes iguales entre las personas de "dividir entre".
- Con n personas y un monto de M centavos, cada una recibe ⌊M / n⌋ centavos.
- Los centavos que sobran (M mod n) se reparten de a uno a las primeras
  personas de "dividir entre", según el orden de la lista.
- La suma de las partes es exactamente el monto del gasto.
- Ejemplo: Bs 10,00 entre Ana, Beto y Caro → Ana Bs 3,34, Beto Bs 3,33,
  Caro Bs 3,33.

### RQ-05 Lista de gastos
La sección "Gastos" muestra los gastos del más reciente al más antiguo.
- Cada gasto muestra su descripción, su monto, "Pagó <nombre>" y
  "Entre: <nombres>" con los nombres separados por coma, en el orden de la
  lista.
- Debajo de la lista se muestra "Total gastado: <monto>", la suma de todos los
  montos.
- Sin gastos, se muestra "Todavía no hay gastos." y "Total gastado: Bs 0,00".

### RQ-06 Eliminar gasto
Cada gasto tiene un botón "Eliminar" cuyo nombre accesible es
"Eliminar gasto <descripción>".
- Al pulsarlo se pide confirmación con el texto `¿Eliminar el gasto
  "<descripción>"?`.
- Si se acepta, el gasto desaparece y los saldos, la liquidación y el total se
  recalculan. Si se cancela, no cambia nada.

### RQ-07 Saldos
La sección "Saldos" muestra una fila por participante, en el orden de la
lista, con su nombre, su saldo (RQ-09) y uno de estos textos: "le deben"
(saldo positivo), "debe" (negativo) o "está al día" (cero).
- La suma de todos los saldos es siempre Bs 0,00.
- Sin participantes, la sección muestra "Todavía no hay participantes."

### RQ-08 Liquidación sugerida
La sección "Cómo saldar cuentas" lista transferencias con el texto
"<deudor> paga <monto> a <acreedor>".
- Se calculan así, a partir de los saldos: mientras haya saldos distintos de
  cero, la persona que más debe le paga a la persona a la que más le deben el
  menor de los dos importes. Empates: gana quien aparece primero en la lista.
- Si se hicieran todas las transferencias, todos los saldos quedarían en cero.
- La cantidad de transferencias es como máximo la cantidad de personas con
  saldo distinto de cero menos uno.
- Si todos los saldos son cero, se muestra "No hay deudas pendientes."

### RQ-09 Formato de montos
Todos los montos se muestran como "Bs " seguido del valor con punto como
separador de miles y coma decimal, siempre con dos decimales.
- Ejemplos: "Bs 0,05", "Bs 12,50", "Bs 1.234,50", "Bs 1.000.000,00".
- En "Saldos", los positivos llevan "+" y los negativos "-" delante:
  "+Bs 20,00", "-Bs 5,00". El cero se muestra "Bs 0,00".

### RQ-10 Persistencia y red
- Los participantes y los gastos se guardan en el almacenamiento del navegador
  después de cada cambio. Al recargar la página se restauran tal cual.
- Si no hay datos guardados, no se pueden leer o son inválidos (estructura
  incorrecta, montos fuera de rango, gastos que nombran participantes que no
  existen), la app arranca en el estado inicial sin mostrar errores.
- Si no se puede escribir en el almacenamiento, la app sigue funcionando sin
  mostrar errores (los cambios se pierden al recargar).
- La app no hace llamadas de red.

### RQ-11 Interfaz: idioma, etiquetas y teclado
- Todos los textos visibles están en español.
- Cada campo tiene una etiqueta visible asociada; las casillas de "Dividir
  entre" forman un grupo cuyo nombre es "Dividir entre".
- Un campo de texto con error queda marcado como inválido (`aria-invalid`) y
  su mensaje está asociado al campo (`aria-describedby`). El mensaje de
  "Dividir entre" se asocia al grupo de casillas (`aria-describedby`).
- Todos los controles se pueden usar con el teclado (Tab, Enter, Espacio) y
  tienen foco visible.

### RQ-12 Borrar todo
Un botón "Borrar todo" vacía el grupo.
- Solo se muestra si hay al menos un participante.
- Al pulsarlo se pide confirmación con el texto "¿Borrar todos los
  participantes y gastos?". Si se acepta, la app vuelve al estado inicial y
  eso queda guardado (RQ-10). Si se cancela, no cambia nada.

## Fuera de alcance (v1)

Varios grupos, división desigual (por porcentajes, por partes o montos
fijos), varias monedas, marcar transferencias como pagadas, editar un gasto o
renombrar un participante, fechas o categorías de gastos, exportar o
compartir, cuentas de usuario y sincronización entre dispositivos, diseño
responsive específico, otros idiomas.
