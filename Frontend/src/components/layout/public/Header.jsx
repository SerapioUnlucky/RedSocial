import { NavLink } from "react-router-dom"
import { Nav } from "./Nav"

export const Header = () => {
    return (
        <header className="layout__navbar">

            <div className="navbar__header">
                <NavLink to="/login" className="navbar__title">NGSOCIAL</NavLink>
            </div>

            <Nav/>

        </header>
    )
}