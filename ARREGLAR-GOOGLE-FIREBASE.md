# Arreglar: "the Google id_token is not allowed to be used with this application"

El error significa que el **Client ID de Google** que usas en la app **no es del mismo proyecto** que tu Firebase. Firebase solo acepta el token si el Client ID es del proyecto vinculado a Firebase.

## Solución: usar el Client ID que muestra Firebase

### Paso 1: Obtener el Client ID correcto desde Firebase

1. Entra en **[Firebase Console](https://console.firebase.google.com/)** → proyecto **calendario-ts-ed5c4**.
2. Menú **Authentication** → pestaña **Sign-in method** (Método de inicio de sesión).
3. Clic en **Google** (la fila del proveedor).
4. En la ventana verás **"Web SDK configuration"** o **"Configuración del SDK web"** con:
   - **Web client ID**: algo como `809581021929-xxxxx.apps.googleusercontent.com`
   - **Web client secret**: (no lo necesitas para el front)

5. **Copia el "Web client ID"** (tiene que ser del proyecto 809581021929, no 489487806580).

### Paso 2: Ponerlo en config.js

1. Abre **config.js** en tu proyecto.
2. Sustituye el valor de **TACTICAL_SUPPORT_GOOGLE_CLIENT_ID** por el Web client ID que copiaste:

```js
window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID = 'EL_WEB_CLIENT_ID_QUE_COPIASTE.apps.googleusercontent.com';
```

3. Guarda el archivo.

### Paso 3: Orígenes autorizados en Google Cloud

Para que ese Client ID funcione en tu sitio:

1. En Firebase → **Authentication** → **Settings** (Configuración) → **Authorized domains**: debe estar **sistemastsjavier.github.io** (o tu dominio).
2. En **[Google Cloud Console](https://console.cloud.google.com/)** cambia al proyecto **calendario-ts-ed5c4** (el que usa Firebase; en la barra superior selecciona el proyecto).
3. **APIs y servicios** → **Credenciales** → abre el **ID de cliente OAuth 2.0** de tipo "Aplicación web" que corresponde al Web client ID de Firebase.
4. En **"Orígenes JavaScript autorizados"** añade:
   - `https://sistemastsjavier.github.io`
   - `http://localhost` (para probar en local)
5. Guarda.

### Paso 4: Probar

1. Recarga la página del calendario (F5 o Ctrl+F5).
2. Inicia sesión con Google.  
   Si todo está bien, ya no debería aparecer el error y podrás reservar y ver "Reservas compartidas (nube)".

---

**Resumen:** El Client ID `489487806580-...` es de otro proyecto. Usa el **Web client ID** que muestra Firebase en Authentication → Google → Web SDK configuration y ponlo en **config.js** como **TACTICAL_SUPPORT_GOOGLE_CLIENT_ID**.

---

## Si en config.js ya tienes 809581021929-... pero el error sigue mostrando 489487806580

Significa que el navegador (o el servidor) está usando una **versión antigua** del Client ID.

1. **Pruebas en local**
   - Recarga forzada: **Ctrl+Shift+R** (o Cmd+Shift+R en Mac).
   - O cierra la pestaña, abre de nuevo y carga la página.
   - Si usas "Live Server" o similar, asegúrate de abrir la carpeta donde está el `config.js` actualizado.
2. **Si la app está en GitHub Pages**
   - ¿Subiste el `config.js` actualizado? Haz `git add config.js`, `git commit`, `git push` y espera 1–2 minutos a que se redespliegue.
   - Luego abre la URL de GitHub Pages en **ventana de incógnito** (para evitar caché) y prueba de nuevo.
3. **Comprobar qué Client ID se carga**
   - Abre la consola (F12 → Consola). Si el código actual tiene la comprobación, verás un aviso si el Client ID no empieza por `809581021929`.
   - Comprueba que en **config.js** la línea `TACTICAL_SUPPORT_GOOGLE_CLIENT_ID` tenga exactamente el Web client ID de Firebase (Authentication → Google → Web SDK configuration).
