# Configurar Supabase para la app Flutter

Sigue estos pasos para tener la base de datos y el login con **correo y contraseña** listos.

---

## 1. Crear proyecto en Supabase

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) e inicia sesión.
2. **New project** → elige nombre, contraseña de base de datos y región.
3. Cuando esté listo, ve a **Settings** → **API**: copia **Project URL** y **anon public** key.

---

## 2. Poner URL y key en la app

1. En la app Flutter abre `lib/config/supabase_config.dart`.
2. Sustituye:
   - `supabaseUrl` → la **Project URL** (ej. `https://xxxx.supabase.co`).
   - `supabaseAnonKey` → la **anon public** o **Publishable** key (puede ser `eyJ...` o `sb_publishable_...`).

**Si sale "No se pudo conectar" o "Failed host lookup":**
- Entra en el Dashboard y comprueba que el proyecto esté **activo** (si está pausado, **Restore project**).
- Comprueba que la URL y la key en `supabase_config.dart` coincidan exactamente con **Settings → API** del proyecto.

---

## 3. Crear la tabla `reservations`

En Supabase: **SQL Editor** → **New query** → pega y ejecuta:

```sql
-- Tabla de reservaciones (un registro por reserva)
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  fecha text not null,
  hora text not null,
  responsable text not null,
  asunto text not null,
  participantes text default '',
  reservado_por text not null,
  created_at timestamptz default now()
);

-- Índice para cargar rápido las reservas de un día
create index if not exists idx_reservations_fecha on public.reservations (fecha);

-- RLS: cualquiera puede leer; solo autenticados crear; solo el dueño eliminar
alter table public.reservations enable row level security;

create policy "Lectura pública"
  on public.reservations for select
  using (true);

create policy "Solo autenticados pueden insertar"
  on public.reservations for insert
  with check (auth.role() = 'authenticated');

create policy "Solo el dueño puede eliminar"
  on public.reservations for delete
  using (auth.jwt() ->> 'email' = reservado_por);

-- Realtime: la app Flutter escucha cambios en esta tabla para actualizar la vista al instante.
-- (Si ya añadiste la tabla desde Dashboard → Database → Publications → supabase_realtime, omite la línea siguiente.)
alter publication supabase_realtime add table public.reservations;
```

---

## 4. Activar login con correo (Email)

1. En el dashboard: **Authentication** → **Providers** → **Email** → Activar (suele estar activo por defecto).
2. Crear usuarios en **Authentication** → **Users** → **Add user** → **Create new user**:
   - Indica el **Email** y la **Contraseña** del usuario.
   - Esos son los correos con los que se inicia sesión en la app (solo correo y contraseña, sin Google).

---

## 5. Ejecutar la app

En la carpeta `calendario_app`:

```bash
flutter pub get
flutter run
```

Elige dispositivo: **Android** (`flutter run -d <id_android>`), **iOS** (`flutter run -d <id_iphone>`) o **Chrome** (`flutter run -d chrome`).  
Si no tienes las carpetas `android` o `ios`, genera las plataformas con:

```bash
flutter create . --platforms=android,ios
```

---

## Resumen

| Paso | Dónde | Qué hacer |
|------|--------|-----------|
| 1 | Supabase Dashboard | Crear proyecto, copiar URL y anon key |
| 2 | `lib/config/supabase_config.dart` | Pegar URL y anon key (o usar `--dart-define` en producción) |
| 3 | Supabase SQL Editor | Ejecutar el SQL (tabla, RLS y **Realtime**) |
| 4 | Supabase Auth | Activar Email y crear usuarios en Users |
| 5 | Terminal en `calendario_app` | `flutter pub get` y `flutter run` |

La app carga las reservas del día con una consulta por fecha y se actualiza en tiempo real cuando alguien más crea o elimina una reserva (Supabase Realtime).
