const Follow = require("../models/followModel");
const mongoosePaginate = require("mongoose-pagination");
const followService = require("../services/followService");

// Seguir a un usuario
const save = async (req, res) => {

    // Conseguir datos
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    try {

        // Guardar el objeto
        const savedUserToFollow = await userToFollow.save();

        if (!savedUserToFollow) {

            return res.status(404).send({
                message: "Error al guardar el seguimiento"
            });

        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Usuario seguido correctamente",
            savedUserToFollow
        });


    } catch (error) {

        return res.status(500).send({
            message: "Error en el servidor"
        });

    }

}

// Dejar de seguir a un usuario
const unfollow = async (req, res) => {

    // Sacar el id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que se va a dejar de seguir
    const followedId = req.params.id;

    // Buscar coincidencias y eliminar 
    try {

        const unfollowed = await Follow.findOneAndDelete({ user: userId, followed: followedId });

        if (!unfollowed) {

            return res.status(404).send({
                status: "error",
                message: "Error al dejar de seguir"
            });

        }

        return res.status(200).send({
            status: "success",
            message: "Dejaste de seguir a este usuario"
        });

    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });

    }

}

// Listar usuarios que sigo
const following = async (req, res) => {

    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega un id por la url
    if (req.params.id) {

        userId = req.params.id;

    }

    // Comprobar si me llega la pagina, si no es asi, asignarle el valor 1
    let page = 1;

    if (req.params.page) {

        page = req.params.page;

    }

    // Usuarios por pagina que quiero mostrar
    const itemsPerPage = 5;

    // Buscar en modelo de follow, popular datos de los usuarios y paginar 
    try {

        const following = await Follow.find({ user: userId }).populate("followed", "-password -role -__v -email").paginate(page, itemsPerPage);

        const total = await Follow.countDocuments({ user: userId });

        if (!following) {

            return res.status(404).send({
                status: "error",
                message: "No estas siguiendo a ningun usuario"
            });

        }

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Usuarios que sigues",
            following,
            total,
            pages: Math.ceil(total / itemsPerPage),
            users_following: followUserIds.following,
            users_follow_me: followUserIds.followers
        });

    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Error en el servidor"
        });

    }

}

// Listar usuarios que me siguen
const followers = async (req, res) => {

    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega un id por la url
    if (req.params.id) {

        userId = req.params.id;

    }

    // Comprobar si me llega la pagina, si no es asi, asignarle el valor 1
    let page = 1;

    if (req.params.page) {

        page = req.params.page;

    }

    // Usuarios por pagina que quiero mostrar
    const itemsPerPage = 5;

    // Buscar en modelo de follow, popular datos de los usuarios y paginar 
    try {

        const followers = await Follow.find({ followed: userId }).populate("user", "-password -role -__v -email").paginate(page, itemsPerPage);

        const total = await Follow.countDocuments({ followed: userId });

        if (!followers) {

            return res.status(404).send({
                status: "error",
                message: "No te sigue ningun usuario"
            });

        }

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Usuarios que te siguen",
            followers,
            total,
            pages: Math.ceil(total / itemsPerPage),
            users_following: followUserIds.following,
            users_follow_me: followUserIds.followers
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
    unfollow,
    following,
    followers
}
