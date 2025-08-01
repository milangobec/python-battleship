import React, { useEffect, useState, useRef } from 'react';
import Game from './Game'

function Lobby({ onGameStateChange }) {
    const [lobbyName, setLobbyName] = useState('');
    const [showLobbyInput, setShowLobbyInput] = useState(false);
    const [lobbies, setLobbies] = useState([]);
    const [loadingLobbies, setLoadingLobbies] = useState(false);
    const [showLobbyList, setShowLobbyList] = useState(false);
    const [error, setError] = useState(null)
    const [joiningLobby, setJoiningLobby] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);
    const [currentGame, setCurrentGame] = useState(null);
    const pollingInterval = useRef(null);
    const [hostLobbyId, setHostLobbyId] = useState(null);
    
    console.log('Lobby: Component re-rendering, currentGame:', currentGame);

    const createLobby = async () => {
        localStorage.removeItem("gameId"); // Clear old gameId before creating a new lobby
        const playerId = localStorage.getItem('playerId')
        if (!playerId) {
            alert("You must be logged in to create a lobby...");
            return;
        }

        if (!lobbyName.trim()) {
            alert("please enter a lobby name");
            return;
        }

        const res = await fetch('/lobby/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                player_id: playerId,
                lobby_name: lobbyName
            })
        });

        const data = await res.json();

        setLobbyName('');
        setShowLobbyInput(false);
        setShowLobbyList(false);
        
        if (data.lobby_id) {
            setHostLobbyId(data.lobby_id);
        }
    };

    useEffect(() => {
        const playerId = localStorage.getItem('playerId');
        if (!hostLobbyId || !playerId || currentGame) return; // Stop polling if game already exists
        if (pollingInterval.current) clearInterval(pollingInterval.current);
<<<<<<< HEAD
        // Poll for game existence for the host
        pollingInterval.current = setInterval(async () => {
            try {
                const res = await fetch(`/games/by-player/${playerId}`);
                if (res.ok) {
                    const data = await res.json();
<<<<<<< HEAD
=======
        pollingInterval.current = setInterval(async () => {
            try {
                const res = await fetch(`/lobby/${hostLobbyId}/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player_id: playerId })
                });
                const data = await res.json();
                if (data.game_created) {
>>>>>>> 062d92a (Expand game frontend and update backend structure, setup, and docs.)
=======
                    console.log('Lobby: Host polling found game:', data);
>>>>>>> b07dc79 (Implement tailwindcss into ui, improve game sate, track sinking a whole ship)
                    setCurrentGame(data);
                    localStorage.setItem("gameId", data.game_id);
                    clearInterval(pollingInterval.current);
                    setHostLobbyId(null);
                }
            } catch (err) {
                console.error('Lobby: Host polling error:', err);
            }
        }, 2000);
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [hostLobbyId, currentGame]);

    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const listLobbies = async () => {
        setLoadingLobbies(true);
        setError(null);
        setShowLobbyList(true);

        try {
            const res = await fetch('/lobby/list', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch lobby list');
            }

            const data = await res.json();
            console.log("Lobbies: " , data.lobbies);
            setLobbies(data.lobbies);
            
            console.log("Raw lobbies data: ", data.lobbies);
            console.log("Array values for rendering: ", Object.values(data.lobbies));

        } catch (err) {
            setError(err.message)
            setLobbies([]);
        } finally {
            setLoadingLobbies(false);
        }

    };

    const joinLobby = async (lobbyId) => {
        const playerId = localStorage.getItem('playerId');
        if (!playerId) {
            alert("you must be logged in to join a lobby...")
            return; 
        }

        setJoiningLobby(lobbyId);
        setJoinStatus('Joining lobby...');
        setError(null);

        try {
            const res = await fetch(`/lobby/${lobbyId}/join` , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({player_id: playerId})
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Failed to join lobby');
            }

            if (data.game_created) {
                setJoinStatus('Game created! Starting game...')
                setCurrentGame(data);
                localStorage.setItem("gameId", data.game_id);
                setJoiningLobby(null);
                // Remove the setTimeout that was interfering with game state
                setJoinStatus(null);
            }
        }catch (err) {
            setError(err.message)
            setJoinStatus(null)
        } finally {
            setJoiningLobby(null);
        }
    };

    const handleGameEnd = () => {
        setCurrentGame(null);
        setShowLobbyList(false);
    };

    // Notify parent component about game state changes
    useEffect(() => {
        console.log('Lobby: currentGame changed to:', currentGame);
        if (onGameStateChange) {
            onGameStateChange(!!currentGame, currentGame);
        }
    }, [currentGame, onGameStateChange]);

    return (
        <div class="space-y-6">
            <div class="space-y-4">
                {!showLobbyInput && (
                    <button
                        onClick={() => setShowLobbyInput(true)}
                        class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-md transition">
                        Create Lobby
                    </button>
                )}

                {showLobbyInput && (
                    <div class="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                            value={lobbyName}
                            onChange={(e) => setLobbyName(e.target.value)}
                            placeholder='Enter lobby name'
                            class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                        <div class="flex space-x-2">
                            <button
                                onClick={createLobby}
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                                Create Lobby
                            </button>
                            <button
                                onClick={() => setShowLobbyInput(false)}
                                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition">
                                Cancel
                            </button>
                        </div>    
                    </div>
                )}
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700"></div>

            <div class="space-y-4">
                <button 
                    onClick={() => {
                        if (showLobbyList) {
                            setShowLobbyList(false);
                        } else {
                            listLobbies();
                        }
                    }}
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition">
                    {showLobbyList ? 'Hide Lobbies' : 'Show Lobbies'}
                </button>
                    

                {loadingLobbies && (
                    <div class="text-center py-4">
                        <p class="text-gray-600 dark:text-gray-300">Loading lobbies...</p>
                    </div>
                )}
                
                {error && (
                    <div class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        Error: {error}
                    </div>
                )}
                
                {joinStatus && (
                    <div class="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded">
                        {joinStatus}
                    </div>
                )}

                {showLobbyList && !loadingLobbies && (
                    <div class="space-y-3">
                        {lobbies.length === 0 ? (
                            <div class="text-center py-4 text-gray-500 dark:text-gray-400">
                                No lobbies available.
                            </div>
                        ) : (
                            lobbies.map((lobby) => (
                                <div key={lobby.id} class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                    <div class="flex justify-between items-center">
                                        <div class="flex-1">
                                            <h3 class="font-semibold text-gray-900 dark:text-white">
                                                {lobby.name || "Unnamed Lobby"}
                                            </h3>
                                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                                Host: {lobby.host_name} • Players: {lobby.player_count ?? "N/A"}/2
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => joinLobby(lobby.id)}
                                            disabled={joiningLobby === lobby.id || lobby.player_count >= 2}
                                            class={`px-4 py-2 rounded-md transition ${
                                                lobby.player_count >= 2 
                                                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                                                    : joiningLobby === lobby.id
                                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            {joiningLobby === lobby.id ? 'Joining...' :
                                                lobby.player_count >= 2 ? 'Full' : 'Join Lobby'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );

}

export default Lobby;