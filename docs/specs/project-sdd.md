# Especificación de desarrollo guiado por especificaciones (SDD) de TechOdyssey

- **Identificador:** PROJECT-SDD
- **Estado:** vigente
- **Alcance:** toda la plataforma TechOdyssey, sus tecnologías, rutas de
  aprendizaje, módulos, unidades, API, interfaz y operaciones.
- **Fuente de verdad:** esta especificación establece las reglas comunes. Las
  especificaciones de cada producto o tecnología agregan requisitos específicos
  sin contradecir estas reglas.

## 1. Propósito y alcance

TechOdyssey desarrolla una plataforma de aprendizaje gamificada para múltiples
tecnologías. Los requisitos comunes de producto y el proceso SDD aplican a toda
la plataforma, no solo a RPG ni a un módulo particular. Las rutas pueden tener
contenidos, herramientas, lenguaje y métodos técnicos distintos; los estándares
de aprendizaje, progreso y calidad descritos aquí son transversales.

Esta especificación es el punto de partida para cambios funcionales y de
contenido de cualquier área. No obliga a gamificar elementos técnicos que no
sean experiencias de aprendizaje ni a imponer convenciones de una tecnología
en otra.

## 2. Organización y autoridad de las especificaciones

- `docs/specs/project-sdd.md` es la autoridad para el ciclo SDD y los requisitos
  comunes de aprendizaje y gamificación.
- `docs/specs/` contiene especificaciones transversales y de producto, como
  autenticación, progreso y experiencias de la plataforma.
- `technologies/<tecnología>/curriculum/` contiene los objetivos, contenidos,
  ejemplos, prácticas, evaluación y fuentes propios de cada ruta.
- Las especificaciones locales amplían las comunes. Si hay una discrepancia,
  se actualizan los documentos afectados antes de dar el cambio por terminado;
  no se mantienen reglas contradictorias.
- El código implementado no sustituye los requisitos ni los criterios de
  aceptación. Los tableros de estado, cuando existan, registran avance y
  evidencia, no redefinen el comportamiento esperado.

## 3. Requisitos comunes de aprendizaje

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| PROJECT-EDU-01 | Cada unidad de aprendizaje permite practicar y comprobar el concepto que enseña. | La unidad declara un objetivo observable, explica el concepto, presenta un ejemplo apropiado, incluye práctica guiada o gradual y define cómo comprobar el resultado con retroalimentación útil. |
| PROJECT-EDU-02 | La dificultad progresa de forma comprensible y acumulativa. | Las actividades avanzan desde reconocer o comprender, a modificar o aplicar, y luego a integrar lo aprendido en un reto cuando el objetivo lo requiere. Se declaran los conocimientos previos; no se depende de conceptos aún no enseñados. |
| PROJECT-EDU-03 | El contenido técnico es trazable y apropiado a su tecnología. | Los conceptos específicos se contrastan con fuentes confiables y la versión pertinente; los ejemplos son originales, ejecutables o verificables en el entorno declarado, y no presentan como disponible una herramienta o runtime que no lo esté. |
| PROJECT-EDU-04 | Las opciones de comprobaciones y evaluaciones no revelan la respuesta por posición. | El renderer baraja las opciones en cada carga o intento nuevo y conserva internamente la correspondencia entre la opción mostrada y la respuesta correcta. |
| PROJECT-EDU-05 | Las prácticas técnicas distinguen restricciones del lenguaje, estándares internos y preferencias de equipo. | Cuando una decisión tenga varias soluciones válidas, el contenido identifica explícitamente qué es obligatorio por la tecnología, qué es una recomendación del proyecto y qué depende de convenciones externas. |
| PROJECT-EDU-06 | Una práctica sin compilación real indica su nivel de validación. | Las soluciones locales, checklists y comparaciones se etiquetan como validación visual o estructural; no se presentan como ejecución ni compilación sin evidencia del entorno. |
| PROJECT-EDU-07 | Las prácticas abiertas permiten comprobar resultados observables. | Cuando una práctica solicita texto, código o una serie de declaraciones, la aplicación valida líneas, sintaxis mínima o patrones exigidos y ofrece feedback específico sobre líneas faltantes, incorrectas o originales que deben reemplazarse. |
| PROJECT-EDU-08 | Las comprobaciones de conocimiento ofrecen variación entre intentos y participantes. | Cada comprobación tiene un banco de al menos tres preguntas que cubre el mismo objetivo; cada intento selecciona una pregunta al azar, permite reintentar con una nueva selección y baraja sus opciones conservando la respuesta correcta. |

