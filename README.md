
# 🐉 Dragon's Treasure Aulify Games – Documentación API y Frontend

## 🌐 Descripción General

**Dragon's Treasure** es un proyecto de videojuego desarrollado con **Unity** y respaldado por un servicio backend en **Node.js** con **Express**. Este sistema incluye:

- 🎮 Una **API RESTful** para el manejo de estadísticas de jugador y autenticación.
- 🖥️ Un **frontend visual** tipo dashboard para visualizar datos de rendimiento.

> Este proyecto fue desarrollado con fines educativos 📚 y de aprendizaje práctico sobre integración backend-frontend con videojuegos.

---

## 🚀 Características Principales

### 🔧 API (Backend)

- 📊 Seguimiento de estadísticas de jugadores (victorias y derrotas)
- 🔐 Autenticación de usuarios basada en JWT
- 💾 Almacenamiento seguro en base de datos MySQL
- 🔌 Integración sencilla vía endpoints RESTful

### 💎 Frontend (Dashboard)

- 📈 Visualización en tiempo real de estadísticas
- 🌗 Soporte para modo claro/oscuro
- 🖼️ Interfaz moderna con estilo *glassmorphism*
- 💡 Interacción fluida y responsiva para escritorio y móvil

---

## 🛠️ Instalación

### 📦 Requisitos Previos

- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [MySQL](https://www.mysql.com/) (servidor activo)
- [Vite](https://vitejs.dev/) (instalado globalmente o por proyecto)

### 🐱‍💻 Clona el repositorio

```bash
git clone https://github.com/vitalagency/dragons-treasure.git
cd dragons-treasure
```

### 🔙 Backend (API)

1. Ve a la carpeta del backend:

```bash
cd backend
```

2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con tus variables (ejemplo):

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_clave
DB_NAME=dragons_treasure
JWT_SECRET=secreto_seguro
```

4. Ejecuta el servidor:

```bash
npm run dev
```

---

### 🖼️ Frontend (Dashboard)

1. Ve a la carpeta del frontend:

```bash
cd ../frontend
```

2. Instala dependencias:

```bash
npm install
```

3. (Opcional) Configura variables si es necesario (por ejemplo, API URL)

4. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

---

## 🔌 Endpoints Principales de la API

### 👤 Gestión de Usuarios

- `GET /usuario/:id` – Obtener información del usuario por ID
- `POST /usuario` – Crear o recuperar un usuario mediante su gamertag

### 📊 Estadísticas

- `GET /estadistica/:idUser` – Obtener estadísticas del jugador
- `POST /estadistica/victoria` – Registrar una victoria 🏆
- `POST /estadistica/derrota` – Registrar una derrota 💀

### 🧪 Testing

- `GET /test` – Verificar funcionamiento del servidor
- `POST /test-victory` – Probar registro de victoria (sin modificar la base de datos)

---

## 🏗️ Arquitectura

El backend se organiza modularmente en:

- 📁 **Rutas** – Definición de endpoints y métodos HTTP
- 🧠 **Controladores** – Lógica de negocio y conexión con la base de datos
- 🛡️ **Middleware** – Validación, autenticación y logging
- 🔧 **Helpers** – Funciones utilitarias y gestión de conexión a MySQL

---

## 🔄 Integración

Esta API y panel están diseñados para integrarse fácilmente con:

- 🕹️ **Cliente de juego Unity** vía solicitudes HTTP
- 🗃️ **Base de datos MySQL** para persistencia de datos
- 🖼️ **Frontend responsivo** para visualización de estadísticas del jugador

---

## 🛡️ Seguridad

El sistema implementa:

- ✅ Autenticación basada en tokens JWT
- 🔐 Variables de entorno para datos sensibles
- 🧹 Validación de entradas para evitar ataques por inyección

---

## 📁 Estructura del Proyecto

```
/backend
│── routes/
│── controllers/
│── middleware/
│── helpers/
│── database/
│── index.js
│── .env
│── package.json

/frontend
│── public/
│── src/
│   ├── components/
│   ├── views/
│   ├── App.jsx
│   ├── main.jsx
│── tailwind.config.js
│── vite.config.js
│── index.html
```

---

## 📌 Nota

Este proyecto forma parte del desarrollo del juego **Dragon's Treasure** 🐉 y fue construido con propósitos educativos para Aulify.
