# Flujo de Git — Catálogo DYSTECH

Este documento define una forma segura y ordenada de trabajar en el proyecto. Su objetivo es proteger la versión publicada y facilitar el desarrollo de nuevas funcionalidades.

## Ramas del proyecto

### `main`

Es la rama de **producción**. Contiene la versión lista para publicar y es la que Vercel despliega.

- No se desarrolla directamente en esta rama.
- Solo recibe cambios ya probados desde `develop`.

### `develop`

Es la rama de **integración**. Aquí se reúnen las funcionalidades terminadas antes de publicarlas.

- Las nuevas funcionalidades se crean a partir de `develop`.
- Antes de publicar, prueba aquí la integración de los cambios.

### `feature/*`

Cada funcionalidad o corrección importante se desarrolla en su propia rama.

Ejemplos:

```text
feature/paginacion
feature/filtro-ecotech
feature/checkout-whatsapp
fix/error-carga-imagenes
```

## Crear una nueva funcionalidad

Empieza siempre desde una copia actualizada de `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad
```

Ejemplo para agregar paginación:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/paginacion
```

## Guardar y subir cambios

Revisa primero qué archivos cambiaste:

```bash
git status
```

Después guarda los cambios en Git y sube la rama a GitHub:

```bash
git add .
git commit -m "Agrega paginación al catálogo"
git push -u origin feature/paginacion
```

En los siguientes cambios de la misma rama normalmente basta con:

```bash
git add .
git commit -m "Corrige navegación de paginación"
git push
```

## Integrar una funcionalidad en `develop`

Cuando la funcionalidad esté terminada y probada, intégrala a `develop`:

```bash
git checkout develop
git pull origin develop
git merge feature/paginacion
git push origin develop
```

Si Git informa de un conflicto, resuélvelo, prueba el proyecto y completa el *merge* antes de hacer `push`.

## Publicar cambios en `main`

Cuando los cambios de `develop` estén listos para producción:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Vercel detectará los cambios de `main` y realizará el despliegue automáticamente, según la configuración del proyecto.

## Eliminar una rama de funcionalidad

Después de integrar y verificar la funcionalidad, elimina la rama local:

```bash
git branch -d feature/paginacion
```

Luego elimina la rama remota:

```bash
git push origin --delete feature/paginacion
```

Usa `-d` para que Git evite borrar por error una rama que todavía no se haya integrado.

## Buenas prácticas

- Nunca desarrolles directamente en `main`.
- Crea una sola funcionalidad o corrección relacionada por cada rama.
- Usa nombres claros, por ejemplo `feature/filtro-marca` o `fix/carrito-mobile`.
- Escribe *commits* descriptivos y concretos: `Agrega filtro por categoría`, no `cambios`.
- Prueba la funcionalidad en computador y celular antes de integrarla.
- Actualiza la rama con `git pull` antes de empezar a trabajar y antes de hacer un *merge*.
- Antes de cerrar Visual Studio Code, ejecuta:

  ```bash
  git status
  ```

  Lo ideal es ver:

  ```text
  nothing to commit, working tree clean
  ```

  Si hay cambios pendientes, decide si debes guardarlos con un *commit* o revisarlos antes de cerrar.

## Resumen rápido

```bash
# Crear una funcionalidad
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# Guardar el trabajo
git add .
git commit -m "Descripción clara del cambio"
git push -u origin feature/nombre-funcionalidad

# Integrar en desarrollo
git checkout develop
git pull origin develop
git merge feature/nombre-funcionalidad
git push origin develop

# Publicar en producción
git checkout main
git pull origin main
git merge develop
git push origin main

# Limpiar la rama terminada
git branch -d feature/nombre-funcionalidad
git push origin --delete feature/nombre-funcionalidad
```
