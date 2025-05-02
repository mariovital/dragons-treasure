# Especificación de Endpoints para Integración con Unity

Este documento detalla los endpoints de la API del backend (Node.js/Express) diseñados para ser consumidos por el cliente de Unity.

## Consideraciones Generales

*   **Base URL:** Una vez desplegado el backend en AWS, las URL comenzarán con `http://<tu_ip_o_dominio_aws>:<puerto>` (ej. 3000). Para pruebas locales: `http://localhost:3000`.
*   **Autenticación:** Todos los endpoints, excepto `/aulifyLogin`, requieren que Unity envíe el `token` de Aulify (obtenido después del login) en el encabezado `Authorization` como `Bearer <token>`. El middleware `verifyTokenPresence` se encarga de validarlo.
*   **Content-Type:** Para solicitudes `POST` y `PUT` que envían datos, Unity debe usar el encabezado `Content-Type: application/json`.
*   **Error Handling:** El backend debe devolver códigos de estado HTTP apropiados (ej. 200, 201, 400, 401, 404, 500) y, para errores (4xx, 5xx), un cuerpo JSON con un mensaje descriptivo: `{ "message": "Descripción del error" }`.

---

## Endpoints

### 1. Autenticación (Login vía Proxy Aulify)

*   **Método:** `POST`
*   **Ruta:** `/aulifyLogin`
*   **Descripción:** Autentica al usuario contra la API de Aulify. Devuelve el token de Aulify y los datos básicos del usuario almacenados localmente.
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
      "token": "eyJhbGciOiJ...", // Token de Aulify para futuras requests
      "user": {
        "id": 1, // ID de tu tabla usuario
        "email": "usuario@ejemplo.com",
        "name": "Nombre Alumno", // Desde Aulify/DB local
        "gamertag": "GamerTagUsuario", // Desde DB local
        "nivel": 5, // Desde DB local
        "progreso": 75 // Desde DB local
        // TODO: Añadir "avatar_sticker_url" aquí cuando se implemente
      }
    }
    ```
*   **Backend:** Endpoint existente (`routes/auth.js`, `controllers/auth.controller.js`).

### 2. Obtener Datos del Usuario Actual

*   **Método:** `GET`
*   **Ruta:** `/usuario/me`
*   **Descripción:** Devuelve los detalles completos del usuario actualmente autenticado (basado en el token).
*   **Headers:** `Authorization: Bearer <token>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "name": "Nombre Alumno",
      "gamertag": "GamerTagUsuario",
      "nivel": 5,
      "progreso": 75
      // TODO: Añadir "avatar_sticker_url" aquí
    }
    ```
*   **Backend (Nuevo):**
    *   Aplicar middleware `verifyTokenPresence`.
    *   Obtener `idUsuario` a partir del token.
    *   Consultar la tabla `usuario` por `idUsuario` y devolver los datos.

### 3. Registrar Resultado de Partida

*   **Método:** `POST`
*   **Ruta:** `/estadistica/record-game`
*   **Descripción:** **Endpoint principal para Unity.** Registra el final de una partida (victoria/derrota) y su duración. **Calcula y actualiza los puntos de progreso (+10 victoria / -5 derrota), el nivel, las victorias/derrotas totales y el tiempo jugado del usuario.**
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body (JSON):**
    ```json
    {
      "outcome": "victory", // o "defeat"
      "durationSeconds": 185 // Duración total de la partida en segundos
    }
    ```
*   **Respuesta Exitosa (JSON, Status 200 o 201):**
    ```json
    {
      "success": true,
      "message": "Partida registrada y progreso actualizado.",
      // Opcional: devolver si hubo level up o cambio relevante
      "levelInfo": { 
        "nivel": 6,
        "progreso": 10 
      } 
    }
    ```
*   **Backend (Nuevo/Modificar):**
    *   Aplicar `verifyTokenPresence`.
    *   Obtener `idUsuario` del token.
    *   Validar `outcome` ("victory"/"defeat") y `durationSeconds` (número > 0).
    *   **Iniciar Transacción SQL.**
    *   Leer `nivel` y `progreso` actuales del usuario (`SELECT nivel, progreso FROM usuario WHERE id = ? FOR UPDATE`).
    *   Calcular puntos: `puntos = (outcome === 'victory') ? 10 : -5;`
    *   Calcular nuevo progreso: `progresoActualizado = progresoActual + puntos;` (Considerar si el progreso puede ser negativo o debe tener mínimo 0).
    *   **Lógica de Level Up:** Calcular `nuevoNivel` y `nuevoProgresoFinal` (puede implicar bucle si se suben varios niveles).
        *   Ejemplo simple: `nivelesSubidos = Math.floor(progresoActualizado / 100); nuevoNivel = nivelActual + nivelesSubidos; nuevoProgresoFinal = progresoActualizado % 100;` (Asegurar que `nuevoProgresoFinal` no sea negativo si `progresoActualizado` lo era).
    *   **Registrar Estadísticas:**
        *   **Opción Recomendada (Nueva tabla `partida`):** 
            1.  Crear tabla: `CREATE TABLE partida (id INT AUTO_INCREMENT PRIMARY KEY, idUsuario INT, fecha_hora DATETIME, duration_seconds INT, outcome ENUM('victory', 'defeat'), FOREIGN KEY (idUsuario) REFERENCES usuario(id));`
            2.  Insertar: `INSERT INTO partida (idUsuario, fecha_hora, duration_seconds, outcome) VALUES (?, NOW(), ?, ?);`
            3.  Actualizar totales en `usuario`: `UPDATE usuario SET nivel = ?, progreso = ?, victorias = victorias + (?), derrotas = derrotas + (?), partidas_totales = partidas_totales + 1 /*, acumular tiempo total si se desea */ WHERE id = ?;` (Pasar 1 a victorias si outcome='victory', 0 si no; y viceversa para derrotas).
        *   **Opción Alternativa (Modificando `estadistica`):** Actualizar la fila existente para el `idUsuario` en `estadistica`, incrementando contadores. *No recomendado si se necesita historial detallado.* Si se elige, actualizar también `nivel` y `progreso` en `usuario`. `UPDATE usuario SET nivel = ?, progreso = ? WHERE id = ?;`
    *   **Commit Transacción SQL.**
    *   En caso de error en cualquier paso, **Rollback Transacción SQL** y devolver error 500.
    *   Devolver respuesta JSON de éxito.

### 4. Obtener Últimas Partidas (del Usuario Actual)

*   **Método:** `GET`
*   **Ruta:** `/estadistica/ultimas-partidas`
*   **Descripción:** Devuelve las últimas 5 partidas del usuario autenticado.
*   **Headers:** `Authorization: Bearer <token>`
*   **Respuesta Exitosa (JSON, Status 200):**
    *   **Si se usa Opción B (tabla `partida`):**
        ```json
        [
          // Resultado de: SELECT outcome, duration_seconds as time FROM partida WHERE idUsuario = ? ORDER BY fecha_hora DESC LIMIT 5
          { "outcome": "victory", "time": 185 }, 
          { "outcome": "defeat", "time": 210 },
          // ... hasta 5
        ]
        ```
    *   **Si se usa Opción A (tabla `estadistica`):** Endpoint no factible para devolver partidas individuales. Se tendría que cambiar el propósito del endpoint o la estructura de la tabla.
*   **Backend (Modificar):**
    *   Adaptar ruta `/estadistica/ultimas-partidas/:idUsuario` (si existe) o crearla.
    *   Aplicar `verifyTokenPresence` y obtener `idUsuario` del token.
    *   Ejecutar la consulta SQL correspondiente a la Opción B (tabla `partida`).

### 5. Obtener Leaderboard

*   **Método:** `GET`
*   **Ruta:** `/estadistica/leaderboard`
*   **Descripción:** Devuelve el Top 5 de usuarios basado en victorias.
*   **Headers:** `Authorization: Bearer <token>` (Se requiere autenticación)
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    [
      { "rank": 1, "name": "GamerTag1", "victorias": 50 }, // Asegurarse que se usa 'victorias' si es el criterio
      { "rank": 2, "name": "GamerTag2", "victorias": 45 },
      // ... hasta 5
    ]
    ```
