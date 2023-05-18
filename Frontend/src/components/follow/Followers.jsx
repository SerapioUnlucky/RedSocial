import { useState, useEffect } from 'react';
import { Global } from '../../helpers/Global';
import { UserList } from '../users/UserList';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../helpers/Profile';

export const Followers = () => {

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState();
    const [following, setFollowing] = useState([]);
    const [followed, setFollowed] = useState([]);
    const [profile, setProfile] = useState({});

    const token = localStorage.getItem("token");
    const params = useParams();

    useEffect(() => {

        getUsers();
        getProfile(params.userId, setProfile);

    }, []);

    const getUsers = async (pag) => {

        const userId = params.userId;

        const request = await fetch(Global.url + "follow/followers/" + userId + "/" + pag, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        let cleanUsers = [];

        data.followers.forEach(follow => {
            cleanUsers = [...cleanUsers, follow.user]
        });

        data.users = cleanUsers;

        if (data.status === "success") {
            setUsers(data.users);
            setTotal(data.pages);
            setFollowing(data.users_following);
            setFollowed(data.users_follow_me);
        }

    }

    return (

        <>

            <header className="content__header">
                <h1 className="content__title">Seguidores de {profile.nick}</h1>
            </header>

            <UserList

                users={users}
                getUsers={getUsers}
                following={following}
                setFollowing={setFollowing}
                followed={followed}
                setFollowed={setFollowed}
                total={total}
                page={page}
                setPage={setPage}

            />

        </>

    )
}
