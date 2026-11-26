# Estado de construcción: ruta de aprendizaje RPG

- **Última actualización:** 2026-11-26
- **Especificación:** [RPG-ROUTE](./rpg-learning-route.md)
- **Estado general:** M00 fue revisado manualmente y su reset administrativo
  fue verificado por el usuario. M01 está cerrado funcionalmente y sus
  documentos editoriales fueron sincronizados; iniciar sesión recuperó el
  progreso correctamente. El alcance vigente de M02 se actualizó a cuatro
  unidades con la narrativa Explorador de Código. El usuario informó el
  2026-11-26 que realizó las pruebas y el recorrido manual de M02.

Este archivo es la fuente única del avance, la etapa vigente y el próximo paso
de la ruta RPG. Actualizarlo al cerrar cada incremento: registrar evidencia,
mover la etapa vigente y dejar un único próximo paso ejecutable. «Existe» no
equivale a «terminado».

## Etapa vigente

**Etapa 3 — M03 en construcción por unidades; U01, U02 y U03 implementadas.**

M00 quedó cerrado después de la revisión manual del usuario del piloto y del
reset administrativo. M01 quedó cerrado funcionalmente y editorialmente después
de confirmar la recuperación del progreso al iniciar sesión. La documentación
común ya define una propuesta editorial híbrida: Markdown para lecciones,
CSV para preguntas y YAML para metadatos.

### Próximo paso

Solicitar revisión manual de M03-U03. Después de esa revisión, preguntar si se
autoriza construir M03-U04. No se ejecutaron pruebas automatizadas ni build
tras construir U03, de acuerdo con la preferencia del usuario. M03 sigue
incompleta: no acreditar recompensa del módulo ni habilitar módulos posteriores.

**Criterio aplicado en M02:** las cuatro unidades, sus prácticas y retos, la
evaluación del 80%, la solución posterior al checklist, la insignia y la
recompensa única quedaron validados mediante pruebas y recorrido manual
informados por el usuario el 2026-11-26.

## Estado observado

| Incremento | Evidencia actual | Estado de construcción |
|---|---|---|
| M00 · Diagnóstico | README especificado; `content.md` contiene copy y recomendaciones; `questions.csv` contiene 12 preguntas; el frontend carga y valida ambas fuentes. Login/registro, progreso, reset administrativo y el proxy de desarrollo están implementados. Pruebas de contenido: 3/3; build exitoso; las pruebas .NET incluyen reset sin pérdida de progreso y compatibilidad con el JSON anterior. El usuario confirmó el 2026-11-24 que revisó manualmente M00 y el reset administrativo. | **Completado; piloto validado manualmente.** |
| M01 · IBM i y Visual Studio Code | `m01-content.json` contiene siete secciones; S04 y S05 tienen experiencias específicas. El flujo permite completar las siete unidades y acreditar el módulo; el progreso se integra por tecnología/módulo. El usuario confirmó completar M01 y recuperar correctamente su progreso al iniciar sesión el 2026-11-24. README y `module.yml` están sincronizados. | **Completado funcional y editorialmente.** |
| M02 · Anatomía de un programa Free RPG | El alcance de M02 se revisó a cuatro unidades para principiantes absolutos: lienzo `**FREE` y VS Code, secciones del fuente, `DSPLY` secuencial y ciclo de edición/compilación/ejecución. `m02-content.json`, `module.yml` y el README están alineados; el renderer admite ordenamiento por arrastre o teclado, checklist con solución comparativa e insignia de cierre. La evaluación conserva cinco preguntas y 80%; el servidor conserva 100 XP una sola vez. El usuario informó el 2026-11-26 que realizó las pruebas y el recorrido manual. | **Completado; validado por el usuario.** |
| M03 · Variables, constantes y tipos | El adjunto curricular fue reconciliado con la ruta: siete unidades, modelado de datos, límites explícitos y evaluación con 80%. U01-U03 están implementadas como unidades parciales, sin evaluación final ni recompensa de módulo. Cada comprobación tiene banco aleatorio con al menos cuatro preguntas y opciones barajadas. El usuario informó el 2026-11-26 que revisó manualmente U02. U03 contrasta enteros, signo, rangos y formatos decimales según documentación IBM i 7.5; su JSON fue parseado correctamente. No se ejecutaron pruebas automatizadas/build ni compilación RPG real para U03. | **U01-U03 implementadas; solicitar revisión manual de U03 antes de autorizar U04.** |
| M04–M18 | La ruta muestra los módulos definidos en RPG-ROUTE. M04–M18 permanecen bloqueados mientras se completan sus prerrequisitos y contenidos. | Backlog curricular; iniciar después de validar M03. |

