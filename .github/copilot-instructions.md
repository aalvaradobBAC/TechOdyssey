# Instrucciones del workspace

## Spec-driven development de todo TechOdyssey

- Antes de un cambio funcional o de contenido, consulta `docs/specs/project-sdd.md`
  y las especificaciones relacionadas con el área afectada. Esta regla aplica a
  toda la plataforma, tecnología y ruta, no solo a RPG.
- Si el cambio altera el comportamiento esperado, actualiza o crea primero la
  especificación pertinente y sus criterios de aceptación observables; después
  implementa y valida esos criterios. Para cambios editoriales que no alteran
  requisitos ni comportamiento, no crees una especificación nueva.
- Aplica los requisitos comunes de aprendizaje y gamificación a todas las
  tecnologías. Cada unidad debe incluir práctica comprobable y gamificación
  intencional; adapta los ejemplos, la narrativa y las fuentes a su tecnología.
- Respeta las reglas transversales de progreso: por defecto, completar una
  unidad no concede XP, la recompensa de módulo se acredita una sola vez y el
  servidor es autoritativo. Cualquier cambio de esa política debe especificarse
  antes de implementarse.
- Mantén alineados los documentos locales, la implementación y las pruebas. No
  marques algo como validado sin evidencia de los criterios correspondientes.

## Avance de la ruta de aprendizaje RPG

- Si el usuario pregunta dónde quedó el trabajo de la ruta (por ejemplo,
  «¿dónde nos quedamos?»), interprétalo como una pregunta sobre la construcción
  de la ruta RPG, salvo que especifique otro proyecto.
- Lee primero `docs/specs/rpg-learning-route-status.md`. Es la fuente única del
  avance, la etapa vigente, la evidencia registrada y el próximo paso. No
  deduzcas la etapa actual a partir de trabajo no relacionado, del historial de
  conversación ni de otro documento.
- Consulta `docs/specs/rpg-learning-route.md` para los requisitos y criterios
  de aceptación, no como un segundo tablero de progreso.
- Cuando se complete un hito de la ruta o el usuario informe una validación
  manual, actualiza el tablero con la fecha, la evidencia, las brechas abiertas
  y un único próximo paso. Distingue lo que informa el usuario de lo verificado
  independientemente.
- Si la implementación u otra documentación contradice el tablero, señala la
  discrepancia y reconcilia el tablero; no trates otra fuente como autoritativa
  sin indicarlo.
