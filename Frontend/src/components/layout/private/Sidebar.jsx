import avatar from "../../../assets/img/user.png";
import { Global } from "../../../helpers/Global";
import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useForm } from "../../../hooks/useForm";
import Swal from "sweetalert2";
import { useState } from "react";

export const Sidebar = () => {

    const { auth, counters } = useAuth();
    const { form, changed } = useForm();
    const [image, setImage] = useState(false);
    const token = localStorage.getItem("token");

    const savePost = async (e) => {

        e.preventDefault();

        let newPost = form;
        newPost.user = auth._id;

        const request = await fetch(Global.url + "publication/save", {
            method: "POST",
            body: JSON.stringify(newPost),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const response = await request.json();
        const fileInput = document.querySelector("#file");

        if (response.status === "success") {

            Swal.fire({
                icon: "success",
                title: "Listo",
                text: "Tu publicación se ha creado correctamente"
            });

            if (fileInput.files[0]) {

                const formData = new FormData();
                formData.append("file0", fileInput.files[0]);

                const requestImage = await fetch(Global.url + "publication/upload/" + response.publication._id, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Authorization": token
                    }
                });

                const responseImage = await requestImage.json();

                if (responseImage.status === "success") {

                    setImage(true);

                }

            }

            const myForm = document.querySelector("#publication-form");
            myForm.reset();

        }

        if (response.message === "Error al guardar la publicacion") {

            Swal.fire({
                icon: "error",
                title: "Opss...",
                text: "No se pudo crear la publicación"
            })

        }

        if (response.message === "Debes enviar un texto") {

            Swal.fire({
                icon: "error",
                title: "Opss...",
                text: "Debes enviar un texto"
            })

        }

        if (response.message === "Error en el servidor") {

            Swal.fire({
                icon: "error",
                title: "Opss...",
                text: "Error en el servidor"
            })

        }

    }

    return (
        <aside className="layout__aside">

            <header className="aside__header">
                <h1 className="aside__title">Hola, {auth.name}</h1>
            </header>

            <div className="aside__container">

                <div className="aside__profile-info">

                    <div className="profile-info__general-info">
                        <div className="general-info__container-avatar">
                            {

                                auth.image != "default.png" ?

                                    <img src={Global.url + "user/avatar/" + auth.image} className="container-avatar__img" alt="Foto de perfil" />

                                    :

                                    <img src={avatar} className="container-avatar__img" alt="Foto de perfil" />

                            }
                        </div>

                        <div className="general-info__container-names">
                            <Link to={"/social/perfil/"+auth._id} className="container-names__name">{auth.name} {auth.surname}</Link>
                            <p className="container-names__nickname">{auth.nick}</p>
                        </div>
                    </div>

                    <div className="profile-info__stats">

                        <div className="stats__following">
                            <Link to={"/social/siguiendo/" + auth._id} className="following__link">
                                <span className="following__title">Siguiendo</span>
                                <span className="following__number">{counters.following >=1 ? counters.following : 0}</span>
                            </Link>
                        </div>

                        <div className="stats__following">
                            <Link to={"/social/seguidores/" + auth._id} className="following__link">
                                <span className="following__title">Seguidores</span>
                                <span className="following__number">{counters.followed >=1 ? counters.followed : 0}</span>
                            </Link>
                        </div>


                        <div className="stats__following">
                            <Link to={"/social/perfil/"+auth._id} className="following__link">
                                <span className="following__title">Publicaciones</span>
                                <span className="following__number">{counters.publications >=1 ? counters.publications : 0}</span>
                            </Link>
                        </div>


                    </div>
                </div>


                <div className="aside__container-form">

                    <form id="publication-form" className="container-form__form-post" onSubmit={savePost}>

                        {image &&

                            <>
                                <strong className="alert alert-success">La imagen se guardo correctamente</strong>
                                <br />
                            </>

                        }

                        <div className="form-post__inputs">
                            <label htmlFor="text" className="form-post__label">¿Que estas pensando hoy?</label>
                            <textarea name="text" className="form-post__textarea" onChange={changed} />
                        </div>

                        <div className="form-post__inputs">
                            <label htmlFor="file0" className="form-post__label">Sube tu foto</label>
                            <input type="file" id="file" name="file0" className="form-post__image" />
                        </div>

                        <input type="submit" value="Publicar" className="form-post__btn-submit" />

                    </form>

                </div>

            </div>

        </aside>
    )
}
