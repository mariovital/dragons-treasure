// Asumiendo que ya tienes la importación de 'pool'
import { pool } from '../helpers/mysql-config.js';

// Obtener todos los Usuarios
const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuaros:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
const getUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]); // Añadido para devolver el usuario encontrado

  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Añadir nueva función para buscar usuario por email
const getUsuarioPorEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`Buscando usuario con email: ${email}`);
    
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    res.status(500).json({ error: 'Error al obtener el usuario por email' });
  }
};

/**
 * Busca un usuario por email. Si no existe, lo crea.
 * @param {string} email - El email del usuario a buscar o crear.
 * @returns {Promise<object>} - Promesa que resuelve con el objeto del usuario encontrado o creado.
 * @throws {Error} - Lanza un error si ocurre un problema con la base de datos.
 */
const findOrCreateUser = async (email) => {
  if (!email) {
    throw new Error('El email es requerido para buscar o crear un usuario.');
  }

  try {
    // 1. Buscar si el usuario ya existe
    const [existingUsers] = await pool.query('SELECT id, email FROM usuario WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      console.log(`Usuario encontrado en DB local: ${email}`);
      return existingUsers[0]; // Devuelve el usuario existente
    } else {
      // 2. Si no existe, crearlo (solo con el email, gamertag será NULL por defecto)
      console.log(`Usuario no encontrado, creando nuevo usuario en DB local: ${email}`);
      const [result] = await pool.query('INSERT INTO usuario (email) VALUES (?)', [email]);

      if (result.insertId) {
        // Devolver el usuario recién creado (podríamos hacer otra consulta o construir el objeto)
        console.log(`Nuevo usuario creado con ID: ${result.insertId}`);
        return { id: result.insertId, email: email}; // Devuelve el nuevo usuario
      } else {
        throw new Error('No se pudo crear el usuario en la base de datos.');
      }
    }
  } catch (error) {
    console.error(`Error en findOrCreateUser para email ${email}:`, error);
    // Re-lanzamos el error para que sea manejado por el controlador que llama (login.controller)
    throw new Error('Error al interactuar con la base de datos de usuarios.');
  }
};

/**
 * Obtiene los detalles del usuario actualmente autenticado.
 * Utiliza req.user.userId que fue añadido por el middleware verifyJWT.
 */
const getCurrentUser = async (req, res) => {
  // DEBUG: Verifica el usuario adjuntado por el middleware
  console.log('>>> DEBUG: req.user recibido en getCurrentUser:', req.user);

  if (!req.user || !req.user.userId) {
    console.error('Error en getCurrentUser: req.user o req.user.userId no definidos.');
    return res.status(401).json({ error: 'No autorizado o información de usuario no disponible en el token.' });
  }

  const userId = req.user.userId;
  // DEBUG: Verifica el ID que se usará para la consulta
  console.log(`>>> DEBUG: ID de usuario a buscar en DB:', ${userId}`);

  console.log(`getCurrentUser: Buscando detalles para el usuario ID ${userId} (obtenido del token)`);

  try {
    const [users] = await pool.query('SELECT * FROM usuario WHERE id = ?', [userId]);

    if (users.length === 0) {
      // Esto podría pasar si el usuario fue eliminado después de que se emitió el token
      console.warn(`getCurrentUser: Usuario con ID ${userId} del token no encontrado en la base de datos.`);
      return res.status(404).json({ error: 'Usuario asociado al token no encontrado.' });
    }

    const currentUser = users[0];
    console.log('getCurrentUser: Detalles encontrados:', currentUser);
    // Devuelve los detalles del usuario (sin información sensible como la contraseña)
    res.json(currentUser);

  } catch (error) {
    console.error(`getCurrentUser: Error al obtener detalles para usuario ID ${userId}:`, error);
    res.status(500).json({ error: 'Error al recuperar la información del usuario.' });
  }
};


// Asegúrate de exportar la nueva función junto con las existentes
export {
  getUsuarios, getUsuario, getUsuarioPorEmail, findOrCreateUser, getCurrentUser // <-- Añadir la nueva función
};
