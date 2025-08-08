import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Lobby from './Lobby';
import Game from './Game';

function HomePage() {
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState("");
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [isInGame, setIsInGame] = useState(false);
    const [currentGame, setCurrentGame] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);
    const navigate = useNavigate();
    
    const handleGameStateChange = (inGame, gameData = null) => {
        console.log('HomePage: isInGame changed to:', inGame, 'gameData:', gameData);
        setIsInGame(inGame);
        setCurrentGame(gameData);
    };
    
    const handleGameEnd = () => {
        setIsInGame(false);
        setCurrentGame(null);
    };
    
    useEffect(() => {
        const id = localStorage.getItem("playerId");
        if (id) {
            setPlayerId(id);

            fetch(`/players/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setPlayerName(data.name);
                    setPlayerStats(data);
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
            <div class="min-h-screen flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-900">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center items-start -mt-50">
                    <h1 class="text-3xl font-bold mb-4 text-gray-900 text-center dark:text-white">Welcome to Battleship</h1>
                    <p class="mb-6 text-gray-600 dark:text-gray-300">
                        Please log in or register to start playing.
                    </p>
                    <Link to="/register">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
                            Go to registration
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
            
            <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div class="mox-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div class="flex items-center justify-between">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Battleship</h1>
                        {playerId && (
                            <div class="flex items-center space-x-4">
                                <div class="flex flex-col items-end">
                                    <span class="text-gray-600 dark:text-gray-300">
                                        Welcome, {playerName}!
                                    </span>
                                    <span class="text-gray-500 dark:text-gray-400 text-sm">
                                        ID: {playerId}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition">
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-7 py-4 sm:py-4 lg:py-8">
                {!isInGame ? (
                    <div class="flex space-x-4 items-start">
                        <div class="flex-[6.5] bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Game Lobby</h2>
                            <Lobby onGameStateChange={handleGameStateChange}/>
                        </div>
                        <div class="flex-[3.5] bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Load saved games</h2>
                            <div class="felx justify-between">
                                <span class="text-gray-600 dark:text-gray300 text-center">Coming soon... </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div class="w-full">
                        {currentGame ? (
                            <Game gameData={currentGame} onGameEnd={handleGameEnd} />
                        ) : (
                            <Lobby onGameStateChange={handleGameStateChange}/>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;