import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import avatar from "../../assets/img/user.png";
import { SerializeForm } from "../../helpers/SerializeForm";
import Swal from "sweetalert2";

export const Config = () => {

    const { auth, setAuth } = useAuth();

    const updateUser = async (e) => {

        e.preventDefault();

        const token = localStorage.getItem("token");

        // Recoger datos del formulario
        let newDataUser = SerializeForm(e.target);

        // Borrar propiedad de la imagen
        delete newDataUser.file0;

        const request = await fetch(Global.url+"user/update", {
            method: "PUT",
            body: JSON.stringify(newDataUser),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        if(data.status === "success"){

            delete data.user.password;

            setAuth(data.user);

            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: 'El usuario se ha actualizado correctamente'
            });

            const fileInput = document.querySelector("#file");

            if(fileInput.files[0]){

                const formData = new FormData();

                formData.append("file0", fileInput.files[0]);

                const requestUpload = await fetch(Global.url+"user/upload", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Authorization": token
                    }
                });

                const dataUpload = await requestUpload.json();

                if(dataUpload.status === "success"){

                    delete dataUpload.user.password;
                    setAuth(dataUpload.user);

                }

            }

        }

        if(data.message === "El usuario ya existe"){

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'El usuario ya existe'
            });

        }

        if(data.message === "Error al intentar actualizar el usuario"){

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error en el servidor'
            });

        }

    }

    return (

        <>

            <header className="content__header content__header--public">
                <h1 className="content__title">Ajustes</h1>
            </header>

            <div className="content__posts">

                <form className="config-form" onSubmit={updateUser}>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" id="name" defaultValue={auth.name}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="surname">Apellido</label>
                        <input type="text" name="surname" id="surname" defaultValue={auth.surname}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nick">Nick</label>
                        <input type="text" name="nick" id="nick" defaultValue={auth.nick}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Biografía</label>
                        <textarea name="bio" id="bio" defaultValue={auth.bio}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" id="email" defaultValue={auth.email}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" id="password" />
                    </div>

                    <div className="form-group">

                        <label htmlFor="file0">Avatar</label>

                        <div className="avatar">
                            {/* Mostrar imagen antigua */}
                            {
                            
                            auth.image != "default.png" ?
                        
                            <img src={Global.url+"user/avatar/"+auth.image} className="container-avatar__img" alt="Foto de perfil" />

                            :

                            <img src={avatar} className="container-avatar__img" alt="Foto de perfil" />

                            }

                        </div>

                        <br />

                        <input type="file" name="file0" id="file" />

                    </div>

                    <br/>

                    <input type="submit" value="Actualizar" className="btn btn-success" />

                </form>

            </div>

        </>

    )
}
