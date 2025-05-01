import { pool } from '../helpers/mysql-config.js'

// Obtener todas las estadísticas
const getEstadistica = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estadistica');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadistica:', error);
    res.status(500).json({ error: 'Error al obtener las estadisticas' });
  }
};

// Obtener estadísticas por tipo
const getEstadisticaPorTipo = async (req, res) => {
  try {
    // CORRECCIÓN: Usar idTipo en lugar de id en los parámetros de ruta si así está definida la ruta
    // Asumiendo que la ruta es /api/estadistica/tipo/:idTipo
    const { idTipo } = req.params;
    const tipoIdNumerico = parseInt(idTipo, 10);

    if (isNaN(tipoIdNumerico)) {
        return res.status(400).json({ error: 'El idTipo debe ser un número.' });
    }
    console.log(`Buscando estadísticas con idTipo: ${tipoIdNumerico}`);

    // First, check if the tipo exists
    const [tipoExists] = await pool.query('SELECT * FROM tipoEstadistica WHERE id = ?', [tipoIdNumerico]);

    if (tipoExists.length === 0) {
      console.log(`No existe un tipo de estadística con id: ${tipoIdNumerico}`);
      // CORRECCIÓN: No necesitas llamar a getTiposEstadistica aquí, solo devuelve el error
      return res.status(404).json({
        error: `No existe un tipo de estadística con id: ${tipoIdNumerico}`
      });
    }

    // CORRECCIÓN: Query estadistica table filtering by idTipo
    const [rows] = await pool.query(
      'SELECT * FROM estadistica WHERE idTipo = ?',
      [tipoIdNumerico]
    );

    console.log(`Resultados encontrados para idTipo ${tipoIdNumerico}: ${rows.length}`);

    if (rows.length === 0) {
      // If no records found, return a more informative message
      return res.json({
        message: `No hay estadísticas registradas para el tipo con id: ${tipoIdNumerico} (${tipoExists[0].nombre})`,
        tipo: tipoExists[0]
      });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadistica por tipo:', error);
    res.status(500).json({ error: 'Error al obtener las estadisticas por tipo' });
  }
};

// Helper function to get all tipos de estadistica
// Obtener todos los tipos de estadísticas
const getTiposEstadistica = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipoEstadistica');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tipos de estadística:', error);
    res.status(500).json({ error: 'Error al obtener los tipos de estadística' });
  }
};
// Obtener estadísticas de un usuario
// Obtener las ÚLTIMAS estadísticas de cada tipo para un usuario
const getEstadisticaUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const usuarioIdNumerico = parseInt(idUsuario, 10);
    if (isNaN(usuarioIdNumerico)) {
        return res.status(400).json({ error: 'idUsuario debe ser un número.' });
    }

    // MODIFICADO: Consulta para obtener la entrada con el MÁXIMO valor_INT para cada tipo de estadística de este usuario
    const query = `
      SELECT e.*
      FROM estadistica e
      INNER JOIN (
          SELECT idTipo, MAX(valor_INT) as MaxValorInt 
          FROM estadistica
          WHERE idUsuario = ? 
            AND valor_INT IS NOT NULL -- Asegurarse de que solo consideramos entradas con valor_INT
          GROUP BY idTipo
      ) AS maximas 
      ON e.idTipo = maximas.idTipo AND e.valor_INT = maximas.MaxValorInt
      WHERE e.idUsuario = ?
      ORDER BY e.idTipo ASC; 
    `;
    // Nota: Si hay múltiples entradas con el mismo valor_INT máximo para un tipo,
    // esta consulta podría devolverlas todas. Si solo quieres una (por ejemplo, la más reciente
    // entre las que tienen el valor máximo), la consulta necesitaría ser más compleja,
    // posiblemente usando ROW_NUMBER() si tu versión de MySQL lo soporta, o una subconsulta adicional.
    // Por ahora, esto devolverá todas las entradas que empaten en el valor máximo.

    const [rows] = await pool.query(query, [usuarioIdNumerico, usuarioIdNumerico]);

    // Opcional: Si quieres asegurarte de que solo devuelves UNA fila por idTipo,
    // incluso si hay empates en valor_INT, puedes procesar 'rows' aquí.
    // Por ejemplo, podrías crear un Map para quedarte con la primera que encuentres por idTipo.
    const estadisticasUnicas = new Map();
    rows.forEach(row => {
        if (!estadisticasUnicas.has(row.idTipo)) {
            estadisticasUnicas.set(row.idTipo, row);
        }
        // Si quieres la más reciente en caso de empate, podrías comparar fechas aquí:
        // else {
        //     const existente = estadisticasUnicas.get(row.idTipo);
        //     if (new Date(row.fecha_hora) > new Date(existente.fecha_hora)) {
        //         estadisticasUnicas.set(row.idTipo, row);
        //     }
        // }
    });

    // Convertir el Map de nuevo a un array para la respuesta JSON
    const resultadoFinal = Array.from(estadisticasUnicas.values());


    res.json(resultadoFinal); // Devolver el array de las estadísticas con máximo valor_INT por tipo

  } catch (error) {
    console.error('Error al obtener las estadísticas con máximo valor del usuario:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas con máximo valor del usuario' });
  }
};

