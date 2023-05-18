const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const followService = require('../services/followService');
const Publication = require('../models/publicationModel');
const Follow = require('../models/followModel');
const validate = require('../helpers/validate');

// Crear usuario
const register = async (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    try {

        // Verificar que los datos obligatorios esten
        if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {

            // Devolver respuesta
            return res.status(400).send({
                message: "Todos los campos son obligatorios"
            });

        }

        // Validacion avanzada
        try{

            validate(params);

        }catch(error){

            // Devolver respuesta
            return res.status(400).send({
                status: "error",
                message: "Los datos no son válidos"
            });

        }

        // Crear objeto de usuario
        let user = new User(params);

        // Verificar que el usuario no existe
        const existingUsers = await User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() },
            ],
        });

        // Si existe, devolver respuesta
        if (existingUsers && existingUsers.length >= 1) {

            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe"
            });

        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(user.password, 10);

        // Asignar la contraseña cifrada
        user.password = pwd;

        // Guardar usuario en la base de datos
        await user.save();

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Usuario creado correctamente"
        });

    } catch (error) {

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: "Error al crear el usuario"
        });

    }

}

// Iniciar sesión
const login = async (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    try {

        // Verificar que los datos obligatorios esten
        if (!params.email || !params.password) {

            // Devolver respuesta
            return res.status(400).send({
                message: "Todos los campos son obligatorios"
            });

        }

        // Buscar usuarios que coincidan con el email
        const existingUser = await User.findOne({ email: params.email });

        // Si no existe, devolver respuesta
        if (!existingUser) {

            // Devolver respuesta
            return res.status(400).send({
                status: "error",
                message: "El usuario no existe"
            });

        }

        // Si existe, comprobar la contraseña
        const validPassword = await bcrypt.compare(params.password, existingUser.password);

        // Si la contraseña es incorrecta, devolver respuesta
        if (!validPassword) {

            // Devolver respuesta
            return res.status(400).send({
                status: "error",
                message: "La contraseña es incorrecta"
            });

        }

        // Devolver token
        const token = jwt.createToken(existingUser);

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Usuario logueado correctamente",
            user: {
                id: existingUser._id,
                name: existingUser.name,
                nick: existingUser.nick
            },
            token
        });

    } catch (error) {

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: "Error al intentar iniciar sesión"
        });

    }

}

// Ver perfil
const profile = async (req, res) => {

    // Recoger id del usuario
    const id = req.params.id;

    try {

        // Buscar el usuario
        const userProfile = await User.findById(id).select({ password: 0 });

        // Si no existe, devolver respuesta
        if (!userProfile) {

            // Devolver respuesta
            return res.status(400).send({
                status: "error",
                message: "El usuario no existe"
            });

        }

        // Informacion de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Usuario encontrado",
            user: userProfile,
            following: followInfo.following,
            followed: followInfo.follower
        });

    } catch (error) {

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: "Error al intentar obtener el perfil del usuario"
        });

    }

}

// Listado de usuarios
const list = async (req, res) => {

    // Controlar en que pagina estamos
    let page = req.params.page ? req.params.page : 1;
    page = parseInt(page);

    // Consulta con paginacion
    let itemsPerPage = 5;

    try {

        // Buscar usuarios
        const users = await User.find().sort('_id').paginate(page, itemsPerPage).select("-password -role -__v -email");

        // Si no hay usuarios, devolver respuesta
        if (!users) {

            // Devolver respuesta
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });

        }

        // Contar los usuarios
        const total = await User.countDocuments();

        let followUserIds = await followService.followUserIds(req.user.id);

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios",
            users,
            total,
            pages: Math.ceil(total / itemsPerPage),
            users_following: followUserIds.following,
            users_follow_me: followUserIds.followers
        });

    } catch (err) {

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: "Error al intentar obtener los usuarios"
        });

    }

}

// Actualizar usuario
const update = async (req, res) => {

    // Recoger datos del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar propiedades innecesarias
    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;
    delete userIdentity.image;

    try {
        
        // Verificar que el usuario no existe
        const existingUsers = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() },
            ],
        });

        let userIsset = false;

        // Recorrer usuarios
        existingUsers.forEach((user) => {

            // Si el usuario existe y no es el mismo, devolver respuesta
            if(user && user._id != userIdentity.id){

                userIsset = true;

            }

        });

        // Si existe, devolver respuesta
        if (userIsset) {

            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe"
            });

        }

        // Si se recibe una contraseña nueva
        if(userToUpdate.password){

            // Cifrar la contraseña
            let pwd = await bcrypt.hash(userToUpdate.password, 10);

            // Asignar la contraseña cifrada
            userToUpdate.password = pwd;

        }else{

            // Eliminar la contraseña
            delete userToUpdate.password;

        }

        // Actualizar usuario
        const saveUser = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

        // Si no se ha podido actualizar, devolver respuesta
        if(!saveUser){

            return res.status(400).send({
                status: "error",
                message: "No se ha podido actualizar el usuario"
            });

        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Usuario actualizado correctamente",
            user: saveUser
        });

    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error al intentar actualizar el usuario"
        });
        
    }

}

// Subir archivos de imagen/avatar de usuario
const upload = async (req, res) => {

    // Recoger el fichero de imagen y comprobar que existe
    if(!req.file){

        return res.status(400).send({
            status: "error",
            message: "No se ha subido ningún archivo"
        });

    }

    // Conseguir el nombre y la extension del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar la extension, solo imagenes
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){

        // Borrar el archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        
        // Devolver respuesta
        return res.status(400).send({
            status: "error",
            message: "La extensión del archivo no es válida"
        });

    }

    try{

        // Si es correcto, guardar la imagen en el servidor
        const saveImage = await User.findByIdAndUpdate(req.user.id, {image: req.file.filename}, {new: true});

        // Si no se ha podido guardar la imagen
        if(!saveImage){

            // Devolver respuesta
            return res.status(400).send({
                status: "error",
                message: "No se ha podido actualizar la imagen"
            });

        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Imagen subida correctamente",
            user: saveImage,
            file: req.file
        });

    }catch(error){
    
        return res.status(500).send({
            status: "error",
            message: "Error al intentar subir la imagen"
        });

    }

}

// Devolver imagen de usuario
const avatar = async (req, res) => {

    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/"+file;

    // Comprobar si existe el fichero
    fs.stat(filePath, (err, stats) => {

        if(err || !stats){

            return res.status(404).send({
                status: "error",
                message: "La imagen no existe"
            });

        }

        // Devolver la imagen
        return res.sendFile(path.resolve(filePath));

    });

}

// Obtener contadores de usuario
const counters = async (req, res) => {

    let userId = req.user.id;

    if(req.params.id){
        userId = req.params.id;
    }

    try {

        const following = await Follow.countDocuments({user: userId});
        const followed = await Follow.countDocuments({followed: userId});
        const publications = await Publication.countDocuments({user: userId});

        return res.status(200).send({
            status: "success",
            userId,
            following: following,
            followed: followed,
            publications: publications
        });

    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error al intentar obtener los contadores"
        });
        
    }

}

module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}
