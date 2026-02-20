# No me deja iniciar sesión

Sigue esta lista en orden. Casi siempre el fallo está en uno de estos puntos.

---

## 1. Proyecto de Supabase activo

- Entra en [supabase.com/dashboard](https://supabase.com/dashboard).
- Si el proyecto sale **pausado**, pulsa **Restore project** y espera a que esté activo.
- Si está pausado, la app no puede conectar y dará error de red.

---

## 2. Usuario creado con ese correo

- En el proyecto: **Authentication** → **Users**.
- Tiene que existir un usuario cuyo **Email** sea **exactamente** el que usas en la app (mayúsculas/minúsculas importan).
- Si no está: **Add user** → **Create new user** → pon ese correo y una contraseña → guarda.
- Esa contraseña es la que debes usar en la app.

---

## 3. Correo y contraseña correctos

- En la app escribe el correo **sin espacios** al inicio o al final.
- La contraseña es la que pusiste (o la que te dieron) en Supabase para ese usuario.
- Si no estás seguro, en Supabase → **Authentication** → **Users** → abre el usuario y, si hace falta, **Send password recovery** o crea un usuario nuevo con una contraseña que sepas.

---

## 4. URL y clave en la app

- En **Supabase**: **Settings** → **API** → copia **Project URL** y **anon public**.
- En la app: **`lib/config/supabase_config.dart`**.
  - `supabaseUrl` = la Project URL (ej. `https://xxxx.supabase.co`).
  - `supabaseAnonKey` = la clave **anon public**. Si usas la que empieza por `sb_publishable_` y no funciona, prueba la clave **larga** que empieza por **`eyJ`** (en Settings → API suele aparecer como “anon” “public” o en Legacy keys).

Vuelve a ejecutar la app después de cambiar la config.

---

## 5. Si solo falla en el móvil y en Chrome sí entra

- Suele ser **red o DNS** del móvil/emulador (no llega a Supabase).
- Prueba en el móvil con **datos móviles** en lugar de WiFi (o al revés).
- Para uso interno, los gerentes pueden usar la **versión web** en el navegador del móvil (misma URL que en el PC).

---

## Resumen

| Comprueba | Dónde |
|-----------|--------|
| Proyecto activo | Supabase Dashboard → Restore si está pausado |
| Usuario existe | Authentication → Users (mismo correo) |
| Contraseña correcta | La que tiene ese usuario en Supabase |
| URL y anon key | supabase_config.dart = Settings → API |
| En móvil no conecta | Probar otra red o usar la app en el navegador |

En la pantalla de login de la app tienes el botón **«¿No puedes iniciar sesión?»** con esta misma ayuda.