El estado funcional de M01 también incorpora la confirmación del usuario; las
brechas documentales indicadas se observaron en el repositorio.

## Secuencia de etapas

| Etapa | Alcance | Estado |
|---|---|---|
| 0. Base de trabajo | Acordar estructura spec-driven, criterios comunes y mecanismo de seguimiento. | Completada como primer corte documental. |
| 1. M00 | Validar contenido externo (Markdown/CSV), autenticación y progreso persistente sin alterar el diagnóstico. | **Completada; revisión manual y reset administrativo confirmados.** |
| 2. M01 | Especificar, alinear y validar el módulo usando el formato aprobado tras el piloto. | **Cerrada funcional y editorialmente; recuperación de progreso confirmada.** |
| 3. M02–M05 | Construir fundamentos de RPG en incrementos separados. | M02 cerrado tras pruebas y recorrido manual informados por el usuario; continuar con el siguiente incremento según el alcance aprobado. |
| 4. M06–M14 | Construir programación, datos, ILE, pruebas y colaboración. | Pendiente. |
| 5. M15–M18 | RPG fijo, modernización, IA y proyecto integrador. | Pendiente. |
| 6. Validación de ruta | Validar progresión, accesibilidad, persistencia, runtime y finalización de capstone de extremo a extremo. | Pendiente. |

## Registro de cambios de etapa

