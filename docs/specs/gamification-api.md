# Especificación: autenticación y progreso gamificado

- **Estado:** primera implementación
- **Alcance:** cuentas locales, progreso transversal de rutas de aprendizaje y persistencia JSON en el servidor.
- **Requisitos transversales:** [PROJECT-SDD](./project-sdd.md) define los
  criterios comunes de progreso, gamificación y recompensas para todas las
  tecnologías; este documento especifica su implementación en la API.

## Arquitectura de progreso transversal

- Todo progreso se identifica mediante el par de códigos estables
  `technologyCode/moduleCode`, por ejemplo `rpg/M01` o `java/M01`. Un código
  de módulo no identifica progreso por sí solo porque puede repetirse en otra
  tecnología.
- Toda unidad se identifica dentro de su módulo mediante un código estable,
  por ejemplo `rpg/M01/M01-S03`.
- La pantalla de una tecnología calcula el porcentaje con sus propios módulos:
  módulos completados únicos de esa tecnología / total de módulos configurados
  para esa tecnología. No utiliza puntuaciones temporales de la sesión de
  navegador ni mezcla módulos de otras tecnologías.
- El porcentaje de progreso mostrado corresponde a módulos acreditados en una
  cuenta autenticada; completar una actividad sin sesión no actualiza el
  progreso persistente hasta iniciar sesión y guardar la finalización.
- La unidad completada se persiste una sola vez por cuenta. El reintento puede
  actualizar el resultado, pero no duplicar el avance ni acumular XP adicional.
- Al salir y volver a entrar, el sistema restaura las unidades completadas y abre
  la siguiente unidad pendiente. La clave local también incluye tecnología,
  módulo y cuenta. El progreso de navegador es una copia local de recuperación;
  la cuenta autenticada es la fuente autoritativa.
- El progreso local se separa por email/cuenta. Una cuenta autenticada reemplaza
  su vista local con la lista devuelta por el servidor y no hereda unidades
  completadas por otra cuenta.
- Solo la acreditación del módulo puede otorgar la recompensa XP configurada.
  Completar unidades individuales no otorga XP adicional. Las claves sin regla
  de recompensa se pueden registrar, pero no conceden XP.
- La API debe calcular el nivel y evitar recompensas duplicadas. El frontend no
  puede enviar saldo, nivel ni crédito automático.
- La actualización de unidades y módulos usa los códigos de tecnología y módulo
  como parámetros; no se implementan rutas de escritura exclusivas para M01.
  Los códigos aceptan letras ASCII, números, guion y guion bajo, con un máximo
  de 64 caracteres.
- Los registros existentes sin código de tecnología se interpretan como
  progreso de `rpg`. Las secciones históricas de M01 permanecen disponibles
  bajo `rpg/M01`.

## Decisiones del MVP

- Una cuenta se identifica por email y contraseña; la contraseña se almacena
  únicamente como hash PBKDF2-HMAC-SHA256 con salt aleatorio.
- La API emite una cookie persistente `HttpOnly`, `SameSite=Strict`, con
  expiración de 14 días. En producción requiere HTTPS.
- La API es la autoridad para puntos y nivel. El cliente no envía ni puede
  sobrescribir saldo, nivel, email de sesión ni usuario objetivo.
- El servidor guarda la clave `technologyCode/moduleCode` en `completedModules`
  y recalcula el nivel. Las reglas actuales otorgan 100 XP una vez para
  `rpg/M00`, `rpg/M01` y `rpg/M02`; los nuevos módulos reciben XP solo cuando
  se agrega su regla en el servidor. El nivel inicial es 1 y sube por cada
  500 XP.
- M00 continúa siendo el diagnóstico inicial de `rpg`; finalizarlo acredita
  `rpg/M00` sin depender del porcentaje obtenido en el diagnóstico.
- Las cuentas y el progreso viven en `App_Data/gamification.json`, fuera del
  contenido público estático. En sistemas Unix se restringen permisos a la
  cuenta del proceso. El archivo se reemplaza atómicamente.
- No se utiliza una base de datos. El almacenamiento JSON es para una única
  instancia de la API; no coordina escrituras entre varias réplicas.

## Endpoints

