
import { pool } from "../helpers/mysql-config.js";

const getUser = (req, res) => {
    try {
        const { id } = req.params;
        console.log("Looking for user with ID:", id); // Add debugging
        
        const SQL = `SELECT * FROM Usuario WHERE id = ?`;
        pool.query(SQL, [id], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
            }
            
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            
            return res.json(results[0]);
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export {
    getUser
}