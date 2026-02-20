# Subir la app a GitHub

Sí, puedes subir el proyecto a GitHub. Pasos básicos:

---

## 1. Crear el repositorio en GitHub

1. Entra en [github.com](https://github.com) e inicia sesión.
2. **+** (arriba derecha) → **New repository**.
3. Nombre (ej. `calendario-ts` o `tactical-support-calendario`).
4. Elige **Private** si solo tú o tu equipo deben verlo.
5. No marques "Add a README" (ya tienes archivos locales).
6. **Create repository**.

---

## 2. Subir desde tu PC

Abre **PowerShell** o **CMD** en la carpeta **del proyecto Calendario** (la raíz, no solo `calendario_app`):

```powershell
cd c:\Users\fjavi\Calendario

git init
git add .
git commit -m "App calendario TACTICAL SUPPORT - Flutter + Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario de GitHub y `NOMBRE_REPO` por el nombre del repositorio que creaste.

Si ya tenías `git init` y un `remote`, solo haz:

```powershell
git add .
git commit -m "App calendario Flutter + Supabase"
git push -u origin main
```

---

## 3. Sobre la configuración de Supabase

En `calendario_app/lib/config/supabase_config.dart` están la **URL** y la **clave pública (anon)** de Supabase. Esa clave está pensada para ir en la app (no es secreta como la service_role).

- **Repositorio privado:** puedes subir el archivo tal cual; solo lo ve quien tenga acceso al repo.
- **Repositorio público:** si no quieres exponer tu proyecto de Supabase, puedes:
  - Añadir `lib/config/supabase_config.dart` al `.gitignore` y crear un `supabase_config.example.dart` con placeholders (`TU_URL`, `TU_ANON_KEY`), o
  - Usar `--dart-define` al ejecutar y no commitear valores reales.

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | Crear repo en GitHub (Private o Public). |
| 2 | `git init`, `git add .`, `git commit`, `git remote add origin`, `git push`. |
| 3 | Si el repo es público y no quieres mostrar tu Supabase: no subas `supabase_config.dart` (usa .gitignore o example). |

Después puedes clonar el repo en otro PC o compartirlo con tu equipo.
