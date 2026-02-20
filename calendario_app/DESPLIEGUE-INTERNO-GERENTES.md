# Despliegue interno solo para gerentes

La app está pensada para uso **interno**: solo los gerentes a los que tú des acceso pueden entrar. Cada uno usa **su correo** (y contraseña) configurado en Supabase.

**Todos ven y registran el horario en tiempo real:** cualquier gerente puede crear reservas; el resto ve los cambios al instante (mismo calendario para todos, actualizado en vivo).

---

## 1. Quién puede entrar (solo gerentes)

**Solo** puede iniciar sesión quien tenga un usuario en Supabase. Tú decides quién es gerente:

- Entras en **Supabase** → **Authentication** → **Users** → **Add user** → **Create new user**.
- Pones el **correo** del gerente y una **contraseña** (se la entregas por un canal seguro).
- Esa persona será la única que pueda entrar con ese correo.

No hay registro público: si no creas el usuario, no puede acceder. Así limitas el acceso solo a gerentes.

---

## 2. Dar acceso a cada gerente

Para cada gerente:

1. En [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Authentication** → **Users** → **Add user** → **Create new user**.
2. **Email**: el correo laboral del gerente (ej. `maria@empresa.com`).
3. **Password**: una contraseña (o “Auto-generate” y luego se la envías).
4. Guardas.
5. Le envías al gerente su **correo** y **contraseña** por un canal seguro (en persona, correo cifrado, etc.). Le dices que use esos datos en la app para iniciar sesión.

Solo quienes tengan ese usuario podrán ver y crear reservas. El horario reservado se ve en **tiempo real** para todos los que estén dentro de la app.

---

## 3. Desplegar la app internamente

Elige una forma de que los gerentes abran la app; no hace falta publicarla en tiendas.

### Opción A: Repartir el APK (Android)

1. Generas el APK:
   ```powershell
   cd calendario_app
   flutter build apk --release
   ```
2. El archivo está en **`build/app/outputs/flutter-apk/app-release.apk`**.
3. Envías el APK a cada gerente (correo, Drive interno, USB, etc.).
4. En el móvil Android activan “Instalar desde fuentes desconocidas” (o “Instalar apps desconocidas”) para ese origen e instalan el APK.
5. Abren la app, ponen su **correo y contraseña** (los que creaste en Supabase) y ya ven el calendario en tiempo real.

### Opción B: Enlace web interno

1. Generas la versión web:
   ```powershell
   cd calendario_app
   flutter build web
   ```
2. Subes la carpeta **`build/web`** a un servidor interno o intranet (o a un hosting privado al que solo accedan gerentes).
3. Les pasas el enlace (ej. `https://calendario.empresa.com` o la URL interna).
4. Abren el enlace en el navegador del móvil o PC, inician sesión con su **correo y contraseña** y ven el mismo horario en tiempo real.

En ambos casos la app se conecta a **Supabase** (URL y key en `supabase_config.dart`). Los datos y el acceso siguen controlados por los usuarios que tú creas en Supabase.

---

## 4. Ver en tiempo real el horario reservado

La app ya está preparada para esto:

- Cuando un gerente reserva un horario, se guarda en Supabase.
- Cualquier otro gerente que tenga la app abierta (o recargue) ve el cambio **al instante** (Supabase Realtime).
- No hace falta refrescar a mano: al crear o eliminar una reserva, la lista del día se actualiza sola para todos.

Cada uno inicia sesión con **su correo** (el que tú diste de alta en Supabase) y todos comparten el mismo calendario en vivo.

---

## Resumen

| Tú haces | Los gerentes hacen |
|----------|---------------------|
| Crear un usuario en Supabase por gerente (email + contraseña) | Reciben su correo y contraseña |
| Repartir el APK o el enlace web interno | Instalan la app o abren el enlace |
| — | Inician sesión con su correo y contraseña |
| — | Ven y crean reservas; el horario se actualiza en tiempo real para todos |

**Solo gerentes:** al dar acceso solo creando usuarios en Supabase, nadie más puede entrar. El registro de horarios reservados es común y en tiempo real para todos los que tienen acceso.
