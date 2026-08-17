# Guía de desarrollo para Codex — Catálogo DYSTECH

## Proyecto

**Catálogo DYSTECH** es un catálogo web de productos. El proyecto debe evolucionar de forma incremental, manteniendo la experiencia de compra o consulta estable para las personas usuarias.

## Tecnologías

- HTML
- CSS
- JavaScript
- Supabase
- Supabase Storage
- Vercel

## Arquitectura general

El sitio se compone de una interfaz web construida con HTML, CSS y JavaScript. JavaScript gestiona la interacción, la carga y presentación de productos, y las integraciones necesarias. Supabase funciona como servicio de datos y Supabase Storage aloja archivos como imágenes de productos. Vercel publica el sitio y despliega la versión de producción desde la rama configurada.

Antes de modificar una parte del proyecto, revisa cómo se relaciona con las demás: interfaz, lógica de JavaScript, datos de Supabase, almacenamiento de imágenes y despliegue.

## Reglas de código

- No romper funcionalidades existentes.
- Reutilizar funciones y patrones ya presentes antes de crear duplicados.
- Conservar los nombres de variables, funciones, archivos y estructuras existentes cuando no haya una razón clara para cambiarlos.
- Diseñar y validar primero para móvil (*mobile-first*), sin descuidar escritorio.
- Mantener código legible, simple y ordenado.
- Hacer cambios pequeños, enfocados y fáciles de revisar.
- Evitar dependencias nuevas si la funcionalidad puede resolverse con la arquitectura actual.
- No eliminar funcionalidades, validaciones, estilos ni flujos existentes salvo petición explícita.

## Flujo de Git

Todo cambio debe realizarse en una rama de funcionalidad creada desde `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad
```

No se debe desarrollar directamente en `main`. Consulta `GITFLOW.md` para el flujo completo de creación, integración, publicación y limpieza de ramas.

## Instrucciones para Codex

Antes de editar:

1. Analiza los archivos y el flujo actual relacionados con la solicitud.
2. Explica brevemente el plan de cambio antes de aplicarlo.
3. Identifica riesgos para funcionalidades existentes, datos, imágenes, interfaz o móvil.

Al implementar:

1. Minimiza el alcance: modifica solo lo necesario para cumplir la solicitud.
2. Conserva la experiencia visual y de uso actual, excepto cuando el cambio solicitado indique lo contrario.
3. No renombres variables, funciones o archivos por preferencia estética; hazlo solo si es necesario para resolver el requerimiento.
4. Reutiliza el código existente siempre que sea apropiado.
5. Verifica que el cambio funcione en móvil y escritorio cuando afecte la interfaz.
6. Revisa que las integraciones con Supabase y Supabase Storage sigan funcionando si se modifican datos, productos o imágenes.

Al finalizar:

1. Indica qué archivos fueron modificados y el propósito de cada cambio.
2. Menciona las pruebas o verificaciones realizadas.
3. Señala cualquier aspecto que requiera validación manual o una decisión del equipo.

## Estilo de mensajes de commit

Usa mensajes breves, claros y en español, en presente e indicando la acción principal.

Ejemplos:

```text
Agrega filtro por categoría
Corrige carga de imágenes de productos
Mejora diseño móvil del carrito
Actualiza validación del formulario
```

Evita mensajes genéricos como `cambios`, `arreglos`, `update` o `prueba`.

## Objetivo

Mantener un catálogo estable, claro y fácil de mantener, mediante cambios seguros, incrementales y revisables. La prioridad es preservar la funcionalidad y la experiencia de uso mientras el proyecto crece.
