import './App.css';
import './PlayerReg.css';
import React, { useState } from 'react';

function App() {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loginPlayerId, setLoginPlayerId] = useState('');
  const [message, setMessage] = useState('');

  const handleCreatePlayer = async () => {
    if (!newPlayerName) {
      alert("Enter a name.");
      return;
    }
    
    try {
      const res = await fetch('/players/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      localStorage.setItem('playerId', data.player_id);
      localStorage.removeItem('gameId'); // Clear any old gameId on new registration
      setMessage(`Player created! ID: ${data.player_id}`);
      setLoginPlayerId(data.player_id);
      setNewPlayerName('');
    } catch (error) {
      console.error('Error creating player:', error);
      setMessage(`Error: ${error.message}`);
    }
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
      <div class="min-h-screen flex flex-col items-center justify-center align-top bg-gray-200 dark:bg-gray-900">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 -mt-50">
          <h1 class="text-2xl font-semibold text-center dark:text-white">Player Registration</h1>

          <div class="space-y-2">
            <h2 class="block text-lg font-medium text-gray-700 dark:text-gray-300">Create New Player</h2>
            <input
              type = "text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:text-white"
            />
            <button 
              onClick={handleCreatePlayer}
              class="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition">
                Create Player
              </button>
          </div>

          <div class="space-y-2">
            <h2 class="block text-lg font-medium text-gray-700 dark:text-gray-300">Login with ID</h2>
            <input
              type='text'
              className = "loginWithId"
              value={loginPlayerId}
              onChange={(e) => setLoginPlayerId(e.target.value)}
              placeholder="Enter player ID"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:text-white"
            />
            <button 
              onClick={handleLogin}
              class="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition">
                Submit
              </button>
          </div>
        </div>
        
        <div class="mt-5 text-center">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default App;