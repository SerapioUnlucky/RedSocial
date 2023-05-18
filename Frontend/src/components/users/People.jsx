import { useState, useEffect } from 'react';
import { Global } from '../../helpers/Global';
import { UserList } from './UserList';

export const People = () => {

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState();
  const [total, setTotal] = useState();
  const [following, setFollowing] = useState([]);
  const [followed, setFollowed] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {

    getUsers();

  }, []);

  const getUsers = async (pag) => {

    const request = await fetch(Global.url + "user/list/" + pag, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      }
    });

    const data = await request.json();

    if (data.status === "success") {
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
      setFollowing(data.users_following);
      setFollowed(data.users_follow_me);
    }

  }

  return (

    <>

      <header className="content__header">
        <h1 className="content__title">Gente que te puede interesar</h1>
      </header>

      <UserList

        users={users}
        getUsers={getUsers}
        following={following}
        setFollowing={setFollowing}
        followed={followed}
        setFollowed={setFollowed}
        total={total}
        pages={pages}
        page={page}
        setPage={setPage}

      />

    </>

  )
}
