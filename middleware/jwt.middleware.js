

import jwt from 'jsonwebtoken'; 
import express from 'express' ;

const middleware = express.Router();

const verifyJWT = (req,res,next )  => {
    let token = req.headers['authorization']; 
    
    if(token){
        token = token.split(' ')[1] ;

        jwt.verify(token,process.env.KEYPHRASE,(err,decoded) => {
            if(err)
                return res.status(403).json({mensaje: 'Token inválido'})
            else
                next();
        })
    } else
        return res.status(401).send({mensaje: 'Token no proporcionado'})
}

middleware.use(verifyJWT)

export{middleware}