*   **Backend:** Endpoint existente. Verificar que la consulta SQL use `gamertag` y ordene por el criterio correcto (ej. `victorias` en la tabla `usuario` o `estadistica`).

### 6. Obtener Tiempo Jugado (del Usuario Actual)

*   **Método:** `GET`
*   **Ruta:** `/estadistica/tiempo-jugado`
*   **Descripción:** Devuelve el tiempo total jugado por día (últimos 7 días) para el usuario autenticado.
*   **Headers:** `Authorization: Bearer <token>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    [
      { "date": "2025-05-01", "totalSeconds": 1800 },
      { "date": "2025-05-02", "totalSeconds": 3600 },
      // ... 7 días
    ]
    ```
*   **Backend (Modificar):**
    *   Adaptar `/estadistica/tiempo-jugado/:idUsuario`.
    *   Obtener `idUsuario` del token.

### 7. Obtener Monedas (Proxy Aulify)

*   **Método:** `GET`
*   **Ruta:** `/aulify/coins`
*   **Descripción:** Obtiene la cantidad de monedas del usuario desde la API de Aulify.
*   **Headers:** `Authorization: Bearer <token>`
*   **Respuesta Exitosa (JSON, Status 200):**
    ```json
    {
      "coins": 4727 
    }
    ```
*   **Backend:** Endpoint existente.

### 8. Obtener Último Sticker (Proxy Aulify)

*   **Método:** `GET`
*   **Ruta:** `/aulify/last-sticker`
*   **Descripción:** Obtiene el último sticker conseguido por el usuario desde la API de Aulify.
*   **Headers:** `Authorization: Bearer <token>`
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
*   **Backend:** Endpoint existente.

---

## Resumen de Cambios/Nuevas Implementaciones en Backend

*   **Nuevo:** `GET /usuario/me` (Obtener datos del usuario logueado).
*   **Nuevo/Modificar:** `POST /estadistica/record-game` (Registrar resultado y duración, actualizar stats y nivel/progreso). **Requiere decisión sobre estructura de tabla `estadistica` vs. nueva tabla `partida`**.
*   **Modificar:** Adaptar `/estadistica/ultimas-partidas/:idUsuario` a `/estadistica/ultimas-partidas` (obtener ID de token). **SQL depende de estructura de tabla**.
*   **Modificar:** Adaptar `/estadistica/tiempo-jugado/:idUsuario` a `/estadistica/tiempo-jugado` (obtener ID de token).
*   **Modificar:** Asegurar que `/estadistica/leaderboard` use `gamertag` y ordene por el criterio correcto.
*   **(Futuro):** Añadir endpoint para guardar/actualizar `avatar_sticker_url` en tabla `usuario`.
*   **(Futuro):** Modificar endpoints que devuelven datos de usuario (`/aulifyLogin`, `/usuario/me`) para incluir `avatar_sticker_url`. 