# Especificación: ruta de aprendizaje IBM i y RPG

- **Identificador:** RPG-ROUTE
- **Versión:** 0.1
- **Estado:** borrador de trabajo
- **Última revisión:** 2026-11-23
- **Especificación común:** [PROJECT-SDD](./project-sdd.md) define los requisitos
  transversales de aprendizaje, gamificación y proceso SDD; este documento
  añade los requisitos específicos de RPG.
- **Seguimiento:** el tablero de [estado](./rpg-learning-route-status.md)
  registra el avance real.

## 1. Propósito

Construir por incrementos una ruta de aprendizaje gamificada que lleve a una
persona desde el diagnóstico de sus conocimientos hasta el desarrollo,
modernización y entrega de una aplicación RPG en IBM i. Cada incremento debe
tener un alcance pequeño, criterios de aceptación observables y evidencia de
validación antes de iniciar el siguiente.

## 2. Alcance

La ruta cubre los 19 módulos declarados en
[`technology.yml`](../../technologies/rpg/technology.yml) y sus archivos
`curriculum/modules/*/module.yml`: desde M00, diagnóstico, hasta M18, proyecto
integrador. Incluye contenidos, prácticas en orden progresivo, evaluación,
progreso y elementos de gamificación.

La ejecución real contra IBM i se considera una integración opcional y
controlada: la configuración actual declara `runtime.enabled: false`. Ningún
criterio de aceptación debe requerir una conexión productiva ni credenciales
reales.

## 3. Personas y necesidades

- **Aprendiz:** conocer su punto de partida, avanzar con objetivos claros,
  practicar en pasos, recibir retroalimentación y retomar su progreso.
- **Autor/a de contenido:** definir cada módulo de forma uniforme, comprobable
  y trazable, sin depender de que el contenido esté codificado en una pantalla.
- **Facilitador/a:** entender qué competencias valida cada módulo y qué
  evidencia demuestra su finalización.

## 4. Requisitos funcionales

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RPG-F-01 | La ruta muestra los módulos en el orden curricular, sus prerrequisitos y su estado. | Para cada módulo del registro existe una entrada visible o una explicación explícita de por qué está bloqueado. |
| RPG-F-02 | M00 identifica conocimientos previos y recomienda cómo comenzar. | Un intento selecciona 10 preguntas del banco, presenta resultado y recomendación, y no suma una calificación de curso. |
| RPG-F-03 | Un módulo enseña competencias en una secuencia progresiva. | El módulo define objetivos, explicación/demostración, práctica guiada, práctica autónoma o reto y retroalimentación, según aplique. |
| RPG-F-04 | Cada actividad indica qué debe hacer el aprendiz y cómo comprobar el resultado. | Una práctica incluye instrucciones y evidencia/resultado esperado; un reto declara entregables y evaluación. |
| RPG-F-05 | La finalización respeta los criterios declarados para el módulo. | La aprobación conceptual respeta el mínimo configurado (80% por defecto); también se completan laboratorios, retos o misión requeridos. |
| RPG-F-06 | La progresión respeta los prerrequisitos. | Un módulo no se habilita hasta cumplir los criterios de sus prerrequisitos; un diagnóstico por sí solo no equivale a completar M00 si la especificación de M00 establece otros criterios. |
| RPG-F-07 | El aprendiz recibe progreso y retroalimentación útiles. | La interfaz muestra qué se completó, qué falta y el resultado de las comprobaciones sin ocultar errores. |
| RPG-F-08 | El progreso de aprendizaje se puede retomar. | Al salir y volver a entrar, se conservan las unidades completadas y se abre la siguiente unidad pendiente. Cada ruta y tecnología debe aplicar el mismo comportamiento. |
| RPG-F-09 | El cierre de ruta verifica el proyecto integrador. | La ruta no se considera completa sin el capstone, de acuerdo con `technology.yml`. |
| RPG-F-10 | El contenido educativo se mantiene fuera de los componentes de interfaz. | Un autor puede cambiar instrucciones o preguntas editando los archivos de contenido, sin editar TSX ni alterar el comportamiento del renderer. |
| RPG-F-11 | Una persona puede crear una cuenta e iniciar sesión para recuperar su progreso. | La API autentica la cuenta y devuelve sus XP, nivel y módulos completados al iniciar sesión. |
| RPG-F-12 | Los puntos y niveles son autoritativos en el servidor. | El cliente no puede enviar un saldo, nivel o usuario objetivo. Las unidades no otorgan XP; completar un módulo acredita su recompensa una sola vez. El mismo contrato aplica a RPG, Java y cualquier ruta futura. |
| RPG-F-13 | El progreso sobrevive al cierre del navegador y al reinicio de la aplicación. | La API persiste las cuentas y el progreso en JSON en almacenamiento persistente del servidor, sin base de datos. |
| RPG-F-14 | Una cuenta administradora puede restablecer la contraseña de otra cuenta sin borrar su avance. | El servidor autoriza el reset y cambia solo el hash/version de contraseña; XP, nivel y módulos completados permanecen iguales. |
| RPG-F-15 | Las evaluaciones aleatorizan el orden de sus opciones. | Cada carga o intento nuevo presenta las opciones en un orden aleatorio distinto por participante; la corrección sigue apuntando a la respuesta correcta original y no depende de que aparezca primero. |
| RPG-F-16 | M03 enseña modelado de datos básicos sin adelantar operadores ni estructuras. | Las siete unidades cubren DCL-S, tipos escalares, precisión, estado, tiempo, constantes/LIKE y una misión integradora; excluyen decisiones, ciclos, estructuras de datos, SQL y conversiones profundas según M04–M11. |
| RPG-F-17 | M03 separa decisión de modelado y sintaxis IBM i verificable. | El contenido explica cada tipo con el significado del dato, distingue recomendaciones TechOdyssey de restricciones de RPG y valida ejemplos contra la documentación o compilador declarado antes de publicar. |
| RPG-F-18 | M03 usa prácticas abiertas donde la unidad requiere construcción. | La práctica puede pedir ordenar y escribir declaraciones independientes; la validación comprueba estructura mínima, líneas requeridas y casos prohibidos, sin depender únicamente de marcar checklist. |
| RPG-F-19 | M03-U02 selecciona texto fijo o variable según el contrato del dato. | El participante compara `CHAR(length)` y `VARCHAR(maximum-length)`, elige entre ellos para códigos, identificadores y texto variable, conserva ceros iniciales en identificadores no usados para cálculo y escribe declaraciones comprobables con `DCL-S`. |
| RPG-F-20 | Las comprobaciones de M03 varían por intento. | Cada unidad de M03 tiene un banco de al menos tres preguntas sobre su objetivo; cada intento muestra una pregunta seleccionada al azar y vuelve a seleccionar al reintentar, además de barajar las opciones. U01, U02 y U03 cumplen este criterio. |
| RPG-F-21 | M03-U03 modela números según signo, rango y precisión requerida. | La unidad distingue `INT` de `UNS`, comprueba sus tamaños admitidos y rangos de ejemplo con IBM, diferencia precisión y escala, contrasta `PACKED`, `ZONED` y `BINDEC`, y valida declaraciones completas para un importe decimal y contadores con contratos de signo explícitos. Incluye una comprobación aleatoria de al menos tres preguntas. |

