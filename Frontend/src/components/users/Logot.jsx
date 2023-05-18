import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export const Logot = () => {

    const {setAuth, setCounters} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        // Vaciar el localstorage
        localStorage.clear();

        // setear estados globales a vacio
        setAuth({});
        setCounters({});

        // Ir al login
        navigate("/login");

    });

    return (
        <div>Cerrando sesión...</div>
    )
    
}
