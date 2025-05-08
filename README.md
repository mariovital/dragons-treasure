# 🐉 Dragon's Treasure Aulify Games – Documentación API y Frontend

## 🌐 Descripción General

**Dragon's Treasure** es un proyecto de videojuego desarrollado con **Unity**. Este repositorio contiene el servicio backend en **Node.js/Express** y un **frontend de administración/dashboard** en **React/Vite**.

El sistema ahora se integra con la plataforma **Aulify**, actuando como un **proxy** para la autenticación y ciertas operaciones (monedas, stickers), mientras maneja localmente las estadísticas específicas del juego (partidas, victorias, niveles, progreso) y preferencias de usuario como el avatar.

> Este proyecto fue desarrollado con fines educativos 📚 y de aprendizaje práctico sobre integración backend-frontend, manejo de APIs externas, autenticación JWT y persistencia de datos de usuario.

---

## 🚀 Características Principales

### 🔧 API (Backend)

-   **Autenticación Proxy:** Utiliza la API de Aulify para el login (`/aulifyLogin`), valida credenciales externamente.
-   **Autenticación Propia (JWT):** Genera un token JWT propio (`token`) para proteger las rutas del backend local.
-   **Proxy API Aulify:** Endpoints seguros (`/aulify/*`) que reenvían solicitudes a la API de Aulify (`/getCoins`, `/getLastSticker`).
-   **Gestión de Estadísticas Locales:**
    -   Seguimiento de historial de partidas individuales (`estadistica`).
    -   Contadores totales de victorias, derrotas y partidas en la tabla `usuario`.
    -   Sistema de niveles y progreso (XP) basado en victorias.
-   **Sincronización de Monedas:** Mantiene la columna `monedas` en la tabla `usuario` sincronizada con Aulify.
-   **Gestión de Preferencias de Usuario:**
    -   Almacena y recupera el `avatar_sticker_id` preferido por el usuario.
-   **Funcionalidades de Administrador:**
    -   Endpoint para obtener un resumen de estadísticas de la plataforma.
    -   Endpoint para listar todos los usuarios (paginado).
    -   Endpoint para obtener estadísticas detalladas de un usuario específico.
-   **Base de Datos:** Utiliza MySQL para almacenar datos de usuario, estadísticas del juego y preferencias.

### 💎 Frontend (Dashboard & Admin Dashboard)

-   **Login:** Interactúa con el endpoint `/aulifyLogin`, almacena tokens y datos de usuario (incluyendo `avatar_sticker_id`).
-   **Dashboard de Usuario:**
    -   Visualización de datos del perfil (gamertag, nivel, progreso XP).
    -   **Selección de Avatar:** Permite al usuario elegir un avatar de perfil entre los stickers desbloqueados, con persistencia en el backend.
    -   Muestra saldo de monedas y último sticker obtenido (desde Aulify vía proxy).
    -   Muestra historial de partidas recientes, leaderboard y gráfica de tiempo jugado.
    -   Pestaña de "Estadísticas Detalladas" con resumen completo y gráficas.
-   **Admin Dashboard (`/admin`):
    -   Muestra un resumen de estadísticas de la plataforma (total usuarios, partidas, etc.).
    -   Tabla paginada de todos los usuarios registrados.
    -   **Modal de Detalles de Usuario:** Al hacer clic en un usuario, muestra sus estadísticas detalladas (perfil, rendimiento, gráficas, historial) de forma similar al dashboard de usuario.
-   **Sincronización Automática:** Actualiza datos y sincroniza monedas al recuperar el foco.
-   **Interfaz Moderna:** Estilo *glassmorphism*, modo claro/oscuro, responsiva.

---

## 🛠️ Instalación

### 📦 Requisitos Previos