| Fecha | Cambio | Evidencia / decisión |
|---|---|---|
| 2026-11-26 | Se define la fase documental de M03. | Se incorporó el alcance de siete unidades basado en el adjunto `M03_Variables_Constantes_y_Tipos.md`: modelado escalar, precisión, estado, tiempo, constantes/LIKE y laboratorio integrador. Se corrigieron `BINDEC`, tamaños de enteros, `DCL-C/CONST` y `LIKE` contra documentación IBM accesible. Se actualizó el README técnico, `module.yml` y el tablero. M03 queda `designed`; no se construyó contenido ni interfaz. |
| 2026-11-26 | Se construye y verifica M03-U01. | Se agregó la unidad «El contrato de una variable» con DCL-S, INZ, práctica guiada, reto de ordenamiento, solución, comprobación aleatoria y misión secundaria. El progreso se registra por unidad sin acreditar 100 XP ni completar M03 hasta cerrar el módulo completo. Pasan 12 pruebas de contenido, 5 pruebas de progreso y el build frontend. |
| 2026-11-26 | Se aclara el contrato de DCL-S en M03-U01. | Se añadió una ficha explícita que responde ¿qué representa?, ¿cómo se llama?, ¿qué tipo tiene?, ¿cuánto puede almacenar? y ¿con qué valor comienza? La aclaración conserva el ejemplo compilable y las pruebas/build siguen pasando. |
| 2026-11-26 | Se aumenta la dificultad práctica de M03-U01. | Los bloques de ordenamiento ya empiezan mezclados y el reto incluye texto libre con validación de líneas requeridas y prohibidas. Se conservan reintento, checklist y solución de referencia. Las pruebas de contenido, progreso y el build pasan. |
| 2026-11-26 | Se mejora la comprensión del reto de texto libre de M03-U01. | La interfaz separa «Bloque original a corregir», instrucciones y área de respuesta, evitando confundir el ejemplo defectuoso con la solución. Se conservaron la validación por líneas y el reintento; las pruebas/build pasan. |
| 2026-11-26 | Se mejora el rechazo de copy/paste en M03-U01. | El validador identifica las líneas débiles que deben reemplazarse y las declaraciones requeridas que faltan. Copiar exactamente el bloque original continúa siendo inválido. Las pruebas de contenido, progreso y el build pasan. |
| 2026-11-26 | Se separa el reto textual de M03-U01 por líneas. | Cada dato usa un enunciado independiente y una entrada abierta; la validación exige una declaración DCL-S completa, termina con punto y coma y rechaza la línea original. Las pruebas de contenido, progreso y el build pasan. |
| 2026-11-26 | Se alinean las mejoras de M03-U01 con las especificaciones. | Se incorporaron reglas comunes para prácticas abiertas con validación observable y una regla específica para retos abiertos de M03. Se conserva la aleatorización de opciones como requisito transversal. |
| 2026-11-26 | Se construye y verifica M03-U02. | La unidad cubre `CHAR`, `VARCHAR` e identificadores textuales con explicación, práctica, tres respuestas abiertas por línea, feedback y comprobación de conocimiento. La spec se amplió con `RPG-F-19`. Pasan 14 pruebas de contenido, 5 de progreso, build frontend y `git diff --check`. Compilación real en IBM i no ejecutada. |
| 2026-11-26 | Se agregan bancos aleatorios para las comprobaciones de M03-U01 y U02. | Cada unidad ofrece cuatro preguntas distintas sobre su objetivo; cada entrada a la comprobación elige una al azar, el reintento selecciona otra sin repetir inmediatamente y las opciones se barajan. Los tests de contenido se actualizaron para validar bancos y respuestas correctas. No se ejecutaron pruebas ni build tras este cambio, de acuerdo con la preferencia del usuario de realizar sus propias pruebas. |
| 2026-11-26 | El usuario informa que terminó la revisión manual de M03-U02. | Se registra como evidencia informada por el usuario; no se detallaron criterios ni resultados y no se ejecutó validación independiente. El siguiente paso único es solicitar autorización para construir M03-U03. |
| 2026-11-26 | Se construye M03-U03 · Precisión financiera. | Se añadieron lecciones y práctica de `INT`, `UNS`, precisión/escala, `PACKED`, `ZONED` y `BINDEC`; la unidad tiene reto comprobable y banco de cinco preguntas. Se ampliaron los criterios de aceptación y se ensambló en el renderer. Sintaxis contrastada con documentación oficial IBM i 7.5; el JSON se parseó correctamente. No se ejecutaron pruebas/build ni compilación IBM i. El siguiente paso único es solicitar revisión manual de U03. |
| 2026-11-26 | Se cierra M02 después de pruebas y recorrido manual. | El usuario informó haber realizado las pruebas y la revisión manual del módulo. Se registra el cierre; la evidencia independiente detallada no fue ejecutada en esta sesión por petición del usuario. El próximo paso es definir o comenzar el siguiente incremento sin reconstruir M01 ni volver a validar M02. |
| 2026-11-24 | Se completa la lista de módulos de la página principal de RPG. | La ruta ahora muestra todos los identificadores M00–M18 del currículo; M03–M18 continúan bloqueados hasta completar sus prerrequisitos y construir sus contenidos. Se sincroniza el título de M02 con la especificación del módulo Free RPG. |
| 2026-11-24 | Se revisa el alcance de M02 por la nueva propuesta del usuario. | M02 pasa de siete a cuatro unidades para principiantes absolutos, con narrativa Explorador de Código y prácticas en VS Code; se mantienen 100 XP únicos al completar el módulo, sin distribución de XP por unidad. La insignia será Arquitecto de Sintaxis Libre. El módulo futuro de Variables y su identificador/desbloqueo quedan pendientes de la definición del usuario. |
| 2026-11-24 | Se actualiza el contenido implementado de las cuatro unidades de M02 y la UX de prácticas locales. | El JSON, `module.yml` y README se alinean; el renderer presenta ejemplos de código, checklists y una solución de referencia para comparación manual, y muestra la insignia al aprobar. Pruebas y build pendientes de ejecución. Se corrigen explicaciones de `*INLR` y del límite de `DSPLY` conforme a IBM i 7.5. |
| 2026-11-24 | Se actualiza el alcance normativo de M02 de cuatro a siete unidades antes de modificar su implementación. | El alcance documentado ahora cubre programa totalmente libre, procedimientos, variables y tipos básicos, estructuras fundamentales, archivos y operaciones básicas, ILE y flujo integrado de compilación. Se limitan los temas introductorios para no sustituir M03, M05, M06, M09 ni M10. El portal sigue en cuatro unidades y se marca explícitamente como implementación parcial; el siguiente paso es alinearlo, no validarlo. |
| 2026-11-24 | Se corrige el desbloqueo de M02 cuando M01 tiene todas sus unidades guardadas pero falta la acreditación del módulo. | La ruta consulta el progreso persistido de las siete unidades requeridas de M01 y habilita M02 si están completas, además de aceptar la acreditación explícita de M01. La prueba focalizada de prerrequisitos cubre las siete unidades completas y una unidad faltante. |
| 2026-11-24 | Se implementa M02 como un módulo RPG totalmente libre de cuatro unidades. | `m02-content.json` incluye misión narrativa, prácticas, retos con criterios, pistas de reintento y evaluación final de cinco preguntas con umbral de 80%. La ruta desbloquea M02 tras M01; el progreso se registra por unidad y cuenta. El servidor concede 100 XP una sola vez por completar `rpg/M02`. `npm run build`, pruebas focalizadas de contenido/progreso y la prueba .NET de recompensa única pasan. Pendiente recorrido manual. |
| 2026-11-24 | Se incorpora la gamificación como criterio transversal y requisito editorial explícito de M02. | Cada unidad de M02 tendrá práctica y reto gradual, retroalimentación accionable, reintentos y avance visible dentro de una misión común; no se otorga XP por unidad y se conserva la recompensa de finalización existente. Los requisitos comunes quedan en PROJECT-SDD y aplican al proyecto completo. |
| 2026-11-24 | Se define el enfoque editorial inicial de M02. | El usuario aprueba cubrir programa RPG totalmente libre, procedimientos, módulos y flujo de compilación; solicita explicaciones y ejemplos separados dentro de un mismo módulo, más extenso. En esa etapa inicial aún faltaban referencias IBM verificables y la revisión previa a la implementación. |
| 2026-11-24 | Se confirma la recuperación del progreso de M01 al iniciar sesión y se cierra M01 editorialmente. | El usuario inició sesión y verificó que el progreso se recuperó correctamente. Se actualizaron README y `module.yml`; M01 pasa de borrador a completado. El siguiente paso único es definir M02. |
| 2026-11-24 | Se cierra M00 y su reset administrativo tras revisión manual del usuario. | El usuario confirma haber revisado manualmente M00 y el reset administrativo. Continúa abierta la sincronización editorial de M01; el siguiente paso único es registrar formalmente su cierre. |
| 2026-11-24 | Se actualiza el estado de M01 y la fuente única de seguimiento. | El usuario confirma que completó M01; la revisión encuentra siete secciones implementadas y progreso integrado. Se distingue el cierre funcional de la brecha documental existente en README y `module.yml`. Se mantiene M00 como validado manualmente y M01 como siguiente cierre editorial. |
| 2026-11-23 | Se crea la especificación de ruta y este tablero. Se elige M00 como primer cierre spec-driven por ser el punto de entrada curricular. | Código diagnóstico presente; documentación declarativa de M00 aún en plantilla. |
| 2026-11-23 | Se propone separar contenido de interfaz: Markdown para lecciones, CSV para preguntas y YAML para metadatos. Se limita la primera prueba a M00. | Propuesta documentada; pendiente implementación y validación del piloto. |
| 2026-11-23 | Se especifican M00 y sus fuentes Markdown/CSV; comienza el piloto del parser en el frontend. | Contenido migrado a `content.md` y `questions.csv`; validación pendiente. |
| 2026-11-23 | Se valida el parser de contenido y el build del frontend; el usuario confirma que el diagnóstico funciona. | 3 pruebas focalizadas pasan; build exitoso. Se corrige el conteo esperado del test de 13 a 12, que coincide con las preguntas del CSV. |
| 2026-11-23 | Se agrega API de cuentas locales y progreso persistido en JSON. | Registro/login con cookie HttpOnly, XP administrado por servidor, M00 otorga 100 XP una sola vez y el nivel sube cada 500 XP. Pruebas .NET pasan y smoke test confirma restauración tras salir/entrar. |
| 2026-11-23 | Se integra la cuenta y la recompensa de M00 con el frontend. | El build y las pruebas de contenido pasan; Vite sirve la app y proxifica `/api` al backend (200 para frontend, 401 sin sesión en endpoint protegido). Pendiente probar el flujo visual completo. |
| 2026-11-23 | Se implementa el reset administrativo para `aalvaradob@baccredomatic.gt`. | Clave secreta de servidor, actualización de hash/version, invalidación de sesiones y progreso conservado; prueba HTTP confirma reset (204), sesión anterior invalidada y login con nueva contraseña recupera 100 XP. |
| 2026-11-23 | Se agrega recuperación de emergencia de la contraseña administradora sin sesión. | Endpoint limitado a la cuenta `Admin:Email` y protegido por clave secreta configurada en el servidor. Prueba HTTP confirma que invalida la sesión anterior y permite volver a entrar con 100 XP conservados. |
| 2026-11-23 | Se define persistencia transversal de unidades y módulos. | M01 guarda unidades completadas por cuenta, restaura la siguiente unidad pendiente y acredita 100 XP al completar el módulo una sola vez. El contrato queda definido como regla aplicable a todas las tecnologías y rutas futuras. |
| 2026-11-23 | Se corrige el aislamiento de progreso entre sesiones y cuentas. | La UI separa el almacenamiento local por email y reemplaza la vista local con el progreso autoritativo de la cuenta autenticada. Se agrega una prueba que confirma que M01-S01 no aparece en otra cuenta. |
| 2026-11-23 | Se corrige el porcentaje de ruta tras completar M01 y se generaliza la identidad del progreso. | La interfaz calcula el porcentaje a partir de módulos persistidos en la tecnología actual; la API acepta claves `technologyCode/moduleCode` y `technologyCode/moduleCode/unitCode`. Se mantiene compatibilidad con registros y endpoints M00/M01 anteriores. Build frontend, dos pruebas de porcentaje y siete pruebas .NET pasan; pendiente verificación manual. |
| 2026-11-23 | Se implementa la página inicial gaming para intranet con contenido de API. | La especificación [PUBLIC-HOME](./public-home.md) define catálogo configurable, métricas calculadas desde progreso persistido y Top 10 por XP. El ranking muestra correo completo dentro de la intranet. Build frontend y ocho pruebas .NET pasan; falta validación visual y manual. |

## Plantilla breve para la próxima actualización

Al cerrar un incremento, actualizar:

```text
Fecha:
Módulo:
Estado anterior -> nuevo estado:
Criterios verificados:
Evidencia (pruebas, revisión o resultado):
Brechas abiertas:
Próximo paso único:
```
