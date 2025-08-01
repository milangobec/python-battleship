import React, { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS,
    ArcElement, 
    Tooltip, 
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PlayerStats(){
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);

    const getRank = (wins) => {
        if(wins <= 5) return "Cadet";
        if(wins <= 15) return "Lieutenant";
        if(wins <= 30) return "Commander";
        return "Admiral"
    }

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
                    console.error("Error fetching player:", err);
                })
                
        }
    }, []);

    const chartData = {
        labels: ['Wins', 'Losses'],
        datasets: [
            {
                data: [playerStats?.wins || 0, playerStats?.losses || 0],
                backgroundColor: ['#10B891', '#EF4444'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#6B7280',
                    font: { size: 12 }
                }
            },
            tooltip: {
                enabled: false
            }
        }
    };

    return(
        <div class="min-h-screen flex flex-col items-center justify-center align-top bg-gray-200 dark:bg-gray-900">
            <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 -mt-50">
                <h1 class="text-2xl font-semibold text-center dark:text-white">Player Stats</h1>
                <h3 class="text-center -mt-5">for <strong class="text-gray-900 dark:text-white">{playerName}</strong></h3>
                <div class="text-center mb-4">
                    <div class="inline-block bg-blue-100 dark:bg-blue-900 rounded-lg px-4 py-2 -mt-3">
                        <span class="text-gray-600 dark:text-gray-300">Rank: </span>
                        <span class="font-bold text-blue-800 dark:text-blue-200">
                            {playerStats ? getRank(playerStats.wins) : 'Loading...'}
                        </span>
                    </div>
                </div>
                <div class="space-y-2">
                    {playerStats ? (
                            <div class="flex space-x-4 justify-center">
                                <div class="w-1/2 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Game Stats</h4>
                                    <div class="flex justify-center mb-4">
                                        <div class="w-48 h-48 relative">
                                            <Doughnut data={chartData} options={chartOptions} />
                                            <div class="absolute inset-0 flex flex-col items-center justify-center -mt-8">
                                                <div class="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                                    {playerStats && (playerStats.wins + playerStats.losses) > 0 
                                                        ? `${((playerStats.wins / (playerStats.wins + playerStats.losses)) * 100).toFixed(1)}%`
                                                        : '0%'}
                                                </div>
                                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                                    Win Rate
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600 dark:text-gray-300 -mt-3">Games Played: </span>
                                            <span class="font-semibold text-gray-900 dark:text-white -mt-3">{playerStats.wins + playerStats.losses}</span>
                                        </div>
                                </div>

                                <div class="w-1/2 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Combat Stats</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between font-bold">
                                            <span class="text-black dark:text-white">Accuracy:</span>
                                            <span class="font-extrabold text-black dark:text-white">{playerStats.accuracy.toFixed(1)}%</span>
                                        </div>
                                        <div class="flex justify-between font-bold">
                                            <span class="text-black dark:text-white">Total Shots:</span>
                                            <span class="font-extrabold text-black dark:text-white">{playerStats.hits + playerStats.misses}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600 dark:text-gray-300">Hits:</span>
                                            <span class="font-semibold text-gray-900 dark:text-white">{playerStats.hits}</span>
                                        </div>
                                        
                                        <div class="flex justify-between">
                                            <span class="text-gray-600 dark:text-gray-300">Misses:</span>
                                            <span class="font-semibold text-gray-900 dark:text-white">{playerStats.misses}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600 dark:text-gray-300">Ships Sunk:</span>
                                            <span class="font-semibold text-gray-900 dark:text-white">{playerStats.ships_sunk || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p class="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
                        )}
                </div>
            </div>
        </div>
    );
}

export default PlayerStats;