import { Routes, Route, BrowserRouter, Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/public/PublicLayout';
import { Login } from '../components/users/Login';
import { Register } from '../components/users/Register';
import { PrivateLayout } from '../components/layout/private/PrivateLayout';
import { Feed } from '../components/publication/Feed';
import { AuthProvider } from '../context/AuthProvider';
import { Logot } from "../components/users/Logot";
import { People } from '../components/users/People';
import { Config } from '../components/users/Config';
import { Following } from '../components/follow/Following';
import { Followers } from '../components/follow/Followers';
import { Profile } from '../components/users/Profile';

export const Routing = () => {
    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    <Route path="/" element={<PublicLayout />}>

                        <Route index element={<Login />} />
                        <Route path='login' element={<Login />} />
                        <Route path="register" element={<Register />} />

                    </Route>

                    <Route path='/social' element={<PrivateLayout />}>

                        <Route index element={<Feed />} />
                        <Route path='feed' element={<Feed />} />
                        <Route path='logout' element={<Logot />} />
                        <Route path="gente" element={<People />} />
                        <Route path="ajustes" element={<Config />} />
                        <Route path="siguiendo/:userId" element={<Following />} />
                        <Route path="seguidores/:userId" element={<Followers />} />
                        <Route path="perfil/:userId" element={<Profile />} />

                    </Route>

                    <Route path='*' element={

                        <div>

                            <h1>404 | Not Found</h1>
                            <Link to="/">Volver al inicio</Link>

                        </div>

                    } />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    )
}