| Método | Ruta | Acceso | Comportamiento |
|---|---|---|---|
| GET | `/api/public/home` | Público | Devuelve contenido configurable, catálogo, estadísticas agregadas y Top 10. |
| POST | `/api/auth/register` | Público | Crea una cuenta y abre sesión. Contraseña de 12 a 128 caracteres. |
| POST | `/api/auth/login` | Público | Valida credenciales y abre sesión. |
| POST | `/api/auth/logout` | Sesión | Cierra sesión. |
| GET | `/api/auth/me` | Sesión | Devuelve email, XP, nivel y módulos completados como claves `technologyCode/moduleCode`. |
| GET | `/api/progress` | Sesión | Devuelve el progreso del usuario autenticado. |
| POST | `/api/progress/{technologyCode}/{moduleCode}/complete` | Sesión | Registra el módulo y aplica la regla de recompensa definida en el servidor, solo la primera vez. |
| GET | `/api/progress/{technologyCode}/{moduleCode}/units` | Sesión | Devuelve las unidades completadas en ese módulo. |
| POST | `/api/progress/{technologyCode}/{moduleCode}/units/{unitCode}/complete` | Sesión | Registra una unidad sin otorgar XP. |
| POST | `/api/progress/m00/complete` | Sesión | Alias compatible para completar `rpg/M00`. |
| POST | `/api/progress/m01/complete` | Sesión | Alias compatible para completar `rpg/M01`. |
| GET | `/api/progress/m01/sections` | Sesión | Alias compatible para obtener las unidades completadas de `rpg/M01`. |
| POST | `/api/progress/m01/sections/{sectionId}/complete` | Sesión | Alias compatible para completar una unidad de `rpg/M01`. |
| POST | `/api/admin/recover-account` | Clave secreta | Restablece la contraseña de la cuenta administradora configurada, sin requerir su sesión. |
| POST | `/api/admin/password-reset` | Sesión administradora + clave secreta | Cambia la contraseña de otra cuenta, conserva su progreso e invalida sus sesiones activas. |

Las rutas de autenticación tienen un límite de 10 solicitudes por minuto por IP.
Los endpoints de API responden con códigos HTTP, sin redirecciones a páginas de
inicio de sesión. El frontend debe enviar la cookie con credenciales al consumir
la API. En desarrollo, Vite proxifica `/api` a `http://127.0.0.1:5048`; la
interfaz de M00 presenta el formulario de acceso y el saldo de XP/nivel.

## Restablecimiento administrativo de contraseña

- Solo la cuenta cuyo email coincide con `Admin:Email` recibe el indicador
  `canResetPasswords` y puede usar el endpoint administrativo.
- El email configurado por sí solo no concede el reset: la solicitud requiere
  además la clave secreta del servidor.
- Si se olvidó la contraseña de la cuenta administradora, `/recover-account`
  permite recuperarla sin iniciar sesión, pero solo cambia la cuenta cuyo email
  está configurado en `Admin:Email`. La clave secreta es la autorización de
  emergencia.
- Cada solicitud también debe incluir `X-Admin-Reset-Key`. Configurar el email
  y un secreto aleatorio de al menos 32 bytes mediante `Admin__Email` y
  `Admin__ResetSecret`; no guardar el secreto en `appsettings.json`, Git ni en el
  frontend.
- El administrador define la nueva contraseña del usuario. La API solo cambia
  su hash y versión de contraseña; los XP, nivel e historial quedan intactos.
  La versión invalida las cookies existentes del usuario afectado.
- La cuenta administradora debe iniciar sesión con su propia contraseña y
  presentar la clave secreta para cada reset. El secreto nunca se persiste en
  el navegador.
- Al reiniciar la API con la configuración del administrador, el endpoint
  autenticado expone `canResetPasswords` para habilitar el formulario de reset
  en la interfaz de cuenta.

## Ejecución y despliegue

- La ruta de datos se configura con `Gamification:DataDirectory` o
  `Gamification__DataDirectory`; por defecto es `App_Data` junto a la API.
- Para habilitar el reseteo administrativo, configurar
  `Admin__Email=aalvaradob@baccredomatic.gt` y `Admin__ResetSecret` en el entorno
  que inicia la API; reiniciar el proceso después de cambiar la configuración.
- En desarrollo, iniciar la API en `http://localhost:5048` y el frontend con
  Vite; `/api` se proxifica al backend. Si el frontend y la API se despliegan
  en orígenes distintos, definir `VITE_API_BASE_URL` al construir el frontend
  y autorizar el origen real en `Cors:AllowedOrigins`.
- En producción, montar esa ruta en almacenamiento persistente, restringir el
  acceso al sistema de archivos y configurar `Cors:AllowedOrigins` solo con el
  origen real del frontend.
- Usar HTTPS en producción. La cookie de producción se marca `Secure`.
- Mantener una única instancia de API y respaldar `gamification.json`. Si el
  volumen es efímero, se pierde el progreso al recrear el entorno.

## Límite conocido

El endpoint M00 limita la recompensa a una concesión por cuenta, y el cliente no
puede elegir la cantidad de XP. La futura validación autoritativa de respuestas
del diagnóstico debe ocurrir en el servidor antes de usar M00 como evidencia de
dominio. La puntuación actual sigue siendo informativa, no una calificación.