## 5. Fuente editorial de contenido

### Propuesta para validar con un piloto

- **Markdown (`content.md`):** lecciones, instrucciones, ejemplos, glosarios y
  actividades con contenido narrativo, además de reglas editoriales específicas
  del módulo como cantidad de preguntas por intento y recomendaciones.
- **CSV (`questions.csv`):** bancos de preguntas de estructura uniforme, con
  columnas explícitas para identificador, categoría, nivel, escenario,
  pregunta, opciones, respuesta correcta y explicación.
- **YAML (`module.yml`):** metadatos de módulo y configuración, como objetivos,
  prerrequisitos, duración y criterios de aprobación.
- **TSX:** componentes de presentación e interacción reutilizables; no debe ser
  la fuente editorial de lecciones o enunciados.

Esta separación es una propuesta, no una migración completada. M00 será el
piloto para comprobar que el formato conserva toda la información necesaria,
es cómodo de editar y puede validarse antes de mostrarse. No convertir otros
módulos hasta revisar los resultados del piloto.

El renderer debe validar el esquema y reportar errores de contenido de forma
explícita. El Markdown debe renderizarse sin HTML arbitrario y con las
protecciones adecuadas para contenido no confiable.

## 6. Requisitos de contenido por módulo

Cada módulo es un incremento independiente y debe registrar en su
`module.yml`/especificación:

1. Identidad, versión, estado y prerrequisitos.
2. Objetivo y resultados de aprendizaje observables.
3. Duración estimada por tipo de actividad, con total coherente.
4. Temas, ejemplos y demostraciones necesarios para los resultados.
5. Prácticas guiadas y retos, con instrucciones, entorno y resultado esperado.
6. Comprobaciones de conocimiento con respuesta y explicación de la respuesta.
7. Evidencias y criterios de aprobación; puntuaciones que sumen 100% cuando
   exista una rúbrica ponderada.
8. Cumplimiento de los requisitos comunes de aprendizaje y gamificación de
   [PROJECT-SDD](./project-sdd.md), adaptados a los temas y actividades RPG.
9. Riesgos y controles cuando se interactúe con IBM i, datos o credenciales.
10. Fuentes técnicas consultadas, con edición y páginas, y referencias entre cada
   resultado y al menos una actividad/evaluación que lo compruebe.

Un contenido no se marca como listo solo porque exista un archivo o una vista:
sus criterios de aceptación deben estar verificados.

## 7. Requisitos de calidad y restricciones