-   [Node.js](https://nodejs.org/) (v18+ recomendado)
-   [MySQL](https://www.mysql.com/) (servidor activo)
-   Un cliente de Base de Datos (Dbeaver, MySQL Workbench, etc.)

### 🐱‍💻 Clona el repositorio

```bash
git clone https://github.com/mariovital/dragons-treasure.git
cd dragons-treasure
```

### 💾 Base de Datos

1.  Conéctate a tu servidor MySQL usando tu cliente de BD.
2.  Crea una nueva base de datos (ej: `dragons_treasure_db`).
3.  Ejecuta el script `DragonsTreasureDB.sql` contenido en este repositorio. **Asegúrate que el script incluya la columna `avatar_sticker_id` (INTEGER, NULLABLE) en la tabla `usuario`.**

### 🔙 Backend (API)

1.  (Desde la raíz del proyecto `dragons-treasure`) Instala dependencias:

    ```bash
    npm install
    ```

2.  Crea un archivo `.env` en la raíz del proyecto con tus variables de entorno:

    ```dotenv
    # Server Port
    PORT=3000

    # Database Connection
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_de_mysql
    DB_PORT=3306
    DB_NAME=dragons_treasure_db

    # API Keys & Secrets
    AULIFY_API_KEY=tu_api_key_de_aulify # ¡Obligatoria para login y proxy!
    BACKEND_JWT_SECRET=un_secreto_muy_largo_y_seguro_para_firmar_tus_tokens # ¡Obligatorio!

    # Frontend URL (para CORS)
    FRONTEND_URL=http://localhost:5173
    ```

3.  Ejecuta el servidor backend:

    ```bash
    node index.js
    # O si tienes nodemon: npm run dev
    ```

### 🖼️ Frontend (Dashboard)

1.  Abre una **nueva terminal**.
2.  Ve a la carpeta del frontend:

    ```bash
    cd Front/dragons-treasure
    ```

3.  Instala dependencias:

    ```bash
    npm install
    ```

4.  Ejecuta el servidor de desarrollo:

    ```bash
    npm run dev
    ```

5.  Abre tu navegador en la dirección que indique Vite (usualmente `http://localhost:5173`).

---

## 🔌 Endpoints Principales de la API (Backend Local)

**Prefijo Base:** `http://localhost:3000` (o la URL de despliegue, ej: `https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com`)

**Autenticación:**

-   `POST /aulifyLogin`
    -   **Descripción:** Autentica al usuario contra Aulify, crea/actualiza el usuario local y devuelve tokens.
    -   **Body:** `{ "email": "user@example.com", "password": "1234" }`
    -   **Headers (Request):** `X-Api-Key: <tu_api_key_de_aulify>`
    -   **Respuesta Exitosa (200 OK):** `{ "success": true, ..., "user": { ..., "avatar_sticker_id": ID_o_null } }`

**Rutas Protegidas (Requieren `Authorization: Bearer <nuestro_jwt>`)**

### Estadísticas (`/estadistica`)

-   `POST /record-game`
    -   **Descripción:** Registra el resultado de una partida.
    -   **Body:** `{ "outcome": "victory" | "defeat", "durationSeconds": 125 }`
-   `GET /ultimas-partidas`
-   `GET /leaderboard`
-   `GET /tiempo-jugado`
-   `GET /user-summary`

### Proxy Aulify (`/aulify`)

*(Requieren también `X-Aulify-Token: <token_de_aulify>` en los headers de la solicitud a nuestro backend)*

-   `GET /coins`
-   `GET /last-sticker`

### Usuario (`/api`)

-   `PUT /usuario/sync-coins`
    -   **Descripción:** Sincroniza monedas con Aulify. *(Requiere `X-Aulify-Token`)*
-   `PUT /avatar`
    -   **Descripción:** Actualiza la preferencia de avatar del usuario.
    -   **Body:** `{ "stickerId": ID_DEL_STICKER_O_NULL }`
    -   **Respuesta (200 OK):** `{ "success": true, "message": "Preferencia actualizada", "newStickerId": ID_o_null }`

### Administrador (`/admin`)

*(Requieren que el JWT del usuario tenga rol de 'admin')*

-   `GET /stats/summary`
    -   **Descripción:** Obtiene un resumen de estadísticas de la plataforma.
-   `GET /users`
    -   **Descripción:** Lista todos los usuarios (paginado, ej. `/users?page=1&limit=10`).
-   `GET /user-stats/:userId`
    -   **Descripción:** Obtiene estadísticas detalladas para un usuario específico.

### 🎮 Endpoints para Cliente Unity

El cliente de juego desarrollado en Unity interactúa principalmente con los siguientes dos endpoints del backend para la autenticación y el registro de partidas. A continuación, se detalla la configuración esperada para cada uno:

#### 1. Autenticación del Jugador

*   **Endpoint:** `POST [Prefijo_Base]/aulifyLogin`
    *   Reemplazar `[Prefijo_Base]` con la URL de tu backend (ej. `http://localhost:3000` o la URL de producción).
*   **Propósito:**
    1.  Autenticar las credenciales del jugador (`email`, `password`) contra la API de Aulify.
    2.  Si la autenticación con Aulify es exitosa, el backend crea o actualiza el registro del usuario en la base de datos local.
    3.  Generar y devolver un token JWT específico de Dragon's Treasure (`backendToken`) que Unity deberá usar para las solicitudes subsecuentes a las rutas protegidas del juego (como registrar partidas).
    4.  Devolver también el `aulifyToken` para que el backend pueda hacer llamadas proxy a Aulify si fuera necesario en nombre del usuario (aunque esto es menos común directamente desde Unity para los endpoints que usa).
*   **Headers Requeridos (desde Unity):**
    *   `X-Api-Key`: `tu_api_key_de_aulify` (La misma API key que usa el backend para comunicarse con Aulify).
    *   `Content-Type`: `application/json`
*   **Body (JSON desde Unity):**
    ```json
    {
      "email": "correo_del_usuario@ejemplo.com",
      "password": "la_contraseña_del_usuario"
    }
    ```
*   **Respuesta Exitosa Clave (desde el Backend a Unity):**
    Un objeto JSON que incluye:
    *   `success: true`
    *   `token`: El JWT del backend de Dragon's Treasure (este es el que Unity debe almacenar y usar para `record-game`).
    *   `aulifyToken`: El token de Aulify.
    *   `user`: Un objeto con información del usuario, incluyendo `id`, `gamertag`, `nivel`, `progreso`, `avatar_sticker_id`, etc.

#### 2. Registro de Resultado de Partida

*   **Endpoint:** `POST [Prefijo_Base]/estadistica/record-game`
    *   Reemplazar `[Prefijo_Base]` con la URL de tu backend.
*   **Propósito:**
    1.  Registrar el resultado (victoria o derrota) y la duración de una partida jugada en Unity.
    2.  El backend actualizará las estadísticas del jugador (total de victorias/derrotas, partidas jugadas) y su progreso de nivel.
*   **Headers Requeridos (desde Unity):**
    *   `Authorization`: `Bearer <tu_token_jwt_obtenido_del_login>` (El `token` recibido del endpoint `/aulifyLogin`).
    *   `Content-Type`: `application/json`
*   **Body (JSON desde Unity):**
    ```json
    {
      "outcome": "victory", // o "defeat"
      "durationSeconds": 125 // Duración de la partida en segundos (número entero)
    }
    ```
*   **Respuesta Exitosa Clave (desde el Backend a Unity):**
    Un objeto JSON que incluye:
    *   `success: true`
    *   `message`: "Partida registrada y progreso actualizado."
    *   `levelInfo`: Objeto con `nivel` y `progreso` actualizados del jugador.

#### Diagnóstico de Problemas (Troubleshooting) desde Unity

Si los datos de Unity no parecen llegar correctamente a la base de datos, considera los siguientes puntos de revisión en tu cliente de Unity y en la configuración del backend:

1.  **URL del Endpoint en Unity:**
    *   Verifica que Unity esté apuntando exactamente a la URL correcta del backend desplegado (ej. `https://tu-api.com/aulifyLogin`) o de desarrollo (`http://localhost:3000/aulifyLogin`). Un error común es una `/` extra o faltante, o un error tipográfico.

2.  **Headers de la Solicitud desde Unity:**
    *   **`POST /aulifyLogin`**:
        *   Asegúrate de que el header `X-Api-Key` se esté enviando con el valor correcto de tu Aulify API Key.
        *   Asegúrate de que el header `Content-Type` esté configurado como `application/json`.
    *   **`POST /estadistica/record-game`**:
        *   Asegúrate de que el header `Authorization` se esté enviando con el formato `Bearer <JWT_TOKEN>`, donde `<JWT_TOKEN>` es el token (`token`) obtenido de la respuesta del login.
        *   Verifica que el token JWT no haya expirado y sea válido.
        *   Asegúrate de que el header `Content-Type` esté configurado como `application/json`.

3.  **Formato y Contenido del Body JSON (desde Unity):**
    *   Confirma que el cuerpo de la solicitud POST esté correctamente formateado como JSON.
    *   Verifica que los nombres de los campos (claves) en el JSON coincidan exactamente con lo que espera el backend (ej. `email`, `password`, `outcome`, `durationSeconds`).
    *   Asegúrate de que los tipos de datos sean los correctos (ej. `durationSeconds` debe ser un número).

4.  **Manejo de Errores y Logs en Unity:**
    *   Implementa un manejo robusto de errores en el código C# de Unity que realiza las llamadas HTTP.
    *   Revisa la consola de Unity para cualquier mensaje de error relacionado con las solicitudes de red (ej. errores de conexión, timeouts, códigos de estado HTTP como 400, 401, 403, 404, 500).
    *   Loguea la respuesta completa del servidor en la consola de Unity para entender qué está devolviendo el backend.

5.  **Logs del Servidor Backend:**
    *   Revisa los logs de tu servidor backend (Node.js/Express). Si las solicitudes llegan, los logs deberían mostrar el `req.body` y `req.headers` recibidos. Esto es crucial para ver si la información que envía Unity es la que el backend espera.
    *   Presta atención a cualquier error que el backend pueda estar registrando durante el procesamiento de la solicitud. (Revisa la sección "Análisis de los Controladores" en la conversación anterior para ver ejemplos de logs útiles).

6.  **Configuración de Red/CORS (para backend desplegado):**
    *   Si tu backend está desplegado (ej. en AWS Elastic Beanstalk, Vercel, etc.), asegúrate de que la configuración de CORS permita solicitudes del "origen" desde donde Unity podría estar haciendo las llamadas (aunque Unity no es un navegador, algunos gateways/proxies pueden imponer estas reglas).
    *   Verifica que no haya firewalls o configuraciones de red bloqueando las peticiones.

Para una guía más exhaustiva sobre la implementación de estos endpoints en Unity, incluyendo ejemplos de código C# y manejo de errores más detallado, puedes consultar el archivo `docs/Unity_Backend_Integration.md` si decides crearlo o expandirlo con esa información.

---

## 🏗️ Arquitectura

El backend se organiza modularmente:

-   📁 **routes:** Definición de endpoints y asociación con controladores/middleware.
-   🧠 **controllers:** Lógica de negocio, interacción con la base de datos y llamadas a APIs externas.
-   🛡️ **middleware:** Autenticación (verificación de JWT, verificación de rol de admin).
-   🔧 **helpers:** Configuración y gestión de la conexión a MySQL.

---

## 🔄 Integración

-   🕹️ **Cliente de juego Unity:** Consume `/aulifyLogin` y `/estadistica/record-game`. (Ver `docs/Unity_Backend_Integration.md`).
-   🔗 **API Externa (Aulify):** El backend actúa como intermediario.
-   🖼️ **Frontend (Dashboard React):** Interactúa con todos los endpoints relevantes del backend local.

---

## 🛡️ Seguridad

-   ✅ **Autenticación JWT:** Rutas sensibles protegidas.
-   🔒 **Tokens Separados:** Manejo diferenciado del token JWT propio y el de Aulify.
-   🔑 **Roles de Usuario:** Middleware para restringir acceso a rutas de administrador.
-   🔐 **Variables de Entorno:** Gestión de datos sensibles.
-   🛡️ **CORS:** Configuración para permitir solicitudes desde orígenes especificados.

---

## 📁 Estructura del Proyecto (Simplificada)

```
/ (Raíz del Proyecto)
│── controllers/         # auth.controller.js, estadistica.controller.js, usuario.controller.js, admin.controller.js
│── middleware/          # verifyTokenPresence.js, verifyAdminRole.js
│── routes/              # auth.routes.js, estadistica.routes.js, usuario.routes.js, aulify.routes.js, admin.routes.js
│── helpers/             # mysql-config.js
│── Front/               # Código fuente del Dashboard React
│   └── dragons-treasure/
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/       # Dashboard.jsx, Login.jsx, AdminDashboard.jsx
│           ├── contexts/
│           ├── assets/
│           └── ...
│── docs/                # Documentación (Unity_Backend_Integration.md)
│── .env                 # Variables de entorno
│── .gitignore
│── DragonsTreasureDB.sql # Script SQL (¡Debe estar actualizado!)
│── index.js             # Punto de entrada del servidor Backend
│── package.json
│── package-lock.json
└── README.md            # Este archivo
```

--- 

## 📌 Nota

Este proyecto forma parte del desarrollo del juego **Dragon's Treasure** 🐉 y fue construido con propósitos educativos para Aulify.
