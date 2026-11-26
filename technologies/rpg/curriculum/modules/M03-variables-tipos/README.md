# M03 - Variables, constantes y tipos

## Estado

**En construcción por fases.** M03-U01, M03-U02 y M03-U03 están implementadas.
M03-U04 a M03-U07 continúan diseñadas hasta recibir construcción y verificación
en incrementos separados.

## Propósito y audiencia

M03 introduce a principiantes absolutos a las variables, constantes y tipos
de datos escalares en RPG totalmente libre. La misión recibe el nombre
**El Guardián de los Datos** y presenta un contrato de datos sencillo para una
cuenta de entrenamiento.

M03 modela datos antes de calcular, decidir o consultar. No se presentan como
contenido nuevo operadores, control de flujo, ciclos, estructuras de datos,
SQL, procedimientos ni conversiones profundas.

## Objetivo

Al terminar M03, el participante podrá declarar variables escalares con
`DCL-S`, seleccionar tipos según el significado del dato, definir precisión y
escala, inicializar con `INZ`, crear constantes nombradas con `DCL-C`,
identificar tipos de carácter, enteros, decimales, fecha/hora e indicadores,
reutilizar declaraciones con `LIKE` y justificar decisiones de modelado.

## Competencia final

> Modelar correctamente los datos de una operación bancaria sencilla mediante
> declaraciones escalares, tipos apropiados, precisión decimal, inicialización
> y constantes nombradas.

El producto integrador será un fuente independiente que declare datos
sintéticos: identificador de cuenta, nombre, saldo, fecha, estado y intentos.
No realizará persistencia, cálculos complejos ni reglas de negocio completas.

## Secuencia de unidades

1. **M03-U01 · El contrato de una variable:** anatomía de `DCL-S`, nombres,
   tipos, `INZ` y punto y coma.
2. **M03-U02 · Identidad textual:** diferenciar `CHAR` y `VARCHAR`, longitud
   máxima, valores vacíos y identificadores que no deben ser números. El
   participante aplica esta decisión a códigos de longitud fija, número de
   cuenta con ceros iniciales y nombre de longitud variable.
3. **M03-U03 · Precisión financiera:** enteros con signo, enteros sin signo,
   `PACKED`, `ZONED`, precisión, escala y introducción reconocible a tipos
   binarios decimales.
4. **M03-U04 · Estado y control:** `IND`, `*ON`, `*OFF`, indicadores
   nombrados, enteros de control e inicialización explícita.
5. **M03-U05 · Tiempo del sistema:** `DATE(*ISO)`, `TIME(*ISO)`, `TIMESTAMP`,
   `INZ(*SYS)` y representación segura sin tratar fechas como texto.
6. **M03-U06 · Reglas que no cambian:** `DCL-C`, constantes figurativas y
   reutilización de declaraciones mediante `LIKE`.
7. **M03-U07 · Laboratorio integrador:** reconstruir el contrato de datos de
   una cuenta y justificar cada decisión.

## Alcance incluido

- `DCL-S` y `DCL-C`.
- nombres descriptivos y separación entre variables y constantes.
- `CHAR`, `VARCHAR`, `INT`, `UNS`, `PACKED`, `ZONED`, `DATE`, `TIME`,
  `TIMESTAMP`, `IND`.
- introducción controlada a `BINDEC(digits{:decimals})`, confirmada en la
  documentación de Free-form RPG support de IBM.
- `INZ`, `LIKE`, constantes figurativas básicas y asignación simple.
- precisión, escala, longitud y valor inicial.
- práctica sin IBM i y compilación opcional en un entorno autorizado.

## Límites deliberados

- `DCL-DS` y arreglos pertenecen a M08.
- operadores y precedencia pertenecen a M04.
- `IF`, `SELECT` y decisiones pertenecen a M05.
- ciclos pertenecen a M06.
- funciones de conversión profundas pertenecen a M07.
- SQL embebido pertenece a M09.
- archivos externos pertenecen a M10.
- parámetros y procedimientos pertenecen a M11.

## Prácticas y retos

Cada unidad debe incluir:

- objetivo observable;
- explicación breve y ejemplo;
- demostración ejecutable o verificable;
- práctica guiada;
- reto con criterios de éxito;
- comprobación con explicación y pista de reintento;
- solución de referencia disponible después del checklist.

### Criterios adicionales para M03-U02

- explicar `CHAR(length)` como texto de longitud fija y `VARCHAR(length)` como
  texto de longitud variable con longitud máxima declarada;
- dejar claro que un dato compuesto por dígitos puede ser un identificador y
  debe conservar su representación si los ceros iniciales importan;
- incluir tres retos de declaración independientes: código fijo, identificador
  textual y nombre variable;
- comprobar cada línea escrita como declaración `DCL-S` completa, con nombre,
  tipo/longitud correctos y terminador; mostrar feedback por línea y permitir
  reintentar;
- distinguir las reglas del lenguaje de las recomendaciones de modelado.
- fundamentar la sintaxis en IBM: `CHAR(length)` y
  `VARCHAR(length {:varying-size})`; esta unidad usa la forma simple
  `VARCHAR(maximum-length)`.

### Criterios adicionales para M03-U03

- enseñar `INT(digits)` como entero con signo y `UNS(digits)` como entero sin
  signo; indicar los tamaños admitidos `3`, `5`, `10` y `20`, y explicar que
  `UNS` solo corresponde cuando el contrato excluye valores negativos;
