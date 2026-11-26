# M02 - Anatomía de un programa Free RPG

## Propósito y audiencia

M02 introduce a principiantes absolutos a la anatomía y sintaxis básica de un
fuente RPG totalmente libre. La misión **Explorador de Código** usa Visual
Studio Code y la extensión Code for IBM i como un entorno familiar y visual, en
lugar de exigir que el estudiante empiece en una pantalla 5250.

El estudiante identificará las partes de un fuente, escribirá instrucciones
RPG sencillas y reconocerá el ciclo de edición, compilación y ejecución. El
módulo no enseña en profundidad variables, operadores, decisiones, ciclos ni
procesamiento de archivos. `DCL-S`, `DCL-C`, `DCL-DS` y `DCL-F` aparecen solo
como piezas del esqueleto; el módulo que desarrollará variables y tipos se
definirá por separado.

## Resultados de aprendizaje

- Reconocer las diferencias visuales entre el RPG posicional y el formato
  totalmente libre, y ubicar correctamente `**FREE`.
- Identificar comentarios, sentencias terminadas en `;` y las secciones de un
  fuente RPG.
- Seguir un flujo secuencial pequeño con `DSPLY`, `*INLR` y `RETURN`.
- Distinguir el fuente editable del objeto ejecutable y explicar el proceso
  básico de compilación en IBM i.
- Preparar un archivo `.rpgle` en VS Code y usar el resaltado y los diagnósticos
  como ayuda, sin confundirlos con una compilación real.

## Estructura didáctica

M02 consta de cuatro unidades progresivas. Cada unidad tiene una comprobación
teórica y una práctica o reto en VS Code:

1. **El lienzo moderno: `**FREE` y VS Code.** Contrasta visualmente el formato
   RPG posicional con el totalmente libre; cubre la ubicación de `**FREE`,
   comentarios `//` y `/* ... */`, terminadores `;` y creación de `HOLA.RPGLE`.
   El estudiante reconoce el fragmento con el encabezado correcto y verifica
   el resaltado de sintaxis en un archivo local.
2. **El ADN del programa: secciones principales.** Presenta `CTL-OPT`, `DCL-F`,
   `DCL-S`/`DCL-C`/`DCL-DS` y el flujo principal como bloques de lectura. El
   estudiante ordena cinco bloques mediante arrastre o controles de teclado y
   prepara un programa mínimo con
   `DFTACTGRP(*NO)`, comentarios de archivo/datos, `*INLR = *ON;` y `RETURN;`.
   La muestra compilable usa comentarios para las secciones sin declaraciones
   externas que requieran archivos de IBM i.
3. **Hablando con la consola: `DSPLY` y flujo secuencial.** Explica el orden de
   ejecución, los literales de texto, las palabras clave sin distinción de
   mayúsculas/minúsculas y el uso de `DSPLY`. La práctica añade dos mensajes a
   la carcasa de U02 y distingue una revisión local de una ejecución real.
4. **Ciclo de vida en VS Code: editar, compilar y ejecutar.** Diferencia fuente
   y objeto `*PGM`, introduce los diagnósticos del compilador y la vista
   Problems, y cierra con la reparación de un programa intencionalmente
   desordenado. Con conexión configurada, el estudiante puede compilar y llamar
   un objeto de entrenamiento; sin servidor, corrige el fuente y lo compara con
   la solución esperada.

Cada unidad debe presentar un objetivo, una explicación breve, un ejemplo,
pasos de práctica gradual, un reto con criterios de éxito, una comprobación con
explicación y una oportunidad de reintentar sin penalización. Las prácticas que
no se pueden ejecutar localmente usan un checklist interactivo. Al completar
los criterios, la interfaz permite comparar manualmente el archivo de VS Code
con una solución de referencia; la aplicación no lee ni modifica archivos
locales.

## Límites de contenido y exactitud técnica

- Se reconocen declaraciones de archivos y datos, pero no se enseñan
  operaciones de lectura/escritura ni el diseño de datos.
- La ejecución se mantiene secuencial. No se incluyen operadores, decisiones,
  ciclos o lógica de negocio compleja.
- Se recomienda escribir palabras clave en mayúsculas por consistencia; RPG
  acepta sus palabras clave en minúsculas o mayúsculas.
