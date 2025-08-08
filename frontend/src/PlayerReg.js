import './App.css';
import './PlayerReg.css';
import React, { useState } from 'react';

function App() {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loginPlayerId, setLoginPlayerId] = useState('');
  const [message, setMessage] = useState('');

  const handleCreatePlayer = async () => {
    if (!newPlayerName) return alert("Enter a name.");
    const res = await fetch('/players/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlayerName })
    });
    const data = await res.json();
    localStorage.setItem('playerId', data.player_id);
    localStorage.removeItem('gameId'); // Clear any old gameId on new registration
    setMessage(`Created player: ${data.name} with ID: ${data.player_id}. Remember this id for future games.\nIf you want to play as a different player, register a new one here first!`);
    setLoginPlayerId(data.player_id);
    setNewPlayerName('');
  };

const handleLogin = async () => {
  if (!loginPlayerId) return alert("Enter your ID.");

  try {
    const res = await fetch(`/players/${loginPlayerId}`);
    if (!res.ok) {
      throw new Error("Invalid Player ID");
    }

    const data = await res.json();
    localStorage.setItem('playerId', loginPlayerId);
    //setNewPlayerName(data.name);
    setMessage(`Logged in as ${data.name} (ID: ${loginPlayerId})`);
    setLoginPlayerId('');
  } catch (err) {
    console.error(err);
    setMessage("Error: Player ID not found. Please try again or create a new player.");
  }
};


  return (
    <div className="App">
      <h1>Player Registration</h1>

      <h2>Create New Player</h2>
      <input
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        placeholder="Enter player name"
      />
      <button onClick={handleCreatePlayer}>Create Player</button>

      <h2>Login with ID</h2>
      <input
        className = "loginWithId"
        value={loginPlayerId}
        onChange={(e) => setLoginPlayerId(e.target.value)}
        placeholder="Enter player ID"
      />
      <button onClick={handleLogin}>Submit</button>

      <p>{message}</p>
    </div>
  );
}

export default App;
