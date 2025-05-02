# 🐉 Dragon's Treasure Aulify Games – Documentación API y Frontend

## 🌐 Descripción General

**Dragon's Treasure** es un proyecto de videojuego desarrollado con **Unity**. Este repositorio contiene el servicio backend en **Node.js/Express** y un **frontend de administración/dashboard** en **React/Vite**.

El sistema ahora se integra con la plataforma **Aulify**, actuando como un **proxy** para la autenticación y ciertas operaciones (monedas, stickers), mientras maneja localmente las estadísticas específicas del juego (partidas, victorias, niveles, progreso).

> Este proyecto fue desarrollado con fines educativos 📚 y de aprendizaje práctico sobre integración backend-frontend, manejo de APIs externas y autenticación JWT.

---

## 🚀 Características Principales

### 🔧 API (Backend)

-   **Autenticación Proxy:** Utiliza la API de Aulify para el login (`/aulifyLogin`), valida credenciales externamente.
-   **Autenticación Propia (JWT):** Genera un token JWT propio (`token`) para proteger las rutas del backend local, adicional al token opaco de Aulify (`aulifyToken`).
-   **Proxy API Aulify:** Endpoints seguros (`/aulify/*`) que reenvían solicitudes a la API de Aulify (`/getCoins`, `/getLastSticker`) usando el token de Aulify.
-   **Gestión de Estadísticas Locales:**
    -   Seguimiento de historial de partidas individuales (`estadistica`).
    -   Contadores totales de victorias, derrotas y partidas en la tabla `usuario`.
    -   Sistema de niveles y progreso (XP) basado en victorias.
-   **Sincronización de Monedas:** Mantiene la columna `monedas` en la tabla `usuario` sincronizada con Aulify (actualiza en login y en `PUT /api/usuario/sync-coins`).
-   **Base de Datos:** Utiliza MySQL para almacenar datos de usuario y estadísticas del juego.

### 💎 Frontend (Dashboard)

-   **Login:** Interactúa con el endpoint `/aulifyLogin` del backend, almacena ambos tokens (propio y de Aulify) en `localStorage`.
-   **Visualización de Datos:**
    -   Muestra información del perfil (gamertag, nivel, progreso XP).
    -   Presenta saldo de monedas y último sticker obtenido (llamando a los endpoints proxy `/aulify/*`).
    -   Muestra historial de partidas recientes, leaderboard y gráfica de tiempo jugado (llamando a `/estadistica/*`).
    -   Pestaña de "Estadísticas Detalladas" con resumen general, gráficas de winrate y actividad diaria (llamando a `/estadistica/user-summary`).
-   **Sincronización Automática:** Actualiza datos y sincroniza monedas locales con Aulify cuando la ventana recupera el foco.
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
3.  Ejecuta el script `DragonsTreasureDB.sql` contenido en este repositorio para crear las tablas (`usuario`, `estadistica`, etc.) con la estructura correcta.

### 🔙 Backend (API)

1.  (Desde la raíz del proyecto `dragons-treasure`) Instala dependencias:

    ```bash
    npm install
    ```

2.  Crea un archivo `.env` en la raíz del proyecto con tus variables de entorno:

    ```dotenv
    # Server Port
    PORT=3000

    # Database Connection (Asegúrate que coincida con tu setup)
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_de_mysql
    DB_PORT=3306
    DB_NAME=dragons_treasure_db # El nombre que usaste al crear la BD

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

**Prefijo Base:** `http://localhost:3000` (o el puerto que definas)

**Autenticación:**

-   `POST /aulifyLogin`
    -   **Descripción:** Autentica al usuario contra la API de Aulify.
    -   **Body:** `{ "email": "user@example.com", "password": "1234" }`
    -   **Respuesta Exitosa (200 OK):** `{ "success": true, "message": "Login successful", "token": "nuestro_jwt", "aulifyToken": "token_de_aulify", "user": { ...datos del usuario local incluyendo monedas... } }`
    -   **Respuesta Error (401, 400, etc.):** `{ "success": false, "message": "Mensaje de error" }`

**Rutas Protegidas (Requieren `Authorization: Bearer <nuestro_jwt>`)**

### Estadísticas (`/estadistica`)

-   `POST /record-game`
    -   **Descripción:** Registra el resultado de una partida (victoria o derrota).
    -   **Body:** `{ "outcome": "victory" | "defeat", "durationSeconds": 125 }`
    -   **Respuesta (200 OK):** `{ "message": "Partida registrada...", ...datos actualizados nivel/progreso... }`