- Los ejemplos usan literales delimitados con comillas simples y sentencias
  terminadas con punto y coma.
- `DSPLY` comunica un mensaje al entorno de trabajo de IBM i; el destino depende
  del contexto del job. La referencia de IBM indica un máximo de **52 bytes**
  para la información mostrada.
- `*INLR = *ON` activa el indicador *Last Record* y es una forma de señalar el
  final del programa en un programa sin archivo primario. No se describirá como
  una orden general de “liberar memoria”. `RETURN` devuelve el control desde el
  procedimiento principal.
- Los niveles y códigos de diagnóstico se interpretan con el texto del mensaje
  y el resultado de compilación. No se promete que una severidad específica
  siempre impida generar el objeto: eso puede depender de la configuración del
  compilador.
- El resaltado local ayuda a leer el fuente, pero no demuestra que compile. La
  compilación y la llamada requieren una conexión autorizada a IBM i y objetos
  de entrenamiento.

## Gamificación y finalización

La narrativa es **Explorador de Código**. Completar unidades y reintentar no
otorga XP. Al completar M02 y superar su evaluación con al menos 80%, el
servidor acredita **100 XP una sola vez** y la interfaz muestra la insignia
**Arquitecto de Sintaxis Libre**. El módulo futuro de Variables y su
identificador de ruta quedan pendientes de la definición curricular posterior;
esta especificación no les asigna un número ni cambia el desbloqueo existente.

La evaluación final conserva cinco preguntas para comprobar los cuatro
resultados de aprendizaje. Se requiere al menos 80%; una respuesta incorrecta
permite revisar la explicación y volver a intentar. La finalización funcional
requiere:

- completar M02-U01 a M02-U04;
- marcar los criterios de la práctica/reto de cada unidad;
- aprobar la evaluación final con al menos 80%;
- acreditar la recompensa de M02 como máximo una vez por cuenta.

## Entorno y seguridad

- U01 puede realizarse con un archivo local `HOLA.RPGLE`, sin conexión a IBM i.
- La extensión Code for IBM i se puede usar conectada a un entorno autorizado;
  la conexión no es requisito para las comprobaciones visuales.
- No se requieren credenciales reales, datos productivos ni autoridad elevada.
- Los ejemplos de compilación y ejecución son para una biblioteca de
  entrenamiento y se adaptan al entorno disponible.
- No se presenta el resaltado de sintaxis como sustituto del compilador.
- Las duraciones mostradas en el contenido son referencias iniciales; la
  estimación por tipo de actividad en `module.yml` sigue pendiente de validar.

## Referencias

Fuentes consultadas el 2026-11-24 para IBM i 7.5:

- [ILE RPG Reference](https://www.ibm.com/docs/en/i/7.5.0?topic=rpg-ile-reference):
  referencia general del lenguaje.
- [Fully free-form statements](https://www.ibm.com/docs/en/i/7.5.0?topic=statements-fully-free-form):
  posición y alcance de `**FREE`.
- [DSPLY (Display Message)](https://www.ibm.com/docs/en/i/7.5.0?topic=codes-dsply-display-message):
  comportamiento y longitud máxima del mensaje.
- [Last Record Indicator (LR)](https://www.ibm.com/docs/en/i/7.5.0?topic=indicators-last-record-indicator-lr):
  uso de `LR` para indicar el final del programa.
- [Create Bound RPG Program (CRTBNDRPG)](https://www.ibm.com/docs/en/i/7.5.0?topic=c-create-bound-rpg-program):
  compilación y enlace de fuente a objeto `*PGM`.
- [Documentación de Code for IBM i](https://codefori.github.io/docs/):
  edición y compilación RPG desde Visual Studio Code.

El contenido y los ejemplos deben ser originales; las referencias se atribuyen
sin copiar extensamente el material de IBM.

## Estado

**Completado y validado manualmente el 2026-11-26.** El usuario confirmó haber
realizado las pruebas y el recorrido manual del módulo de cuatro unidades. La
evaluación final conserva cinco preguntas y la recompensa existente de 100 XP por
módulo. La insignia se muestra al completar; no se cambia todavía el destino de
desbloqueo, pendiente de definir el siguiente módulo de Variables.
