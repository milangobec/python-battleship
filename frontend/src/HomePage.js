import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Lobby from './Lobby';

function HomePage() {
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState("");
    const [notLoggedIn, setNotLoggedIn] = useState(false)
    const navigate = useNavigate();
    
    useEffect(() => {
        const id = localStorage.getItem("playerId");
        if (id) {
            setPlayerId(id);

            fetch(`/players/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setPlayerName(data.name);
                })
                .catch((err) => {
                    console.error("Error fetching player:", err)
                })
        }else{
            setNotLoggedIn(true)
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("playerId");
        setPlayerId(null);
        setPlayerName("");
        setNotLoggedIn(true)
    }

    if (notLoggedIn){
        return(
            <div>
                <h1>Welcome to Battleship</h1>
                <p>You are not logged in...</p>
                <Link to="/register">
                    <button>Go to registration</button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome to Battleship</h1>
            {playerId ? (
                <p>Logged in as: {playerName}, with ID: {playerId}</p>
            ) : (
                <p>Please register or log in first.</p>
            )}
            <button onClick={handleLogout}>Log Out</button>
            <br></br>
            <Lobby/>
        </div>
    );
}

export default HomePage;