# Si las reservas NO se comparten (cada quien ve solo lo suyo)

Sigue esta lista. En la app ahora verás un **mensaje bajo el calendario** que indica si estás en modo nube o local.

---

## 1. Todos deben abrir la MISMA URL

- Si una persona abre desde **archivo local** (doble clic en `index.html` → `file:///...`) y otra desde **GitHub Pages** (`https://...github.io/...`), no verán lo mismo.
- **Solución:** Que **todos** entren por la misma dirección, por ejemplo:  
  `https://sistemastsjavier.github.io/calendario-ts/`  
  (o la URL que te dé GitHub Pages). No mezclar con abrir el archivo desde el disco.

---

## 2. La versión online debe tener Firebase en config.js

- Si en GitHub tu `config.js` está vacío (o en `.gitignore`), la app en GitHub Pages no usará Firebase y cada uno verá solo su almacenamiento local.
- **Solución:**
  - No pongas `config.js` en `.gitignore`.
  - Asegúrate de que en el repositorio `config.js` tenga **`TACTICAL_SUPPORT_FIREBASE_CONFIG`** con `projectId`, `apiKey`, etc. (los mismos que en Firebase Console).
  - Después de subir los cambios, espera un minuto y recarga la página de GitHub Pages (F5 o Ctrl+F5).

---

## 3. Autorizar el dominio en Firebase

1. Entra en [Firebase Console](https://console.firebase.google.com/) → tu proyecto **calendario-ts-ed5c4**.
2. **Compilación** → **Authentication** → pestaña **Settings** (o **Configuración**).
3. Baja hasta **“Dominios autorizados”**.
4. Añade: **`sistemastsjavier.github.io`** (solo el dominio, sin `https://` ni `/calendario-ts`).
5. Guarda.

Sin este paso, Firebase puede bloquear la conexión desde tu sitio.

---

## 4. Revisar el mensaje bajo el calendario

En la página del calendario, justo debajo de los botones de mes y “Nueva reservación”, aparece uno de estos textos:

| Mensaje | Significado |
|--------|-------------|
| **Reservas compartidas (nube)** | Estás usando Firestore. Las reservas se ven en todos los que abran **esa misma URL**. |
| **Modo local** / **Solo local** | Esa copia de la app **no** está usando Firebase (falta config o estás en otra URL). |
| **No se pudo conectar a la nube** | Revisa reglas de Firestore y que el dominio esté en “Dominios autorizados” (paso 3). |

- Si ves **“Modo local”** en la URL de GitHub Pages → el `config.js` que se está cargando ahí no tiene Firebase (revisa el paso 2).
- Si ves **“Reservas compartidas (nube)”** y aun así otro dispositivo no ve las reservas → ese otro debe abrir **exactamente la misma URL** (paso 1).

---

## 5. Probar de nuevo

1. En **un** dispositivo: abre **solo** la URL de GitHub Pages, inicia sesión con Google y crea una reserva.
2. En **otro** dispositivo (o ventana de incógnito): abre **la misma URL** (sin iniciar sesión).
3. Deberías ver la misma reserva. Si ves “Reservas compartidas (nube)” en ambos, y uno no ve la reserva del otro, recarga (F5) y revisa que la URL sea idéntica.

Si sigue fallando, abre la consola del navegador (F12 → Consola) y revisa si hay errores en rojo al cargar la página o al guardar una reserva.
