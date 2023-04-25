// Importar dependencias
const jwt = require('jwt-simple');
const moment = require('moment');

// Clave secreta
const secret = "clave_secreta_red_social";

// Crear una función para generar tokens
const createToken = (user) => {
    
    // Crear un payload
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }

    // Codificar el payload con la clave secreta
    return jwt.encode(payload, secret);

}

module.exports = {
    secret,
    createToken
}
