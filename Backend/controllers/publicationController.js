const Publication = require('../models/publicationModel');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const followService = require('../services/followService');

// Crear publicacion
const save = async (req, res) => {

    // Recoger parametros de la peticion
    const params = req.body;

    // Si no llegan datos, devolver un error
    if(!params.text) return res.status(400).send({status: "error", message: "Debes enviar un texto"});

    // Crear objeto a guardar
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;
    
    try {

        const publicationSaved = await newPublication.save();

        if(!publicationSaved){

            return res.status(500).send({
                status: "error",
                message: "Error al guardar la publicacion"
            });

        }

        return res.status(200).send({
            status: "success",
            message: "Publicacion guardada correctamente",
            publication: publicationSaved
        });
        
    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
        
    }

}

// Ver una publicacion
const detail = async (req, res) => {

    // Sacar id de la publicacion de la url
    const publicationId = req.params.id;

    // Buscar la publicacion por id
    try {

        const publication = await Publication.findById(publicationId).populate('user', "-password -role -__v");

        if(!publication){

            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });

        }

        // Devolver la publicacion
        return res.status(200).send({
            status: "success",
            message: "Publicacion encontrada",
            publication
        });
        
    } catch (error) {

        // Devolver error
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
        
    }

}

// Eliminar una publicacion
const remove = async (req, res) => {

    const publicationId = req.params.id;

    try {

        const removePublication = await Publication.findOneAndDelete({user: req.user.id, _id: publicationId});

        if(!removePublication){

            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });

        }

        return res.status(200).send({
            status: "success",
            message: "Publicacion eliminada correctamente",
            publication: removePublication
        });
        
    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
        
    }

}

// Listar publicaciones de un usuario
const user = async (req, res) => {

    // Sacar el id del usuario de la url
    let userId = req.params.id;

    // Controlar la pagina 
    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    const itemsPerPage = 5;

    // Buscar populate, ordenar, paginar
    try {

        const publications = await Publication.find({user: userId}).sort('-created_at').populate('user', '-password -role -__v -email').paginate(page, itemsPerPage);

        if(!publications || publications.length <= 0){

            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones"
            });

        }

        const total = await Publication.countDocuments({user: userId});

        return res.status(200).send({
            status: "success",
            message: "Publicaciones encontradas",
            page,
            total,
            pages: Math.ceil(total/itemsPerPage),
            publications
        });
        
    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
        
    }

}

// Subir archivos de imagen/publicacion 
const upload = async (req, res) => {

    // Sacar el id de la publicacion de la url
    const publicationId = req.params.id;

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
        const saveImage = await Publication.findOneAndUpdate({user: req.user.id, _id: publicationId}, {file: req.file.filename}, {new: true});

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
            publication: saveImage,
            file: req.file
        });

    }catch(error){
    
        return res.status(500).send({
            status: "error",
            message: "Error al intentar subir la imagen"
        });

    }

}

// Devolver imagen de publicacion
const media = async (req, res) => {

    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/"+file;

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

// Listar publicaciones de los usuarios que sigo
const feed = async (req, res) => {

    // Sacar pagina actual
    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    // Establecer numero de items por pagina
    const itemsPerPage = 5;

    // Sacar un array de los usuarios que seguimos como usuario logueado
    try {

        const myFollows = await followService.followUserIds(req.user.id);

        // Buscar las publicaciones de los usuarios que seguimos, ordenar, populate, paginar
        const publications = await Publication.find({user: {$in: myFollows.following}}).sort('-created_at').populate('user', '-password -role -__v -email').paginate(page, itemsPerPage);

        if(!publications || publications.length <= 0){

            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones"
            });

        }

        const total = await Publication.countDocuments({user: {$in: myFollows.following}});

        return res.status(200).send({
            status: "success",
            message: "Usuarios encontrados",
            page,
            total,
            pages: Math.ceil(total/itemsPerPage),
            publications
        });
        
    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });
        
    }

}

module.exports = {
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}
