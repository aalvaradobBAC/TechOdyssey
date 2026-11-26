# Especificación: página pública de TechOdyssey

- **Estado:** primera implementación
- **Audiencia:** intranet de la organización.
- **Alcance:** página inicial, catálogo de tecnologías, estadísticas comunitarias y
  Top 10 de participantes.

## Experiencia

- La página utiliza una identidad visual oscura, tecnológica y gamificada:
  fondo azul noche, acentos cian, progreso, misiones y clasificación.
- La estructura visual es estable; títulos, descripciones, tecnologías, pasos,
  etiquetas y mensajes destacados se sirven desde la API y se editan por
  configuración, no en componentes React.
- El catálogo muestra tecnologías activas y planificadas. La ruta solo se puede
  abrir para una tecnología activa con ruta configurada.
- La comunidad muestra métricas calculadas desde las cuentas y el progreso
  persistido. No se inventan cifras para laboratorios, retos o insignias que el
  sistema todavía no registra.
- El Top 10 es global y acumulado por XP, con desempate por módulos completados
  y luego correo. Los correos completos son visibles porque la página se usa
  dentro de la intranet.
- No se ofrece filtro semanal ni por tecnología hasta que el sistema registre
  eventos fechados y XP atribuible por tecnología.

## Datos públicos y API

- `GET /api/public/home` es anónimo y devuelve:
  - el contenido configurable del hero, beneficios, pasos y catálogo;
  - cantidad de participantes registrados, módulos completados acumulados y XP
    acumulados;
  - hasta el límite configurable de participantes con posición, correo, XP,
    nivel y cantidad de módulos completados.
- El ranking ordena XP de mayor a menor, cantidad de módulos de mayor a menor y
  correo ascendente para que los empates sean deterministas.
- La cantidad máxima de participantes del ranking es configurable y no supera
  10 en esta versión.
- El endpoint no devuelve hashes, claves, IDs internos de cuenta ni cookies.
- Los datos se consultan al abrir la página y se pueden volver a solicitar con
  la acción “Actualizar”; no se simulan actualizaciones locales.
- Si la API falla, la página conserva el diseño y muestra el error en lugar de
  sustituir datos dinámicos por valores de ejemplo.

## Fuente de configuración

- `PublicHome` en `appsettings.json` configura el contenido de presentación, el
  catálogo de tecnologías, los pasos de aprendizaje y el límite del ranking.
- Las cuentas y el progreso existentes son la fuente de las estadísticas; no se
  duplican en configuración.
- Al añadir o cambiar tecnologías se actualiza el catálogo de configuración y
  la interfaz refleja la respuesta de la API sin cambios de código.

## Validación de aceptación

1. La página inicial usa el tema oscuro/cian y presenta hero, catálogo,
   estadísticas comunitarias, Top 10 y pasos de aprendizaje.
2. Ninguna tecnología, cifra de comunidad, fila de ranking ni texto de
   presentación está definido en JSX.
3. Las cifras y el Top 10 cambian al cambiar la configuración o el progreso
   persistido.
4. El endpoint es anónimo, no filtra credenciales ni IDs internos y limita el
   ranking al máximo configurado de 10.
5. El catálogo funciona con cualquier número de tecnologías configuradas y no
   presenta una tecnología planificada como disponible.
