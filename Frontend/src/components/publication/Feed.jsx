import { useState, useEffect } from "react";
import { Global } from "../../helpers/Global";
import { Link } from "react-router-dom";
import avatar from "../../assets/img/user.png";
import ReactTimeAgo from "react-time-ago";

export const Feed = () => {

    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const token = localStorage.getItem("token");

    useEffect(() => {
        getPublications();
    }, []);

    const getPublications = async (pag) => {

        const request = await fetch(Global.url + "publication/feed/" + pag, {
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

        console.log(data);

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

    return (

        <>

            <header className="content__header">
                <h1 className="content__title">Timeline</h1>
            </header>

            <div className="content__posts">

                {publications.map((publication, index) => (

                    <div className="posts__post" key={index}>

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
                                    <Link to={"/social/perfil/" + publication.user._id} className="user-info__create-date"><ReactTimeAgo date={publication.created_at} locale="es-ES" /></Link>
                                </div>

                                <h4 className="post__content">{publication.text}</h4>

                                {publication.file && <img src={Global.url + "publication/media/" + publication.file} width={500} />}

                            </div>

                        </div>

                    </div>

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
