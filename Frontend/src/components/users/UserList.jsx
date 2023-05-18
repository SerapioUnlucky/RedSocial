import useAuth from '../../hooks/useAuth';
import avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';

export const UserList = ({ users, getUsers, following, setFollowing, followed, setFollowed, total, page, pages, setPage }) => {

    const { auth } = useAuth();

    const token = localStorage.getItem("token");

    const follow = async (userId) => {

        const request = await fetch(Global.url + "follow/save", {
            method: "POST",
            body: JSON.stringify({ followed: userId }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        if (data.status === "success") {

            setFollowing([...following, userId]);

        }

    }

    const unfollow = async (userId) => {

        const request = await fetch(Global.url + "follow/unfollow/" + userId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        if (data.status === "success") {

            const array = following.filter((user) => user !== userId);

            setFollowing(array);

        }

    }

    const nextPage = async () => {

        let next = page + 1;
        setPage(next);
        getUsers(next);

    }

    const prevPage = async () => {

        let prev = page - 1;
        setPage(prev);
        getUsers(prev);

    }

    return (

        <>

            <div className="content__posts">

                {users.map((user, index) => (

                    <article key={index} className="posts__post">

                        <div className="post__container">

                            <div className="post__image-user">
                                <Link to={"/social/perfil/"+user._id} className="post__image-link">
                                    {
                                        user.image != "default.png" ?

                                            <img src={Global.url + "user/avatar/" + user.image} className="post__user-image" alt="Foto de perfil" />

                                            :

                                            <img src={avatar} className="post__user-image" alt="Foto de perfil" />
                                    }
                                </Link>
                            </div>

                            <div className="post__body">

                                <div className="post__user-info">
                                    <Link to={"/social/perfil/"+user._id} className="user-info__name">{user.name} {user.surname} | </Link>
                                    <Link to={"/social/perfil/"+user._id} className="user-info__create-date"><ReactTimeAgo date={user.created_at} locale="es-ES"/></Link>
                                    {followed.includes(user._id) && <span className="user-info__followed"> | Siguiendote</span>}
                                </div>

                                {
                                    user.bio ?
                                        <h4 className="post__content">{user.bio}</h4>
                                        :
                                        <h4 className="post__content">No hay biografia</h4>
                                }

                            </div>

                        </div>

                        {
                            user._id !== auth._id &&
                            <div className="post__buttons">
                                {
                                    following.includes(user._id) &&
                                    <button className="post__button" onClick={() => unfollow(user._id)}>Dejar de seguir</button>
                                }

                                {
                                    !following.includes(user._id) &&
                                    <button className="post__button post__button--green" onClick={() => follow(user._id)}>Seguir</button>
                                }
                            </div>
                        }

                    </article>

                ))}

            </div>

            <div className="content__container-btn">
                {pages > page &&
                    total > page &&

                    <button className="content__btn-more-post" onClick={nextPage}>
                        Siguiente página
                    </button>

                }

                {page > 1 &&

                    <button className="content__btn-more-post" onClick={prevPage}>
                        Página anterior
                    </button>

                }
            </div>

        </>

    )
}
