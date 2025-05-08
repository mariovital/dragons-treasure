# Integración de Unity con Backend Dragons Treasure

Este documento detalla cómo el cliente de Unity debe interactuar con los endpoints del backend de Dragons Treasure para el login de usuarios y el registro de partidas.

**URL Base del Backend de Dragons Treasure:** `https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com`

## Flujo General para Unity

1.  **Paso 1: Login y Obtención del Token del Juego (Dragons Treasure JWT)**
    *   Al iniciar el juego o cuando el usuario necesite loguearse.
    *   Unity realiza UNA llamada `POST` al endpoint `/aulifyLogin` del backend de Dragons Treasure.
    *   El backend de Dragons Treasure maneja la comunicación con los servicios de Aulify, verifica al usuario, crea/actualiza el perfil del jugador en la base de datos local y genera un token JWT específico para Dragons Treasure.
    *   Este token JWT de Dragons Treasure es el que Unity debe usar para todas las interacciones subsecuentes con el backend de Dragons Treasure.

2.  **Paso 2: Registrar Resultado de Partida**
    *   Al finalizar cada partida en Unity.
    *   Unity realiza una llamada `POST` al endpoint `/estadistica/record-game` del backend de Dragons Treasure.
    *   Esta solicitud debe estar autenticada usando el token JWT de Dragons Treasure obtenido en el Paso 1.

---

## Detalles de los Endpoints para Unity

### 1. Endpoint: Login y Obtención del Token del Juego

Este endpoint maneja el login del usuario a través de Aulify y provee a Unity con un token de sesión específico para Dragons Treasure.

*   **Método HTTP:** `POST`
*   **URL:** `https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com/aulifyLogin`
*   **Headers Requeridos:**
    *   `Content-Type: application/json`
    *   `X-Api-Key: tec_api_KdZRQLUyMEJJHDqztZilqg`
        *   **Nota Importante:** Esta `X-Api-Key` es la que el backend de Dragons Treasure utiliza para autenticarse con los servicios externos de Aulify. El cliente de Unity **SÍ DEBE INCLUIR** esta cabecera en la solicitud a `/aulifyLogin` del backend de Dragons Treasure. Nuestro backend la tomará de la solicitud de Unity y la usará para llamar a Aulify.
*   **Cuerpo (Body) de la Solicitud (JSON):**
    ```json
    {
      "email": "email_del_jugador@ejemplo.com",
      "password": "password_del_jugador"
    }
    ```
*   **Respuesta Exitosa del Servidor (JSON) Detallada:**
    ```json
    {
      "success": true,
      "message": "Login exitoso y token JWT de Dragons Treasure generado.", // Mensaje descriptivo
      "token": "JWT_GENERADO_POR_DRAGONS_TREASURE", // <--- ESTE ES EL TOKEN QUE UNITY DEBE GUARDAR Y USAR
      "aulifyToken": "TOKEN_ORIGINAL_DE_AULIFY_SI_SE_DEVUELVE", // Token de Aulify (si el backend lo sigue devolviendo)
      "user": {
        "id": 123,                             // El ID interno del usuario en la BD de Dragons Treasure
        "email": "email_del_jugador@ejemplo.com",
        "name": "Nombre Completo del Jugador (de Aulify)",
        "gamertag": "GamertagDelJugador (generado o de Aulify)",
        "role": "user",                        // Rol del usuario (ej. "user", "admin")
        "nivel": 1,                           // Nivel actual del jugador en Dragons Treasure
        "progreso": 0,                        // Progreso (XP) en el nivel actual
        "monedas": 100,                       // Monedas actuales del jugador en Dragons Treasure (sincronizadas de Aulify al logearse)
        "avatar_sticker_id": null             // ID del sticker seleccionado como avatar (null si no hay preferencia o usa el default)
        // ... y cualquier otro dato relevante del usuario que el endpoint envíe.
      }
    }
    ```
*   **Manejo de Errores Posibles (Ejemplos):**
    *   `400 Bad Request`: (ej. `{"success": false, "message": "Email y password son requeridos."}`)
    *   `401 Unauthorized`: (ej. `{"success": false, "message": "Credenciales incorrectas en Aulify."}` o `{"success": false, "message": "X-Api-Key de Aulify es requerida."}` si el backend no la recibe de Unity)
    *   `500 Internal Server Error`: (ej. `{"success": false, "message": "Error en la configuración del servidor [Clave API Interna de Aulify Faltante]."}` o `{"success": false, "message": "Ocurrió un error interno durante el login."}`)
    *   `502 Bad Gateway`: (ej. `{"success": false, "message": "Error al comunicarse con el servicio de Aulify."}`)
*   **Acción en Unity:**
    *   Tras una respuesta exitosa (`"success": true`), guardar de forma segura el valor de `"token"` (el JWT de Dragons Treasure). Este token será necesario para otras llamadas.
    *   Opcionalmente, guardar los datos de `"user"` (especialmente `user.id`, `user.gamertag`, `user.nivel`, `user.progreso`, `user.monedas`, `user.avatar_sticker_id`) para la lógica del juego o para mostrar información en la UI. Si `avatar_sticker_id` es `null`, Unity debería usar un avatar por defecto.

