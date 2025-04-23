import https from 'https'; // Importar el módulo https
import dotenv from 'dotenv';
import { URL } from 'url'; // Para parsear la URL

dotenv.config();

const login = async (req, res) => {
    const { email, password } = req.body;
    const apiKey = process.env.API_KEY || 'tec_api_KdZRQLUyMEJJHDqztZilqg';
    const externalLoginUrl = 'https://www.aulify.mx/aulifyLogin';

    // Validación básica de entrada
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const url = new URL(externalLoginUrl);
        const postData = JSON.stringify({ email, password });

        // Configuración de la petición https
        const options = {
            hostname: url.hostname,
            port: 443, // Puerto estándar para HTTPS
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'Content-Length': Buffer.byteLength(postData) // Importante para POST
            }
        };

        // Crear y enviar la petición
        const externalReq = https.request(options, (externalRes) => {
            let responseBody = '';

            // Recibir datos de la respuesta
            externalRes.on('data', (chunk) => {
                responseBody += chunk;
            });

            // Al finalizar la respuesta
            externalRes.on('end', () => {
                try {
                    const responseData = JSON.parse(responseBody);
                    // Devolver la respuesta de la API externa con su código de estado
                    res.status(externalRes.statusCode).json(responseData);
                } catch (parseError) {
                    console.error('Error parsing external response:', parseError);
                    // Si la respuesta no es JSON válido, devolver error interno
                    res.status(500).json({ error: "Internal Server Error - Invalid external response" });
                }
            });
        });

        // Manejar errores de la petición en sí (ej. red)
        externalReq.on('error', (error) => {
            console.error('External request error:', error);
            res.status(500).json({ error: "Internal Server Error - Request failed" });
        });

        // Escribir el cuerpo de la petición
        externalReq.write(postData);
        // Finalizar la petición (enviarla)
        externalReq.end();

    } catch (error) {
        // Capturar errores generales (ej. error al parsear URL)
        console.error('Login controller error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { login };