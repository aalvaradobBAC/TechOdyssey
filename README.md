# TechOdyssey

Plataforma de rutas de aprendizaje gamificadas para tecnologías de desarrollo.

## Ejecución en Ubuntu

Inicia la API y el portal en paralelo con:

```bash
./levantar.sh
```

La API estará en `http://localhost:5048` y el portal en `http://localhost:5173`.
Presiona `Ctrl+C` para detener ambos servicios.

## Documentación

- [SDD y requisitos transversales del proyecto](docs/specs/project-sdd.md)
- [Ruta de aprendizaje RPG para IBM i](technologies/rpg/README.md)
- [Especificación de la ruta RPG](docs/specs/rpg-learning-route.md)
- [Estado y próximo paso de la ruta RPG](docs/specs/rpg-learning-route-status.md)
- [Especificación de la página pública](docs/specs/public-home.md)
- [Estructura del repositorio](docs/architecture/repository-structure.md)

## Flujo de Git

Los scripts de la carpeta `scripts/git/` están numerados según el orden de uso:

1. `01-configurar-identidad-una-vez.sh`: configura nombre y correo de Git una
   sola vez en cada computadora.
2. `02-clonar-repositorio-una-vez.sh`: clona el repositorio una sola vez en la
   computadora donde se trabajará.
3. `03-actualizar-antes-de-trabajar-recurrente.sh`: trae cambios remotos antes
   de cada sesión de trabajo; requiere un árbol de trabajo limpio.
4. `04-guardar-y-publicar-recurrente.sh`: prepara los cambios, muestra el
   resumen y solicita confirmación antes de crear un commit y publicarlo.

Ejecuta los scripts desde la terminal. El de clonación puede recibir como
argumento la carpeta de destino; los demás localizan automáticamente la raíz
del repositorio. Los artefactos generados, `workspaces/` y el ZIP descargable
se excluyen del flujo normal de publicación.