### 2. Endpoint: Registrar Resultado de Partida

Este endpoint se utiliza para registrar el resultado (victoria/derrota) y la duración de una partida jugada en Unity. Actualiza los totales del jugador, su nivel y progreso.

*   **Método HTTP:** `POST`
*   **URL:** `https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com/estadistica/record-game`
*   **Headers Requeridos:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <JWT_GENERADO_POR_DRAGONS_TREASURE>`
        *   *(Utilizar el token JWT obtenido del endpoint `/aulifyLogin` de Dragons Treasure).*
*   **Cuerpo (Body) de la Solicitud (JSON):**
    ```json
    {
      "outcome": "victory",  // String: puede ser "victory" o "defeat"
      "durationSeconds": 180   // Número entero: duración de la partida en segundos (>= 0)
    }
    ```
*   **Respuesta Exitosa del Servidor (JSON):**
    ```json
    {
        "success": true,
        "message": "Partida registrada y progreso actualizado.",
        "levelInfo": { // Información actualizada del jugador tras la partida
            "nivel": 2,        // El nuevo nivel del jugador
            "progreso": 10     // El nuevo progreso (XP) del jugador en el nivel actual
        }
    }
    ```
*   **Manejo de Errores Posibles:**
    *   `400 Bad Request`: (ej. `{"message": "El campo \"outcome\" es inválido..."}` o `{"message": "El campo \"durationSeconds\" es inválido..."}`)
    *   `401 Unauthorized`: (ej. `{"message": "No token provided."}` o `{"message": "Invalid token."}` o `{"message": "Token expirado."}`) - Falta el token JWT, es inválido o ha expirado. Unity debería re-autenticar al usuario (Paso 1).
    *   `500 Internal Server Error`: Problema en el servidor al procesar la partida (ej. error de base de datos).
*   **Acción en Unity:**
    *   Si la solicitud es exitosa, se puede actualizar la UI del jugador con la nueva información de `levelInfo.nivel` y `levelInfo.progreso`.
    *   Manejar los errores adecuadamente (ej. si es 401, solicitar al usuario que vuelva a loguearse).

---

## Otros Endpoints Relevantes (No para uso directo de Unity)

El backend de Dragons Treasure expone otros endpoints que son utilizados por la aplicación web (Dashboard y Admin Dashboard) pero que generalmente no serían consumidos directamente por el cliente de Unity. Se listan aquí para referencia y entendimiento completo del sistema:

*   **`GET /estadistica/ultimas-partidas`**: Obtiene las últimas 5 partidas del usuario logueado.
*   **`GET /estadistica/leaderboard`**: Obtiene el top 5 de usuarios por victorias.
*   **`GET /estadistica/tiempo-jugado`**: Obtiene el tiempo jugado por el usuario en los últimos 7 días.
*   **`GET /estadistica/user-summary`**: Obtiene un resumen completo de las estadísticas del usuario logueado.
*   **`PUT /api/usuario/sync-coins`**: Sincroniza las monedas del usuario con Aulify (requiere token de Aulify).
*   **`PUT /api/avatar`**: (Usado por el Dashboard Web) Permite al usuario guardar su preferencia de sticker para el avatar. Recibe `{"stickerId": ID_DEL_STICKER_O_NULL}`. El cliente de Unity podría inferir el avatar a mostrar basado en el `avatar_sticker_id` recibido durante el login.
*   **Endpoints de Admin (`/admin/*`)**: Rutas para la administración de la plataforma, no relevantes para Unity.

---

## Notas Adicionales Importantes

*   **Seguridad del Token:** El token JWT de Dragons Treasure debe almacenarse de forma segura en el cliente de Unity (ej. usando `PlayerPrefs` de forma segura o alguna solución de almacenamiento encriptado si se manejan datos muy sensibles) y transmitirse únicamente sobre HTTPS.
*   **Expiración del Token:** Los tokens JWT tienen un tiempo de expiración configurado en el backend de Dragons Treasure (actualmente 8 horas). Unity debe estar preparado para manejar respuestas de error `401 Unauthorized` que indiquen que el token ha expirado, en cuyo caso el usuario deberá volver a realizar el Paso 1 de login para obtener un nuevo token.
*   **URL Base del Backend:** Siempre utilizar la URL base proporcionada (`https://ymqnqltlqg.execute-api.us-east-1.amazonaws.com`) para todas las llamadas.
*   **Comunicación con el Equipo de Backend:** Mantener una comunicación fluida con el equipo de backend de Dragons Treasure para cualquier cambio en los endpoints, formatos de respuesta, manejo de errores o para resolver dudas durante la integración.

Este documento debe proporcionar una guía clara para la integración del cliente de Unity con el backend de Dragons Treasure. 