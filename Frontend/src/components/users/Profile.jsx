import { useEffect, useState } from 'react';
import avatar from '../../assets/img/user.png';
import { getProfile } from '../../helpers/Profile';
import { useParams } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import ReactTimeAgo from 'react-time-ago';

export const Profile = () => {

    const { auth } = useAuth();
    const [user, setUser] = useState({});
    const [counters, setCounters] = useState({});
    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const params = useParams();
    const userId = params.userId;
    const token = localStorage.getItem("token");

    useEffect(() => {
        getProfile(userId, setUser);
        getPublications();
        getCounters();
    }, []);

    useEffect(() => {
        getProfile(userId, setUser);
        getPublications();
        getCounters();
    }, [params]);

    const getCounters = async () => {

        const request = await fetch(Global.url + "user/counters/" + userId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();
        setCounters(data);

    }

    const getPublications = async (pag) => {

        const request = await fetch(Global.url + "publication/user/" + userId + "/" + pag, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        if (data.status === "success") {

            setPublications(data.publications);
            setPages(data.pages);
            setTotal(data.total);

        }

    }

    const nextPage = async () => {

        let next = page + 1;
        setPage(next);
        getPublications(next);

    }

    const prevPage = async () => {

        let prev = page - 1;
        setPage(prev);
        getPublications(prev);

    }

    const deletePublication = async (id) => {

        const request = await fetch(Global.url + "publication/remove/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        if(data.status === "success"){

            Swal.fire({
                icon: "success",
                title: "Publicacion eliminada!"
            });

            setTimeout(() => {

                location.reload();

            }, 2000);

        }
        
    }

    return (

        <>

            <header className="aside__profile-info">

                <div className="profile-info__general-info">

                    <div className="general-info__container-avatar">
                        {
                            user.image != "default.png" ?

                                <img src={Global.url + "user/avatar/" + user.image} className="container-avatar__img" alt="Foto de perfil" />

                                :

                                <img src={avatar} className="container-avatar__img" alt="Foto de perfil" />
                        }
                    </div>

                    <div className="general-info__container-names">
                        <div className="container-names__name">
                            <h1>{user.name} {user.surname}</h1>
                        </div>
                        <h2 className="container-names__nickname">{user.nick}</h2>
                        {
                            user.bio ?
                                <p>{user.bio}</p>
                                :
                                <p>No hay biografia</p>
                        }
                    </div>

                </div>

                <div className="profile-info__stats">

                    <div className="stats__following">
                        <Link to={"/social/siguiendo/" + user._id} className="following__link">
                            <span className="following__title">Siguiendo</span>
                            <span className="following__number">{counters.following >= 1 ? counters.following : 0}</span>
                        </Link>
                    </div>

                    <div className="stats__following">
                        <Link to={"/social/seguidores/" + user._id} className="following__link">
                            <span className="following__title">Seguidores</span>
                            <span className="following__number">{counters.followed >= 1 ? counters.followed : 0}</span>
                        </Link>
                    </div>

                    <div className="stats__following">
                        <Link to={"/social/perfil/" + user._id} className="following__link">
                            <span className="following__title">Publicaciones</span>
                            <span className="following__number">{counters.publications >= 1 ? counters.publications : 0}</span>
                        </Link>
                    </div>

                </div>

            </header>

            <div className="content__posts">

                {publications.map((publication, index) => (

                    <article className="posts__post" key={index}>

                        <div className="post__container">

                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + publication.user._id} className="post__image-link">
                                    {
                                        publication.user.image != "default.png" ?

                                            <img src={Global.url + "user/avatar/" + publication.user.image} className="post__user-image" alt="Foto de perfil" />

                                            :

                                            <img src={avatar} className="post__user-image" alt="Foto de perfil" />
                                    }
                                </Link>
                            </div>

                            <div className="post__body">

                                <div className="post__user-info">
                                    <Link to={"/social/perfil/" + publication.user._id} className="user-info__name">{publication.user.name} {publication.user.surname}</Link>
                                    <span className="user-info__divider"> | </span>
                                    <Link to={"/social/perfil/" + publication.user._id} className="user-info__create-date"><ReactTimeAgo date={publication.created_at} locale="es-ES"/></Link>
                                </div>

                                <h4 className="post__content">{publication.text}</h4>

                                {publication.file && <img src={Global.url + "publication/media/"+ publication.file} width={500} />}

                            </div>

                        </div>

                        {auth._id === publication.user._id &&

                            <div className="post__buttons">

                                <button className="post__button" onClick={() => deletePublication(publication._id)}>
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>

                            </div>

                        }

                    </article>

                ))}

            </div>

            <div className="content__container-btn">
                {page > 1 &&

                    <button className="content__btn-more-post" onClick={prevPage}>
                        Página anterior
                    </button>

                }

                {pages > page &&
                    total > page &&

                    <button className="content__btn-more-post" onClick={nextPage}>
                        Siguiente página
                    </button>

                }
            </div>

        </>

    )
}