// Obtener estadísticas de un usuario por tipo
const getEstadisticaUsuarioPorTipo = async (req, res) => {
  try {
    const { idUsuario, idTipo } = req.params;
    const usuarioIdNumerico = parseInt(idUsuario, 10);
    const tipoIdNumerico = parseInt(idTipo, 10);

    if (isNaN(usuarioIdNumerico) || isNaN(tipoIdNumerico)) {
        return res.status(400).json({ error: 'idUsuario e idTipo deben ser números.' });
    }

    const [rows] = await pool.query(
      // MODIFICADO: Añadir ORDER BY y LIMIT 1
      `SELECT * 
       FROM estadistica 
       WHERE idUsuario = ? AND idTipo = ? 
       ORDER BY fecha_hora DESC 
       LIMIT 1`,
      [usuarioIdNumerico, tipoIdNumerico]
    );

    if (rows.length === 0) {
      // MODIFICADO: Devolver un objeto indicando que no hay datos, en lugar de 404
      // Esto permite al frontend manejar la ausencia de datos específicos.
      // Podríamos devolver un valor predeterminado o null según la necesidad del frontend.
      // Por ejemplo, para niveles completados (idTipo 2), podríamos devolver 0.
      let defaultValue = null;
      if (tipoIdNumerico === 2) { // Asumiendo que 2 es 'Niveles Completados'
          defaultValue = { valor_INT: 0 }; // O la estructura que espere el frontend
      }
      // Si necesitas devolver algo genérico o dejar que el frontend decida:
      // return res.status(200).json({ mensaje: 'No se encontraron estadísticas para este usuario y tipo', datos: null });
      // Por ahora, devolvemos un objeto con valor_INT 0 para el tipo 2, y null para otros.
       return res.status(200).json(defaultValue);
    }

    res.json(rows[0]); // Devolver solo el objeto más reciente
  } catch (error) {
    console.error('Error al obtener estadistica del usuario por tipo:', error);
    res.status(500).json({ error: 'Error al obtener las estadisticas del usuario por tipo' });
  }
};