- **RPG-Q-01 — Seguridad:** los ejercicios usan entornos y bibliotecas de
  entrenamiento; nunca incluyen secretos ni requieren autoridad productiva.
- **RPG-Q-02 — Claridad:** instrucciones, términos y retroalimentación están en
  español y son comprensibles sin conocimientos no declarados como prerrequisito.
- **RPG-Q-03 — Accesibilidad:** las interacciones se pueden completar con
  teclado y tienen etiquetas/estados comprensibles; no se comunica estado solo
  mediante color.
- **RPG-Q-04 — Trazabilidad:** cada criterio de aceptación se puede relacionar
  con contenido, interfaz o prueba.
- **RPG-Q-05 — Robustez:** una respuesta incorrecta permite aprender y volver a
  intentar; no marca una actividad como aprobada por error.
- **RPG-Q-06 — Independencia del runtime:** contenidos conceptuales y
  comprobaciones que no requieren IBM i funcionan con el runtime deshabilitado.
- **RPG-Q-07 — Separación editorial:** los cambios de contenido no requieren
  modificar o desplegar lógica de interfaz cuando no cambie el comportamiento.

## 8. Secuencia curricular de referencia

La secuencia y los prerrequisitos declarados en los `module.yml` son:

| Módulo | Tema |
|---|---|
| M00 | Diagnóstico y ruta personalizada |
| M01 | IBM i y Visual Studio Code |
| M02 | Anatomía de un programa Free RPG |
| M03 | Variables, constantes y tipos |
| M04 | Operadores y expresiones |
| M05 | Control de flujo |
| M06 | Ciclos y procesamiento repetitivo |
| M07 | Funciones integradas |
| M08 | Estructuras de datos y arreglos |
| M09 | Db2 for i y SQL embebido |
| M10 | Acceso nativo a archivos |
| M11 | Procedimientos e ILE |
| M12 | Errores, logging y observabilidad |
| M13 | Pruebas de software |
| M14 | Git y trabajo colaborativo |
| M15 | Lectura de RPG fijo |
| M16 | Modernización a RPG Free |
| M17 | IA aplicada al desarrollo IBM i |
| M18 | Proyecto integrador |

## 9. Método de trabajo: especificación antes de implementación

Para cada módulo, seguir este ciclo y mantener el alcance por fases:

1. **Definir:** crear o completar la especificación del módulo, sus resultados,
   prerrequisitos, formato de fuentes y criterios de aceptación.
2. **Revisar:** confirmar que el alcance cabe en un incremento y que contenido,
   actividad y evaluación cubren los resultados.
3. **Pilotar:** probar el formato editorial y el renderer en un solo módulo
   antes de migrar la ruta.
4. **Implementar:** ampliar solo después de aceptar los resultados del piloto;
   construir lo requerido por los criterios aprobados.
5. **Verificar:** validar criterios con revisión de contenido, pruebas de
   interfaz y/o pruebas automatizadas pertinentes; registrar evidencia.
6. **Cerrar:** actualizar `module.yml`, README del módulo y tablero; solo
   entonces iniciar el siguiente módulo.

La especificación detallada de cada módulo puede vivir en su carpeta
[`curriculum/modules/`](../../technologies/rpg/curriculum/modules/). Esta
especificación de ruta establece los criterios comunes y no sustituye esos
documentos.

## 10. Definición de terminado por módulo

Un módulo puede pasar a **listo** cuando:

- tiene especificación, objetivo, resultados y criterios de aceptación;
- contenido, práctica y evaluación están implementados y cubren esos resultados;
- prerrequisitos y criterios de finalización coinciden entre especificación,
  `module.yml` e interfaz;
- las pruebas relevantes pasan y no quedan brechas conocidas de seguridad o
  accesibilidad que impidan el aprendizaje;
- el README del módulo deja de contener marcadores como «Pendiente» y el
  tablero refleja evidencia y siguiente paso.
- las fuentes Markdown/CSV se validan y la interfaz las consume sin duplicar
  contenido educativo dentro del código.

## 11. Decisiones pendientes

- Validar con el piloto si Markdown más CSV resulta práctico para autores y si
  CSV es suficiente para todos los formatos de evaluación; mantener la
  propuesta revisable hasta entonces.
- Definir si los resultados del diagnóstico omiten actividades o solo
  recomiendan un ritmo distinto; el comportamiento actual habilita M01 al
  completar el diagnóstico, sin usar el puntaje para decidir el bloqueo.
- El MVP de gamificación usa cuentas locales, cookie segura y `App_Data/gamification.json`;
  la API calcula el nivel (1 + floor(XP / 500)) y otorga 100 XP por completar M00
  una sola vez. La especificación detallada está en
  [`gamification-api.md`](./gamification-api.md).
- Acordar cómo se validan laboratorios que requieren un sistema IBM i cuando el
  runtime de entrenamiento aún está deshabilitado.
- Confirmar si módulos con experiencia previa pueden ofrecer rutas aceleradas
  sin saltarse competencias obligatorias.
