import { Global } from "../../helpers/Global";
import useAuth from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import Swal from "sweetalert2";

export const Login = () => {

    const { form, changed } = useForm({});
    const {setAuth} = useAuth();

    const loginUser = async (e) => {

        e.preventDefault();

        let user = form;

        const request = await fetch(Global.url+"user/login", {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await request.json();

        if(data.status === "success") {

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setAuth(data.user);

            window.location.reload();

        }

        if(data.message === "Todos los campos son obligatorios") {

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'Todos los campos son obligatorios'
            });

        }

        if(data.message === "El usuario no existe") {

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'El usuario no existe'
            });

        }

        if(data.message === "La contraseña es incorrecta") {

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'La contraseña es incorrecta'
            });

        }

        if(data.message === "Error al iniciar sesión") {

            Swal.fire({
                icon: 'error',
                title: 'Opss...',
                text: 'Error al iniciar sesión'
            });

        }

    }

    return (

        <>

            <header className="content__header content__header--public">
                <h1 className="content__title">Login</h1>
            </header>

            <div className="content__posts">

                <form className="login-form" onSubmit={loginUser}>

                    <div>
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" name="email" id="email" onChange={changed}/>
                    </div>

                    <div>
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" id="password" onChange={changed}/>
                    </div>

                    <input type="submit" value="Iniciar sesión" className="btn btn-success" />

                </form>

            </div>

        </>

    )
}
