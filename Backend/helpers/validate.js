const validator = require('validator');

const validate = (params) => {

    let name = validator.isAlpha(params.name, 'es-ES') && validator.isLength(params.name, {min: 3, max: 20});
    let surname = validator.isAlpha(params.surname, 'es-ES') && validator.isLength(params.surname, {min: 3, max: 20});
    let nick = validator.isAlphaNumeric(params.nick, 'es-ES') && validator.isLength(params.nick, {min: 2, max: 20});
    let email = validator.isEmail(params.email);
    let password = validator.isLength(params.password, {min: 3, max: 20});

    if(params.bio){

        let bio = validator.isAlphaNumeric(params.bio, 'es-ES') && validator.isLength(params.name, {min: 3, max: 250});

        if(!bio){

            throw new Error('Los datos no son válidos');

        }

    }

    if(!name || !surname || !nick || !email || !password){

        throw new Error('Los datos no son válidos');

    }

}

module.exports = validate;
