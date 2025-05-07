# Integración de Unity con Backend Dragons Treasure

Este documento detalla cómo el cliente de Unity debe interactuar con los endpoints del backend de Dragons Treasure para el login de usuarios y el registro de partidas.

## Flujo General

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
*   **URL:** `https://<tu_url_base_del_backend_dragons_treasure>/aulifyLogin`
    *   *(Reemplazar `<tu_url_base_del_backend_dragons_treasure>` con la URL base real del API desplegada, ej: la URL de Elastic Beanstalk o API Gateway).*
*   **Headers Requeridos:**
    *   `Content-Type: application/json`
    *   `X-Api-Key: tec_api_KdZRQLUyMEJJHDqztZilqg` 
        *   *(Esta es la API Key que el backend de Dragons Treasure usa internamente para comunicarse con los servicios de Aulify. Unity debe incluirla en esta solicitud de login).*
*   **Cuerpo (Body) de la Solicitud (JSON):**
    ```json
    {
      "email": "email_del_jugador@ejemplo.com",
      "password": "password_del_jugador"
    }
    ```
*   **Respuesta Exitosa del Servidor (JSON):**
    ```json
    {
      "success": true,
      "token": "JWT_GENERADO_POR_DRAGONS_TREASURE", // <--- ESTE ES EL TOKEN QUE UNITY DEBE GUARDAR Y USAR
      "aulifyToken": "TOKEN_ORIGINAL_DE_AULIFY",   // Para referencia o uso futuro si es necesario.
      "user": {
        "id": 123,                             // El ID interno del usuario en la BD de Dragons Treasure
        "email": "email_del_jugador@ejemplo.com",
        "name": "Nombre Completo del Jugador",
        "gamertag": "GamertagDelJugador",
        "role": "user",                        // Rol del usuario (ej. "user", "admin")
        "nivel": 1,
        "progreso": 0,
        "monedas": 100
        // ... y cualquier otro dato del usuario que el endpoint envíe.
      }
    }
    ```
*   **Manejo de Errores Posibles:**
    *   `400 Bad Request`: (ej. `{"success": false, "message": "Email and password are required"}`) - Faltan email o password.
    *   `401 Unauthorized`: (ej. `{"success": false, "message": "Correo o contraseña incorrectos"}`) - Credenciales inválidas en Aulify.
    *   `500 Internal Server Error`: (ej. `{"success": false, "message": "Server configuration error [API Key Missing]"}` o `{"success": false, "message": "An internal server error occurred during login."}`) - Problema en el servidor.
*   **Acción en Unity:**
    *   Tras una respuesta exitosa (`"success": true`), guardar de forma segura el valor de `"token"` (el JWT de Dragons Treasure). Este token será necesario para otras llamadas.
    *   Opcionalmente, guardar los datos de `"user"` (especialmente `user.id`) si son útiles para la lógica del juego o para mostrar información en la UI.

### 2. Endpoint: Registrar Resultado de Partida

Este endpoint se utiliza para registrar el resultado (victoria/derrota) y la duración de una partida jugada en Unity.

*   **Método HTTP:** `POST`
*   **URL:** `https://<tu_url_base_del_backend_dragons_treasure>/estadistica/record-game`
*   **Headers Requeridos:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <JWT_GENERADO_POR_DRAGONS_TREASURE>` 
        *   *(Utilizar el token JWT obtenido del endpoint `/aulifyLogin` de Dragons Treasure).*
*   **Cuerpo (Body) de la Solicitud (JSON):**
    ```json
    {
      "outcome": "victory",  // String: puede ser "victory" o "defeat"
      "durationSeconds": 180   // Número entero: duración de la partida en segundos
    }
    ```
*   **Respuesta Exitosa del Servidor (JSON):**
    ```json
    {
        "success": true,
        "message": "Partida registrada y progreso actualizado.",
        "levelInfo": {
            "nivel": 2,        // El nuevo nivel del jugador tras la partida
            "progreso": 10     // El nuevo progreso del jugador en el nivel actual
        }
    }
    ```
*   **Manejo de Errores Posibles:**
    *   `400 Bad Request`: (ej. `{"message": "El campo \"outcome\" es inválido..."}` o `{"message": "El campo \"durationSeconds\" es inválido..."}`) - Datos de entrada incorrectos.
    *   `401 Unauthorized`: (ej. `{"message": "No token provided."}` o `{"message": "Invalid token."}`) - Falta el token JWT, es inválido o ha expirado. Unity debería re-autenticar al usuario (Paso 1).
    *   `500 Internal Server Error`: Problema en el servidor al procesar la partida.
*   **Acción en Unity:**
    *   Si la solicitud es exitosa, se puede actualizar la UI del jugador con la nueva información de nivel y progreso si es relevante.
    *   Manejar los errores adecuadamente (ej. si es 401, solicitar al usuario que vuelva a loguearse).

---

## Notas Adicionales

*   **Seguridad del Token:** El token JWT de Dragons Treasure debe almacenarse de forma segura en el cliente de Unity y transmitirse únicamente sobre HTTPS.
*   **Expiración del Token:** Los tokens JWT tienen un tiempo de expiración (configurado en el backend de Dragons Treasure, actualmente 8 horas). Unity debe estar preparado para manejar respuestas de error `401 Unauthorized` que indiquen que el token ha expirado, en cuyo caso el usuario deberá volver a realizar el Paso 1 de login.
*   **Comunicación con el Equipo de Backend:** Mantener una comunicación fluida con el equipo de backend para cualquier cambio en los endpoints, formatos de respuesta o manejo de errores.

Este documento debe proporcionar una guía clara para la integración. 