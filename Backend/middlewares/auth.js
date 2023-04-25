const jwt = require('jwt-simple');
const moment = require('moment');
const libjwt = require('../services/jwt');
const secret = libjwt.secret;

exports.auth = (req, res, next) => {

    // Comprobar si llega la autorización
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        });
    }

    // Limpiar el token y quitar comillas
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try{

        // Decodificar el token
        let payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){

            return res.status(401).send({
                status: "error",
                message: "El token ha expirado"
            });

        }

        // Adjuntar usuario identificado a la request
        req.user = payload;

    }catch (error) {

        // Devolver respuesta
        return res.status(404).send({
            status: "error",
            message: "El token no es válido",
            error
        });

    }

    // Pasar a la acción
    next();

}