# Especificación de Endpoints para Integración con Unity

Este documento detalla los endpoints de la API del backend (Node.js/Express) diseñados para ser consumidos por el cliente de Unity.

## Consideraciones Generales

*   **Base URL:** Una vez desplegado el backend en AWS, las URL comenzarán con `http://<tu_ip_o_dominio_aws>:<puerto>` (ej. 3000). Para pruebas locales: `http://localhost:3000`.
*   **Autenticación:**
    *   Todos los endpoints, excepto `/aulifyLogin`, requieren autenticación.
    *   Para endpoints de **nuestro backend** (ej. `/estadistica/*`, `/usuario/*`), Unity debe enviar el **token JWT generado por nuestro backend** (obtenido en el campo `token` de la respuesta de `/aulifyLogin`) en el encabezado: `Authorization: Bearer <nuestro_token_jwt>`.
    *   Para endpoints que actúan como **proxy a Aulify** (`/aulify/*`), Unity debe enviar **ambos tokens**: nuestro JWT en `Authorization: Bearer <nuestro_token_jwt>` Y el token original de Aulify (obtenido en el campo `aulifyToken` de la respuesta de `/aulifyLogin`) en un encabezado personalizado: `X-Aulify-Token: <token_original_de_aulify>`.
*   **Content-Type:** Para solicitudes `POST` y `PUT` que envían datos, Unity debe usar el encabezado `Content-Type: application/json`.
*   **Error Handling:** El backend debe devolver códigos de estado HTTP apropiados (ej. 200, 201, 400, 401, 404, 500) y, para errores (4xx, 5xx), un cuerpo JSON con un mensaje descriptivo: `{ "message": "Descripción del error" }`.

---

## Endpoints

### 1. Autenticación (Login vía Proxy Aulify)

*   **Método:** `POST`
*   **Ruta:** `/aulifyLogin`
*   **Descripción:** Autentica al usuario contra la API de Aulify. Devuelve **nuestro token JWT** (para autenticar futuras llamadas a nuestro backend), el **token original de Aulify** (para usar en llamadas a endpoints proxy de Aulify), y los datos básicos del usuario local.
*   **Request Body (JSON):**
    ```json
    {
      "email": "usuario@ejemplo.com",
      "password": "tu_contraseña"
    }
    ```
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJ...", // Nuestro token JWT para autenticar con nuestro backend
      "aulifyToken": "eyJhbGciOiJ...", // Token original de Aulify (para endpoints proxy)
      "user": {
        "id": 1, // ID de tu tabla usuario
        "email": "usuario@ejemplo.com",
        "name": "Nombre Alumno",
        "gamertag": "GamerTagUsuario",
        "nivel": 5,
        "progreso": 75,
        "total_victorias": 0, // Contador desde tabla usuario
        "total_derrotas": 0,
        "total_partidas": 0
        // TODO: Añadir "avatar_sticker_url"
      }
    }
    ```
*   **Backend:** Endpoint existente (`routes/auth.js`, `controllers/auth.controller.js`).

### 2. Obtener Datos del Usuario Actual

*   **Método:** `GET`
*   **Ruta:** `/usuario/me`
*   **Descripción:** Devuelve los detalles completos del usuario actualmente autenticado.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "name": "Nombre Alumno",
      "gamertag": "GamerTagUsuario",
      "nivel": 5,
      "progreso": 75,
      "total_victorias": 10,
      "total_derrotas": 5,
      "total_partidas": 15
      // TODO: Añadir "avatar_sticker_url"
    }
    ```
*   **Backend (Nuevo):**
    *   Aplicar middleware `verifyTokenPresence` (usando nuestro JWT).
    *   Obtener `userId` del token decodificado.
    *   Consultar la tabla `usuario` por `userId` y devolver los datos.

### 3. Registrar Resultado de Partida

*   **Método:** `POST`
*   **Ruta:** `/estadistica/record-game`
*   **Descripción:** **Endpoint principal para Unity.** Registra el final de una partida (victoria/derrota) y su duración. Calcula y actualiza los puntos (+10/-5), nivel, progreso y los contadores totales (`total_victorias`, `total_derrotas`, `total_partidas`) en la tabla `usuario`. Inserta un registro de la partida en la tabla `estadistica`.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Request Body (JSON):**
    ```json
    {
      "outcome": "victory", // o "defeat"
      "durationSeconds": 185 // Duración total de la partida en segundos
    }
    ```
*   **Respuesta Exitosa (JSON, Status 201):**
    ```json
    {
      "success": true,
      "message": "Partida registrada y progreso actualizado.",
      "levelInfo": { 
        "nivel": 6,
        "progreso": 10 
      } 
    }
    ```
*   **Backend:** Endpoint existente (`recordGameController`). Lógica:
    *   Obtener `userId` del token.
    *   Validar `outcome` y `durationSeconds`.
    *   Iniciar Transacción SQL.
    *   Leer datos actuales del usuario (`nivel`, `progreso`, totales) desde `usuario` (con `FOR UPDATE`).
    *   Calcular puntos y nuevo nivel/progreso.
    *   Determinar `idTipo` (1=victoria, 2=derrota).
    *   **INSERTAR** en `estadistica` (`idUsuario`, `idTipo`, `NOW()`, `SEC_TO_TIME(durationSeconds)`).
    *   **ACTUALIZAR** `usuario` con `nivel`, `progreso` y los incrementos en `total_victorias`, `total_derrotas`, `total_partidas`.
    *   Commit (o Rollback en caso de error).

### 4. Obtener Últimas Partidas (del Usuario Actual)

