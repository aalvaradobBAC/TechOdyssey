# M00 - Diagnóstico y ruta personalizada

## Objetivo

Identificar conocimientos previos en programación, IBM i, RPG, SQL, Visual
Studio Code y Git, y recomendar un punto de entrada para la ruta RPG.

## Resultados de aprendizaje

- Reconocer las áreas que cubre la ruta RPG.
- Completar un diagnóstico de conocimientos previos.
- Interpretar una recomendación de inicio sin confundirla con una calificación
  ni con una certificación de dominio.

## Estructura y fuente de contenido

- [`content.md`](./content.md): textos del módulo, tiempo estimado, tamaño del
  intento y reglas de recomendación.
- [`questions.csv`](./questions.csv): banco editable de preguntas.
- [`module.yml`](./module.yml): metadatos y criterio de finalización.
- La interfaz carga `content.md` y `questions.csv` mediante el parser de M00;
  `module.yml` se mantiene como metadato curricular y no se carga en tiempo de
  ejecución en este piloto.
- Los componentes React implementan la interacción, no son la fuente editorial
  de preguntas ni recomendaciones.

## Reglas del diagnóstico

- Cada intento contiene 10 preguntas seleccionadas aleatoriamente.
- El banco cubre programación, IBM i, RPG, SQL y herramientas.
- Si hay preguntas disponibles, se selecciona una por categoría antes de
  completar el intento con otras preguntas aleatorias.
- Una pregunta no se repite dentro del mismo intento.
- Cada pregunta tiene cuatro opciones y una respuesta correcta.
- El resultado es informativo y presenta una recomendación:
  - 80% o más: ruta acelerada.
  - 50% a 79%: completar las prácticas guiadas de M01.
  - Menos de 50%: comenzar por fundamentos y demostraciones.
- Completar el diagnóstico habilita M01 independientemente del porcentaje; la
  puntuación no es un criterio de aprobación.

## Criterios de aceptación

1. Los 12 registros actuales del CSV se cargan y validan con identificadores
   únicos, cinco categorías, cuatro opciones y una respuesta A-D.
2. Los campos requeridos vacíos, encabezados inválidos, filas incompletas e
   identificadores duplicados producen un error explícito.
3. Las comas, comillas escapadas y saltos de línea dentro de campos CSV
   entrecomillados se interpretan correctamente.
4. El Markdown requiere todas las secciones declaradas y rechaza duplicados,
   secciones desconocidas o formato inválido.
5. Se conservan el número de preguntas, la selección por categoría, el cálculo
   de porcentaje, las recomendaciones y el desbloqueo actual de M01.
6. Cambiar una pregunta o un texto editorial no requiere modificar TSX.

## Fuera de alcance de M00

- Persistir intentos entre sesiones.
- Cambiar la lógica de desbloqueo de M01.
- Migrar o rediseñar el contenido de M01-M18.
- Ejecutar laboratorios contra un sistema IBM i.
