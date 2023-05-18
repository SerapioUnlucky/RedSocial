import { useForm } from "../../hooks/useForm";
import { Global } from "../../helpers/Global"
import Swal from "sweetalert2";
 
export const Register = () => {

    const {form, changed} = useForm({});

    const saveUser = async(e) => {

        // Evitamos que se recargue la página
        e.preventDefault();

        // Creamos un nuevo usuario con los datos del formulario
        let newUser = form;

        console.log(newUser);

        // Guardamos el nuevo usuario en la base de datos
        const request = await fetch(Global.url+"user/register", {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();

        if(data.status === "success") {

            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: 'El usuario se ha registrado correctamente'
            });

        }

        if(data.message === "Todos los campos son obligatorios"){

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'Todos los campos son obligatorios'
            });

        }

        if(data.message === "El usuario ya existe"){

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'El usuario ya existe'
            });

        }

        if(data.message === "Error al crear el usuario"){

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'Error al crear el usuario'
            });

        }

    }

    return (
        <>

            <header className="content__header content__header--public">
                <h1 className="content__title">Registro</h1>
            </header>

            <div className="content__posts">

                <form className="register-form" onSubmit={saveUser}>

                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input type="text" name="name" id="name" onChange={changed}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="surname">Apellido</label>
                        <input type="text" name="surname" id="surname" onChange={changed}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nick">Nick</label>
                        <input type="text" name="nick" id="nick" onChange={changed}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" id="email" onChange={changed}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" id="password" onChange={changed}/>
                    </div>

                    <input type="submit" value="Registrate" className="btn btn-success"/>

                </form>

            </div>

        </>
    )
}