*   **Método:** `GET`
*   **Ruta:** `/estadistica/ultimas-partidas`
*   **Descripción:** Devuelve las últimas 5 partidas del usuario autenticado.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    [
      // Resultado de: SELECT idTipo, TIME_TO_SEC(duracion_partida) as time FROM estadistica WHERE idUsuario = ? ORDER BY fecha_hora DESC LIMIT 5
      { "outcome": "victory", "time": 185 }, // Mapeado desde idTipo=1
      { "outcome": "defeat", "time": 210 }, // Mapeado desde idTipo=2
      // ... hasta 5
    ]
    ```
*   **Backend:** Endpoint existente (`getUltimasPartidas`).

### 5. Obtener Leaderboard

*   **Método:** `GET`
*   **Ruta:** `/estadistica/leaderboard`
*   **Descripción:** Devuelve el Top 5 de usuarios basado en `total_victorias`.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    [
      // Resultado de: SELECT gamertag AS name, total_victorias AS victorias FROM usuario ORDER BY total_victorias DESC, id ASC LIMIT 5
      { "rank": 1, "name": "GamerTag1", "victorias": 50 }, 
      { "rank": 2, "name": "GamerTag2", "victorias": 45 },
      // ... hasta 5
    ]
    ```
*   **Backend:** Endpoint existente (`getLeaderboard`).

### 6. Obtener Tiempo Jugado (del Usuario Actual)

*   **Método:** `GET`
*   **Ruta:** `/estadistica/tiempo-jugado`
*   **Descripción:** Devuelve el tiempo total jugado por día (últimos 7 días) para el usuario autenticado.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    [
      // Resultado de: SELECT DATE(fecha_hora) as date, SUM(TIME_TO_SEC(duracion_partida)) as totalSeconds FROM estadistica WHERE idUsuario = ? AND fecha_hora >= CURDATE() - INTERVAL 6 DAY GROUP BY date ORDER BY date ASC
      { "date": "2025-05-01", "totalSeconds": 1800 },
      { "date": "2025-05-02", "totalSeconds": 3600 },
      // ... 7 días
    ]
    ```
*   **Backend:** Endpoint existente (`getTiempoJugado`).

### 7. Obtener Resumen de Estadísticas del Usuario

*   **Método:** `GET`
*   **Ruta:** `/estadistica/user-summary`
*   **Descripción:** Devuelve un resumen completo de estadísticas, perfil, historial reciente y datos para gráficas del usuario autenticado.
*   **Headers:** `Authorization: Bearer <nuestro_token_jwt>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "profile": {
        "gamertag": "GamerTagUsuario",
        "nivel": 5,
        "progreso": 75
      },
      "totals": {
        "victorias": 10,
        "derrotas": 5,
        "partidas": 15,
        "winRate": 66.7, // Calculado: (victorias / partidas) * 100
        "totalTimePlayedSeconds": 90000,
        "avgTimePerGameSeconds": 6000
      },
      "history": [
        { "date": "2025-05-02", "time": "00:20:00", "outcome": "victory" },
        { "date": "2025-05-02", "time": "00:06:40", "outcome": "victory" },
        // ... hasta 15
      ],
      "dailyActivity": [
        { "day": "sáb", "victorias": 1, "derrotas": 1 },
        { "day": "dom", "victorias": 1, "derrotas": 0 },
        // ... últimos 7 días
      ]
    }
    ```
*   **Backend:** Endpoint existente (`getUserSummary`).

### 8. Obtener Monedas (Proxy Aulify)

*   **Método:** `GET`
*   **Ruta:** `/aulify/coins`
*   **Descripción:** Obtiene la cantidad de monedas del usuario desde la API de Aulify.
*   **Headers:**
    *   `Authorization: Bearer <nuestro_token_jwt>`
    *   `X-Aulify-Token: <token_original_de_aulify>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "coins": 4727 
    }
    ```
*   **Backend:** Endpoint existente (`aulify.controller.js`).

### 9. Obtener Último Sticker (Proxy Aulify)

*   **Método:** `GET`
*   **Ruta:** `/aulify/last-sticker`
*   **Descripción:** Obtiene el último sticker conseguido por el usuario desde la API de Aulify.
*   **Headers:**
    *   `Authorization: Bearer <nuestro_token_jwt>`
    *   `X-Aulify-Token: <token_original_de_aulify>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "sticker": { // Puede ser null si no hay stickers
        "id": 12, 
        "name": "Nombre Sticker", 
        "description": "Descripción...", 
        "image": "https://url.del.sticker/imagen.png" 
      }
    }
    ```
*   **Backend:** Endpoint existente (`aulify.controller.js`).

---

## Resumen de Cambios/Nuevas Implementaciones en Backend (Reciente)

*   **Modificado:** `/aulifyLogin` devuelve nuestro JWT (`token`) y el de Aulify (`aulifyToken`).
*   **Modificado:** Middleware `verifyTokenPresence` verifica nuestro JWT y adjunta `req.userId`.
*   **Modificado:** Endpoints `/aulify/*` leen token de Aulify desde header `X-Aulify-Token`.
*   **Modificado:** `POST /estadistica/record-game` inserta en `estadistica` y actualiza contadores en `usuario`.
*   **Modificado:** Endpoints `GET /estadistica/*` usan `req.userId` (sin params) y la estructura de BD actualizada (totales en `usuario`, `idTipo` en `estadistica`).
*   **Nuevo:** `GET /estadistica/user-summary` para obtener el resumen completo.
*   **(Futuro):** Endpoint para seleccionar avatar (`avatar_sticker_url`).
*   **(Futuro):** Añadir `avatar_sticker_url` a respuestas de `/aulifyLogin` y `/usuario/me`.


</rewritten_file> 