import React, { useEffect, useState } from 'react'

function Lobby() {
    const [lobbyName, setLobbyName] = useState('');
    const [showLobbyInput, setShowLobbyInput] = useState(false);
    const [lobbies, setLobbies] = useState([]);
    const [loadingLobbies, setLoadingLobbies] = useState(false);
    const [showLobbyList, setShowLobbyList] = useState(false);
    const [error, setError] = useState(null)
    const [joiningLobby, setJoiningLobby] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);

    const createLobby = async () => {
        const playerId = localStorage.getItem('playerId')
        if (!playerId) {
            alert("You must be logged in to create a lobby...");
            return;
        }

        if (!lobbyName.trim()) {
            alert("please enter a lobby name");
            return;
        }

        const res = await fetch('lobby/create',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                player_id: playerId,
                lobby_name: lobbyName
            })
        });

        const data = await res.json();
        console.log("Lobby created: ", data);

        setLobbyName('');
        setShowLobbyInput(false);
        setShowLobbyList(false);
    };

    const listLobbies = async () => {
        setLoadingLobbies(true);
        setError(null);
        setShowLobbyList(true);

        try {
            const res = await fetch('lobby/list', {
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
                //navigate to game component
                setTimeout(() => {
                    setJoinStatus('Game started successfully!');
                    setJoiningLobby(null);
                }, 2000);
            }
        }catch (err) {
            setError(err.message)
            setJoinStatus(null)
        } finally {
            setJoiningLobby(null)
        }
    }

    return (
        <div>
            {!showLobbyInput && (
                <button onClick={() => setShowLobbyInput(true)}>Create Lobby</button>
            )}

            {showLobbyInput && (
                <>
                    <input
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                        placeholder='Enter lobby name'
                    />
                    <button onClick={createLobby}>Submit Lobby</button>
                    <button onClick={() => setShowLobbyInput(false)}>Cancel</button>
                </>
                )}

                <hr/>

                <button onClick={listLobbies}>Show All Lobbies</button>

                {loadingLobbies && <p>Loading lobbies...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {joinStatus && <p style={{ color: 'blue'}}>{joinStatus}</p>}

                {showLobbyList && !loadingLobbies &&(
                    <ul>
                        {lobbies.length === 0 ? (
                            <li>No lobbies available.</li>
                        ) : (
                            lobbies.map((lobby) => (
                                <li key={lobby.id} style={{
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    margin: '10px 0',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    maxWidth: '500px',
                                    width: '100%'
                                }}>
                                    <div>
                                        <strong>{lobby.name || "Unnamed Lobby"}</strong> - Host: {lobby.host_name}, Players: {lobby.player_count ?? "N/A"}/2
                                    </div>
                                    <button
                                        onClick={() => joinLobby(lobby.id)}
                                        disabled={joiningLobby === lobby.id || lobby.player_count >= 2}
                                        style={{
                                            background: lobby.player_count >= 2 ? '#ccc' : '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '3px',
                                            cursor: lobby.player_count >= 2 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {joiningLobby === lobby.id ? 'Joining...' :
                                            lobby.player_count >= 2 ? 'Full' : 'Join Lobby'}
                                    </button>
                                        
                                </li>
                            ))
                        )}
                    </ul>
                )}
        </div>
    );

}

export default Lobby;