-   `GET /ultimas-partidas`
    -   **Descripción:** Devuelve las últimas 5 partidas del usuario.
-   `GET /leaderboard`
    -   **Descripción:** Devuelve el Top 5 de usuarios por victorias.
-   `GET /tiempo-jugado`
    -   **Descripción:** Devuelve el tiempo total jugado por día en los últimos 7 días.
-   `GET /user-summary`
    -   **Descripción:** Devuelve un resumen completo de estadísticas del usuario para la pestaña "Estadísticas Detalladas".

### Proxy Aulify (`/aulify`)

*(Requieren también `X-Aulify-Token: <token_de_aulify>` en los headers)*

-   `GET /coins`
    -   **Descripción:** Obtiene el saldo actual de monedas desde Aulify.
    -   **Respuesta:** `{ "coins": 123 }`
-   `GET /last-sticker`
    -   **Descripción:** Obtiene el último sticker desbloqueado desde Aulify.
    -   **Respuesta:** `{ "sticker": { ...datos del sticker... } }` o `{ "sticker": null }` si no hay.

### Usuario (`/api`)

*(Requieren `Authorization: Bearer <nuestro_jwt>`)*
*(Requieren también `X-Aulify-Token: <token_de_aulify>` en los headers)*

-   `PUT /usuario/sync-coins`
    -   **Descripción:** Fuerza la sincronización del saldo de monedas local con el de Aulify.
    -   **Respuesta (200 OK):** `{ "message": "Monedas sincronizadas...", "coins": 123 }`

---

## 🏗️ Arquitectura

El backend se organiza modularmente:

-   📁 **routes:** Definición de endpoints y asociación con controladores/middleware.
-   🧠 **controllers:** Lógica de negocio, interacción con la base de datos y llamadas a APIs externas (Aulify) usando `axios`.
-   🛡️ **middleware:** Autenticación (verificación de JWT propio con `jsonwebtoken`), logging.
-   🔧 **helpers:** Configuración y gestión de la conexión a MySQL (`mysql2`).

---

## 🔄 Integración

-   🕹️ **Cliente de juego Unity:** Puede consumir los endpoints del backend local para registrar partidas (`/estadistica/record-game`) y potencialmente obtener datos del usuario.
-   🔗 **API Externa (Aulify):** El backend actúa como intermediario para autenticación y obtención de datos específicos (monedas, stickers).
-   🖼️ **Frontend (Dashboard):** Interactúa exclusivamente con el backend local.

---

## 🛡️ Seguridad

-   ✅ **Autenticación JWT:** Rutas sensibles protegidas por un token JWT propio generado por el backend.
-   🔒 **Tokens Separados:** Manejo diferenciado del token JWT propio y el token opaco de Aulify.
-   🔐 **Variables de Entorno:** Datos sensibles (claves API, secretos JWT, credenciales DB) gestionados mediante variables de entorno (`dotenv`).
-   🛡️ **CORS:** Configuración para permitir solicitudes solo desde el origen del frontend especificado.

---

## 📁 Estructura del Proyecto (Simplificada)

```
/ (Raíz del Proyecto)
│── controllers/         # Lógica principal (auth, estadistica, usuario)
│── middleware/          # Middlewares (verifyTokenPresence)
│── routes/              # Definición de rutas (auth, estadistica, usuario, aulify)
│── helpers/             # Conexión DB (mysql-config)
│── Backend/             # Contiene controladores/rutas específicos del proxy Aulify
│   ├── controllers/
│   │   └── aulify.controller.js
│   └── middleware/      # (Podría estar vacío ahora si todo se movió)
│       └── verifyTokenPresence.js # (Duplicado? Verificar si se usa este o el de la raíz)
│── Front/               # Código fuente del Dashboard React
│   └── dragons-treasure/
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/       # Dashboard.jsx, Login.jsx
│           ├── contexts/    # ThemeContext
│           ├── assets/
│           └── ...
│── docs/                # Documentación adicional
│── node_modules/
│── .env                 # Variables de entorno (¡NO SUBIR A GIT!)
│── .gitignore
│── DragonsTreasureDB.sql # Script SQL para crear la BD
│── index.js             # Punto de entrada del servidor Backend
│── package.json
│── package-lock.json
└── README.md            # Este archivo
```

*Nota: La estructura puede variar ligeramente. Revisa la sección sobre `Backend/` vs. las carpetas raíz.* 

---

## 📌 Nota

Este proyecto forma parte del desarrollo del juego **Dragon's Treasure** 🐉 y fue construido con propósitos educativos para Aulify.