- mostrar que el rango real depende del tipo y tamaño: por ejemplo, `INT(5)`
  admite -32768 a 32767 y `UNS(5)` admite 0 a 65535; no afirmar que el número
  del parámetro siempre equivale al máximo valor decimal;
- distinguir precisión (dígitos totales) de escala (dígitos decimales) con una
  declaración `PACKED(13:2)`, que reserva 13 dígitos en total y 2 posiciones
  decimales;
- presentar `PACKED` y `ZONED` como formatos decimales con signo y
  `BINDEC` como formato binario-decimal de rango limitado; enseñar su sintaxis
  reconocible sin adelantarse a operaciones, conversiones ni detalles de
  almacenamiento de bajo nivel;
- incluir un ejemplo financiero que conserve la escala decimal y un reto de
  declaraciones completas cuya validación compruebe el tipo, tamaño, escala y
  signo requeridos;
- contrastar las declaraciones y afirmaciones técnicas con la referencia IBM
  RPG 7.5 citada en este documento; no afirmar compilación real sin ejecutarla.

Las misiones secundarias son opcionales y no otorgan XP:

- renombrar variables con nombres que expresen significado;
- detectar un monto que pierde decimales;
- reemplazar valores mágicos por constantes nombradas.

## Criterios de finalización

- completar las siete unidades M03-U01 a M03-U07;
- completar el laboratorio integrador;
- superar al menos tres retos;
- aprobar la evaluación final con al menos 80%;
- acreditar 100 XP una sola vez desde el servidor;
- mostrar la insignia **Guardián de Tipos** solo al cumplir esos criterios.

## Evaluación final

- banco mínimo de 24 preguntas;
- ocho preguntas seleccionadas por intento;
- opciones barajadas en cada intento;
- las comprobaciones de cada unidad usan un banco de al menos tres preguntas
  equivalentes en objetivo y seleccionan una al azar en cada intento;
- umbral de aprobación del 80%;
- reintentos ilimitados sin duplicar progreso ni XP;
- preguntas sobre selección de tipo, precisión, inicialización, constantes,
  `LIKE`, fecha/hora, identificadores y revisión integral.

## Correcciones técnicas verificadas antes de implementar

- mantener `INZ(*SYS)` como ejemplo educativo pendiente de comprobación directa
  en el compilador disponible antes de publicar el laboratorio definitivo.
- `CONST(...)` es válido y opcional en `DCL-C`; no cambia el significado de la
  constante. TechOdyssey utilizará por defecto `DCL-C nombre valor;` y
  presentará `CONST(valor)` solo como alternativa de sintaxis.
- no describir nombres de variables como restricciones de compilador si son
  únicamente convenciones.
- enseñar `INT(digits)` y `UNS(digits)` con los tamaños admitidos `3`, `5`,
  `10` y `20`. No enseñar `UNS` solo por evitar negativos; justificar el
  contrato real y el rango permitido.
- enseñar `PACKED(digits:decimals)` y `ZONED(digits:decimals)` como tipos
  decimales distintos; explicar que `BINDEC(digits:decimals)` es un tipo binario
  decimal reconocido por la documentación IBM, no el tipo predeterminado.
- explicar `CHAR(length)` para texto fijo y `VARCHAR(maximum:length-varying)`
  para texto de longitud variable sin confundir la longitud máxima con el
  tamaño ocupado actualmente.
- enseñar `LIKE` como reutilización de características de otro campo. En una
  declaración `DCL-S`, no debe repetirse un tipo de datos cuando se usa
  `LIKE`.
- validar cada ejemplo en el entorno declarado antes de marcarlo como listo.

## Entorno y seguridad

- los datos de ejemplo son sintéticos y no representan cuentas reales;
- no se requieren credenciales, autoridad productiva ni conexiones externas;
- las prácticas locales se etiquetan como validación local, no como compilación;
- la compilación opcional usa bibliotecas y objetos de entrenamiento.

## Gamificación

Las unidades permiten reintentar sin penalización y muestran progreso visible.
Completar unidades no otorga XP. La recompensa de 100 XP y la insignia se
acreditan una sola vez al cumplir el cierre del módulo y preservar datos reales
de progreso y recompensa en el servidor.

## Referencias

- IBM Developer: [Free-form RPG support on IBM i](https://developer.ibm.com/articles/i-ibmi-rpg-support/)
  — declara los tipos libres, `DCL-S`, `DCL-C`, `INZ`, `LIKE`, `PACKED`,
  `ZONED`, `BINDEC`, enteros y tipos de fecha/hora.
- IBM Documentation: [ILE RPG Reference](https://www.ibm.com/docs/en/i/7.5.0?topic=rpg-ile-reference)
  — referencia oficial para confirmar sintaxis y comportamiento del compilador.
- IBM Documentation: [Numeric Data Type](https://www.ibm.com/docs/en/i/7.5.0?topic=formats-numeric-data-type),
  [Integer Format](https://www.ibm.com/docs/en/i/7.5.0?topic=type-integer-format),
  [Unsigned Format](https://www.ibm.com/docs/en/i/7.5.0?topic=type-unsigned-format),
  [Packed-Decimal Format](https://www.ibm.com/docs/en/i/7.5.0?topic=type-packed-decimal-format),
  [Zoned-Decimal Format](https://www.ibm.com/docs/en/i/7.5.0?topic=type-zoned-decimal-format)
  y [Binary-Decimal Format](https://www.ibm.com/docs/en/i/7.5.0?topic=type-binary-decimal-format)
  — referencias técnicas para M03-U03.
- Documentación técnica interna indicada en el adjunto de diseño de M03.