// Obtener tiempo de juego de un usuario
const getTiempoJuegoUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const usuarioIdNumerico = parseInt(idUsuario, 10);
     if (isNaN(usuarioIdNumerico)) {
        return res.status(400).json({ error: 'idUsuario debe ser un número.' });
    }

    const [rows] = await pool.query(
      // MODIFICADO: Añadir ORDER BY y LIMIT 1
      `SELECT e.valor_TIME 
       FROM estadistica e 
       JOIN tipoEstadistica t ON e.idTipo = t.id 
       WHERE e.idUsuario = ? AND t.nombre = "Tiempo de juego total" 
       ORDER BY e.fecha_hora DESC 
       LIMIT 1`,
      [usuarioIdNumerico]
    );

    if (rows.length === 0 || rows[0].valor_TIME === null) { // Comprobar también si el valor es NULL
      // Devolver 0 si no hay registro o es NULL
      return res.json({ tiempoTotal: "00:00:00", tiempoFormateado: "0 h 0 m" });
    }

    // El valor es de tipo TIME en formato hh:mm:ss
    const tiempoString = rows[0].valor_TIME;

    // Extraer las horas del formato TIME
    const [horas, minutos, segundos] = tiempoString.split(':').map(Number);

    res.json({
      tiempoTotal: tiempoString,
      tiempoFormateado: `${horas} h ${minutos} m`
    });
  } catch (error) {
    console.error('Error al obtener tiempo de juego:', error);
    res.status(500).json({ error: 'Error al obtener el tiempo de juego' });
  }
};

