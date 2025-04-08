
import { pool } from "../helpers/mysql-config.js";

const getUser = (req,res) => {
    const {id} = req.params
    const SQL = `SELECT * FROM Usuario WHERE id = ?`
    pool.query(SQL, [id], (err,results,fields) => {
        if (err)
            res.json(err)
        res.json(results)
    })
}

export {
    getUser
}