## 4. Requisitos comunes de gamificación

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| PROJECT-GAME-01 | Cada unidad de aprendizaje usa gamificación intencional para sostener el interés y reforzar el objetivo educativo. | Incluye un objetivo claro, un reto con dificultad apropiada, retroalimentación comprensible y una señal de avance o logro. Los elementos lúdicos están vinculados al contenido y no sustituyen la práctica ni la comprensión. |
| PROJECT-GAME-02 | Las unidades de un módulo forman una progresión que el participante puede seguir. | El participante puede identificar qué logró y qué sigue; los retos pueden construir una misión o contexto común cuando ayude a conectar las unidades. La narrativa se adapta a la tecnología y no impone una temática única a todas las rutas. |
| PROJECT-GAME-03 | La experiencia permite aprender de los errores sin castigos arbitrarios. | Una respuesta o intento incorrecto explica cómo avanzar y permite reintentar cuando sea pertinente; repetir una actividad no duplica el progreso persistido ni concede recompensas adicionales. La información de estado no depende solo del color. |
| PROJECT-GAME-04 | Las recompensas reflejan avance real y respetan la autoridad del servidor. | Por defecto, completar unidades registra progreso, pero no concede XP; la recompensa configurada se concede una sola vez al completar el módulo. Solo la API puede calcular XP/nivel y aplicar recompensas. Cambiar esta política requiere actualizar la especificación, los criterios de aceptación y la implementación autoritativa. |
| PROJECT-GAME-05 | Las métricas, logros y elementos visuales representan datos reales. | No se muestran como obtenidos puntos, insignias, estadísticas, laboratorios o logros que el sistema no registre o no pueda validar. |

Los detalles de cuentas, persistencia, endpoints y recompensas configuradas se
especifican en [gamification-api.md](./gamification-api.md). Las rutas de
aprendizaje deben cumplir los requisitos comunes aun cuando su interfaz o
formato de contenido sea diferente.

## 5. Ciclo SDD para cambios

Aplicar este ciclo a cada cambio funcional, de contenido, API o interfaz que
altere el comportamiento esperado:

1. **Descubrir:** leer esta especificación y las especificaciones locales,
   revisar la implementación y las pruebas relacionadas, e identificar
   dependencias y comportamiento existente.
2. **Especificar:** crear o actualizar primero la especificación afectada.
   Registrar alcance, requisitos, criterios observables, restricciones,
   compatibilidad y decisiones pendientes. Para cambios pequeños, actualizar la
   especificación existente en vez de crear otra.
3. **Revisar:** comprobar que los criterios son verificables, coherentes con los
   requisitos transversales y adecuados al alcance. Resolver ambigüedades antes
   de tomar decisiones de producto irreversibles.
4. **Implementar:** realizar el cambio mínimo que cumpla los criterios
   aceptados, siguiendo los patrones existentes. No ampliar el alcance con
   cambios ajenos.
5. **Verificar:** ejecutar las pruebas, validaciones de contenido o comprobación
   manual más pequeñas que demuestren los criterios relevantes. No usar la
   compilación como sustituto de validar el comportamiento solicitado.
6. **Cerrar:** actualizar las especificaciones y el estado/evidencia de la
   iniciativa cuando exista un tablero. Registrar brechas conocidas y el
   siguiente paso; distinguir la confirmación del usuario de una verificación
   independiente.

Una corrección de defecto debe documentar el comportamiento esperado y el
criterio que evita la regresión. Una modificación meramente editorial que no
cambie requisitos ni comportamiento no necesita generar una especificación
nueva.

## 6. Criterios transversales de calidad

- Los criterios de aceptación describen resultados observables, no solo
  archivos, componentes o tareas de implementación.
- Los cambios preservan el comportamiento existente fuera del alcance aprobado
  y mantienen consistentes interfaz, API, configuración, especificación y
  pruebas relacionadas.
- El progreso y las recompensas son idempotentes, se aíslan por cuenta y ruta y
  no se confían al cliente cuando existe una API autoritativa.
- Los ejercicios no requieren secretos, credenciales reales ni autoridad sobre
  entornos productivos. Los requisitos de seguridad y privacidad aplican a
  todas las tecnologías.
- El contenido, los retos y la retroalimentación son accesibles, claros y
  adecuados a los prerrequisitos declarados.
- El estado de una función no se considera completo sin evidencia de los
  criterios aplicables; los estados «propuesto», «implementado» y «validado»
  se mantienen diferenciados.

## 7. Aplicación a rutas existentes y nuevas

Toda tecnología y ruta nueva debe adoptar los requisitos PROJECT-EDU y
PROJECT-GAME desde su primera especificación. Al modificar una ruta existente,
se incorporan de forma incremental los requisitos que correspondan al alcance;
no se afirma que contenido o comportamiento anterior ya cumple sin verificarlo.

La especificación específica de una ruta puede establecer más requisitos
estrictos, referencias técnicas, formato editorial o reglas de evaluación. Por
ejemplo, la [ruta RPG](./rpg-learning-route.md) define los temas y criterios
propios de IBM i/RPG, mientras que esta especificación define las reglas
comunes de aprendizaje y gamificación para TechOdyssey.