// ------- NUEVA FUNCIÓN: Insertar o Actualizar Estadística (UPSERT) -------
const upsertEstadistica = async (req, res) => {
  // 1. Obtener idUsuario del token JWT (añadido por verifyJWT middleware)
  const idUsuario = req.user?.userId;
  if (!idUsuario) {
    return res.status(401).json({ error: 'Usuario no autenticado o ID no encontrado en el token.' });
  }

  // 2. Obtener idTipo y valor del cuerpo de la solicitud (request body)
  const { idTipo, valor } = req.body;

  // 3. Validaciones básicas
  if (idTipo === undefined || valor === undefined) {
    return res.status(400).json({ error: 'Faltan los campos requeridos: idTipo y valor.' });
  }

  const tipoIdNumerico = parseInt(idTipo, 10);
  if (isNaN(tipoIdNumerico)) {
      return res.status(400).json({ error: 'El idTipo debe ser un número.' });
  }

  console.log(`[UPSERT Estadistica] Recibido - Usuario ID: ${idUsuario}, Tipo ID: ${tipoIdNumerico}, Valor recibido: ${valor}`);

  try {
    // 4. Determinar la columna de valor y preparar valores para INSERT/UPDATE
    let valorIntAInsertar = null;
    let valorTimeAInsertar = null;
    let esTipoIncremental = false;

    // ID 1 es 'Tiempo de juego total' (TIME) - Reemplaza
    if (tipoIdNumerico === 1) {
        if (!/^\d{2}:\d{2}:\d{2}$/.test(valor)) {
           return res.status(400).json({ error: `El valor para idTipo ${tipoIdNumerico} (Tiempo de juego) debe estar en formato HH:MM:SS.` });
        }
        valorTimeAInsertar = valor; // Valor para INSERT y UPDATE (reemplazo)
    }
    // IDs 2 a 6 son INT - Incrementan
    else if (tipoIdNumerico >= 2 && tipoIdNumerico <= 6) {
        esTipoIncremental = true;
        const incremento = parseInt(valor, 10); // El valor recibido es el incremento (ej: 1)
        if (isNaN(incremento)) {
          return res.status(400).json({ error: `El valor para idTipo ${tipoIdNumerico} debe ser un número entero.` });
        }
        // Para INSERT, el valor inicial es el propio incremento.
        // Para UPDATE, usaremos este incremento en la consulta SQL.
        valorIntAInsertar = incremento;
    } else {
        // Validar si el idTipo existe en la BD aunque no lo manejemos aquí
         const [tipoExists] = await pool.query('SELECT id FROM tipoEstadistica WHERE id = ?', [tipoIdNumerico]);
         if (tipoExists.length === 0) {
             return res.status(404).json({ error: `El tipo de estadística con id ${tipoIdNumerico} no existe.` });
         }
         // Si existe pero no está en el rango 1-6
         return res.status(400).json({ error: `Tipo de estadística con id ${tipoIdNumerico} no manejado para inserción/actualización.` });
    }

    console.log(`[UPSERT Estadistica] Procesado - Usuario ID: ${idUsuario}, Tipo ID: ${tipoIdNumerico}, Valor INT (Insert/Incremento): ${valorIntAInsertar}, Valor TIME (Insert/Update): ${valorTimeAInsertar}`);

    // 5. Ejecutar la consulta UPSERT modificada para sumar en tipos incrementales
    // Se asume clave única (UNIQUE KEY) en (idUsuario, idTipo) en la tabla 'estadistica'
    const sql = `
      INSERT INTO estadistica (idUsuario, idTipo, valor_INT, valor_TIME, fecha_hora)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        valor_INT = IF(VALUES(idTipo) BETWEEN 2 AND 6, COALESCE(estadistica.valor_INT, 0) + VALUES(valor_INT), estadistica.valor_INT),
        valor_TIME = IF(VALUES(idTipo) = 1, VALUES(valor_TIME), estadistica.valor_TIME),
        fecha_hora = NOW()
    `;
    // Explicación del UPDATE:
    // - valor_INT: Si el idTipo insertado/actualizado está entre 2 y 6, suma el nuevo valor (VALUES(valor_INT), que es el incremento)
    //   al valor existente (estadistica.valor_INT). COALESCE maneja el caso donde el valor existente sea NULL (lo trata como 0).
    //   Si el idTipo no está en ese rango (es 1), simplemente mantiene el valor_INT existente (que debería ser NULL para el tipo 1).
    // - valor_TIME: Si el idTipo insertado/actualizado es 1, actualiza al nuevo valor (VALUES(valor_TIME)).
    //   Si no es 1, mantiene el valor_TIME existente (que debería ser NULL para los tipos 2-6).
    // - fecha_hora: Siempre se actualiza a la hora actual.

    const [result] = await pool.query(sql, [idUsuario, tipoIdNumerico, valorIntAInsertar, valorTimeAInsertar]);

    console.log('[UPSERT Estadistica] Resultado de la consulta:', result);

    // 6. Enviar respuesta
    if (result.affectedRows > 0) {
      // affectedRows = 1 para INSERT, 2 para UPDATE (en MySQL con ON DUPLICATE KEY UPDATE)
      const message = (result.affectedRows === 1 && result.insertId !== 0) ? 'Estadística creada/inicializada exitosamente.' : 'Estadística actualizada exitosamente.';
       // Podrías querer devolver el nuevo valor acumulado si fuera necesario
      res.status(result.insertId ? 201 : 200).json({ message });
    } else {
       // Esto podría ocurrir si el valor a actualizar es 0 para un tipo incremental y ya existe,
       // o si el valor de tiempo es idéntico al existente.
       console.warn('[UPSERT Estadistica] La consulta no afectó ninguna fila (posiblemente el valor no cambió o el incremento fue 0).', result);
       res.status(200).json({ message: 'No se realizaron cambios en la estadística (valor existente o incremento 0).' });
    }

  } catch (error) {
    // Manejo de errores específicos (ej: clave duplicada si no usas ON DUPLICATE KEY UPDATE correctamente)
    if (error.code === 'ER_DUP_ENTRY') {
         console.error('[UPSERT Estadistica] Error de clave duplicada. Esto no debería ocurrir con ON DUPLICATE KEY UPDATE bien configurado.', error);
         return res.status(409).json({ error: 'Conflicto al intentar guardar la estadística.' });
    }
    console.error('[UPSERT Estadistica] Error general al insertar/actualizar estadística:', error);
    res.status(500).json({ error: 'Error interno al guardar la estadística.' });
  }
};
// --------------------------------------------------------------------

// ... existing code ...

export {
    getEstadistica,
    getEstadisticaPorTipo,
    getEstadisticaUsuario,
    getTiempoJuegoUsuario,
    getEstadisticaUsuarioPorTipo,
    getTiposEstadistica,
    upsertEstadistica // <-- Exportar la función actualizada
  }