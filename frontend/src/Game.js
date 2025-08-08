import React, { useState, useEffect, useRef } from 'react';
import './Game.css';

// Utility to mask the enemy board (show only x/o, otherwise ~)
function getMaskedBoard(board) {
    // Only show hits ('x') and misses ('o'), everything else is water ('~')
    return board.grid.map(row =>
        row.map(cell => {
            if (cell === 'x' || cell === 'o') return cell;
            return '~';
        })
    );
}

function Game({ gameData, onGameEnd }) {
    console.log('Game: Initial gameData', gameData);
    const [gameState, setGameState] = useState({ ...gameData, id: gameData.game_id });
    const [placementPhase, setPlacementPhase] = useState(false);
    const [selectedShip, setSelectedShip] = useState(null);
    const [shipPlacements, setShipPlacements] = useState({});
    const [dragOverCell, setDragOverCell] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    const [attackResult, setAttackResult] = useState(null);
    const [shipSunkMessage, setShipSunkMessage] = useState(null);
    const pollingRef = useRef(null);
    
    const playerId = localStorage.getItem('playerId');

    // Always call hooks at the top level
    // Separate useEffect to handle placement phase
    useEffect(() => {
        if (gameState.player1 && gameState.player2 && gameState.boards) {
            if (gameState.current_turn) {
                setPlacementPhase(false);
            }else {
                setPlacementPhase(true);
            }
        } else {
            setPlacementPhase(false);
        }
    }, [gameState.player1, gameState.player2, gameState.boards, gameState.current_turn]);

    useEffect(() => {
        console.log('Game: Polling useEffect triggered', {
            player1: !!gameState.player1,
            player2: !!gameState.player2,
            boards: !!gameState.boards,
            placementPhase,
            gameId: gameState.id
        });
        
        if (!gameState.player1 || !gameState.boards) return;
        
        // Poll during placement phase when both players are present, or when game has started
        if ((placementPhase && gameState.player2) || gameState.current_turn) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(async () => {
                try {
                    const updatedGameRes = await fetch(`/games/${gameState.id}`);
                    const updateGame = await updatedGameRes.json();
                    console.log('Game: Polling update', updateGame);
                    
                    // Only update if we have valid game data
                    if (updateGame && updateGame.game_id) {
                        setGameState({ ...updateGame, id: updateGame.game_id });
                    } else {
                        console.log('Game: Polling received invalid game data:', updateGame);
                    }
                } catch (error) {
                    console.error('Game: Polling error', error);
                }
            }, 1000); 
            return () => {
                if (pollingRef.current) clearInterval(pollingRef.current);
            };
        } else {
            if (pollingRef.current) clearInterval(pollingRef.current);
        }
    }, [gameState.id, gameState.player1, gameState.player2, gameState.boards, gameState.current_turn, placementPhase]);

    useEffect(() => {
        if (!gameState.player1 || !gameState.player2 || !gameState.boards) return;
        const isPlayer1 = gameState.player1 && gameState.player1.id === playerId;
        const myTurn = gameState.current_turn === playerId;
        const myBoard = isPlayer1 ? gameState.boards.player1_board : gameState.boards.player2_board;
        const enemyBoard = isPlayer1 ? gameState.boards.player2_board : gameState.boards.player1_board;
    }, [gameState, playerId]);

    // Defensive: wait for all required game state fields
    if (!gameState.player1 || !gameState.boards) {
        return <div>Loading game...</div>;
    }

    // Show waiting screen if only one player is present
    if (!gameState.player2) {
        return (
            <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Waiting for opponent to join...</h2>
                    <div class="text-gray-600 dark:text-gray-300">
                        <p>Game created! Share the lobby with another player to start.</p>
                        <p class="mt-2">Player1: <span class="font-semibold">{gameState.player1.name}</span></p>  
                    </div>
                </div>
            </div>
        );
    }

    const isPlayer1 = gameState.player1 && gameState.player1.id === playerId;
    const myTurn = gameState.current_turn === playerId;
    const myBoard = isPlayer1 ? gameState.boards.player1_board : gameState.boards.player2_board;
    const enemyBoard = isPlayer1 ? gameState.boards.player2_board : gameState.boards.player1_board;

    const availableShips = [
        { name: 'carrier', size: 5, color: '#FF6B6B' },
        { name: 'battleship', size: 4, color: '#4ECDC4' },
        { name: 'cruiser', size: 3, color: '#45B7D1' },
        { name: 'submarine', size: 3, color: '#96CEB4' },
        { name: 'destroyer', size: 2, color: '#FFEAA7' }
    ];

    const placedShips = new Set(Object.values(shipPlacements).map(p => p.ship));

    const handleShipSelect = (ship) => {
        if (placedShips.has(ship.name)) return;
        setSelectedShip(ship);
    };

    const handleOrientationChange = () => {
        setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
    };

    const canPlaceShip = (ship, x, y, orientation) => {
        const size = ship.size;
        if (placedShips.has(ship.name)) return false;
        if (orientation === 'horizontal') {
            if (x + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (shipPlacements[`${x + i},${y}`]) return false;
            }
        } else {
            if (y + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (shipPlacements[`${x},${y + i}`]) return false;
            }
        }
        return true;
    };

    const placeShip = (ship, x, y, orientation) => {
        if (!canPlaceShip(ship, x, y, orientation)) return false;
        const newPlacements = { ...shipPlacements };
        const size = ship.size;
        if (orientation === 'horizontal') {
            for (let i = 0; i < size; i++) {
                newPlacements[`${x + i},${y}`] = { ship: ship.name, color: ship.color, orientation };
            }
        } else {
            for (let i = 0; i < size; i++) {
                newPlacements[`${x},${y + i}`] = { ship: ship.name, color: ship.color, orientation };
            }
        }
        setShipPlacements(newPlacements);
        setSelectedShip(null);
        return true;
    };

    const handleCellDrop = (e, x, y) => {
        e.preventDefault();
        if (!selectedShip) return;
        if (placeShip(selectedShip, x, y, orientation)) {
            setSelectedShip(null);
        }
        setDragOverCell(null);
    };

    const handleCellDragOver = (e, x, y) => {
        e.preventDefault();
        if (!selectedShip) return;
        if (canPlaceShip(selectedShip, x, y, orientation)) {
            setDragOverCell({ x, y });
        } else {
            setDragOverCell(null);
        }
    };

    const handleCellDragLeave = () => {
        setDragOverCell(null);
    };

    // Helper to render your own board using shipPlacements (preserve color/ships)
    const renderMyBoardCell = (x, y) => {
        const key = `${x},${y}`;
        const placement = shipPlacements[key];
        let cellClass = 'cell';
        let cellStyle = {};
        if (placement) {
            cellClass += ' ship';
            cellStyle.backgroundColor = placement.color;
        }
        return (
            <div
                key={key}
                className={cellClass}
                style={cellStyle}
            >
                {placement ? placement.ship[0].toUpperCase() : '~'}
            </div>
        );
    };

    const renderCell = (x, y, isEnemy = false) => {
        if (!placementPhase) {
            if (!isEnemy) {
                // After placement, keep rendering your own board using shipPlacements
                return renderMyBoardCell(x, y);
            }
            // Enemy board: use backend masked board
            const maskedEnemyGrid = getMaskedBoard(enemyBoard);
            if (x === 0 && y === 0) {
                // Log the masked enemy board once per render
                console.log('[RENDER] Masked enemy board:', maskedEnemyGrid);
            }
            const cellValue = maskedEnemyGrid[y][x];
            // Log the cell being rendered
            console.log(`[RENDER] Enemy cell (${x},${y}):`, cellValue);
            let cellClass = 'cell';
            if (cellValue === 'x') cellClass += ' hit';
            if (cellValue === 'o') cellClass += ' miss';
            const canAttack = isEnemy && myTurn && cellValue === '~';
            return (
                <div
                    key={`${x},${y}`}
                    className={cellClass}
                    onClick={canAttack ? () => handleEnemyCellClick(x, y) : undefined}
                    style={{ cursor: canAttack ? 'pointer' : 'default' }}
                >
                    {cellValue}
                </div>
            );
        }
        const key = `${x},${y}`;
        const placement = shipPlacements[key];
        const isDragOver = dragOverCell && dragOverCell.x === x && dragOverCell.y === y;
        let cellClass = 'cell';
        let cellStyle = {};
        if (placement && !isEnemy) {
            cellClass += ' ship';
            cellStyle.backgroundColor = placement.color;
        } else if (isDragOver && selectedShip && !isEnemy) {
            cellStyle.backgroundColor = selectedShip.color;
            cellStyle.opacity = 0.7;
        }
        
        const handleCellClick = () => {
            if (placementPhase) {
                if (!placement || isEnemy || !placementPhase) return;

                const newPlacements = { ...shipPlacements };
                Object.keys(newPlacements).forEach(cellKey => {
                    if (newPlacements[cellKey].ship === placement.ship) {
                        delete newPlacements[cellKey];
                    }
                });
                setShipPlacements(newPlacements);
            } else if (isEnemy && myTurn) {
                handleEnemyCellClick(x, y);
            }
        };
        return (
            <div
                key={key}
                className={cellClass}
                style={cellStyle}
                onDrop={(e) => !isEnemy && handleCellDrop(e, x, y)}
                onDragOver={(e) => !isEnemy && handleCellDragOver(e, x, y)}
                onDragLeave={!isEnemy ? handleCellDragLeave : undefined}
                draggable={false}
                onClick={handleCellClick}
            >
                {placement && !isEnemy ? placement.ship[0].toUpperCase() : '~'}
            </div>
        );
    };

    const handleEnemyCellClick = async (x,y) => {
        if (!myTurn) return;

        const response = await fetch(`/games/${gameState.id}/attack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({x, y, player_id:playerId})
        });

        const result = await response.json();
        if (result.error) {
            alert(result.error)
            return;
        }
        // Show immediate feedback
        if (result.result === 'x') {
            setAttackResult('Hit!');

            if (result.ship_sunk) {
                setShipSunkMessage(`You sunk their ${result.ship_sunk}!`)
                setTimeout(() => setShipSunkMessage(null), 1500);
            }
        } else if (result.result === 'o') {
            setAttackResult('Miss!');
        } else {
            setAttackResult(null);
        }
        setTimeout(async () => {
            const updatedGameRes = await fetch(`/games/${gameState.id}`);
            const updateGame = await updatedGameRes.json();
            console.log('[ATTACK] Updated game state:', updateGame);
            setGameState({ ...updateGame, id: updateGame.game_id });
            console.log('[TURN DEBUG] playerId:', playerId, 'current_turn:', updateGame.current_turn, 'myTurn:', updateGame.current_turn === playerId);
            setAttackResult(null);
        }, 800);
    };

    const renderBoard = (boardData, isEnemy = false) => {
        const cells = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                cells.push(renderCell(x, y, isEnemy));
            }
        }
        return (
            <div style={{ overflow: 'hidden', width: 'fit-content', margin: '0 auto' }}>
                <div className="board-grid">
                    {cells}
                </div>
            </div>
        );
    };

    const renderShipSelector = () => {
        return (
            <div className="ship-selector">
                <h3>Place Your Ships</h3>
                <div className="ships-container">
                    {availableShips.map((ship) => {
                        const placed = placedShips.has(ship.name);
                        return (
                            <div
                                key={ship.name}
                                className={`ship-item${selectedShip?.name === ship.name ? ' selected' : ''}${placed ? ' placed' : ''}`}
                                style={{ backgroundColor: ship.color, opacity: placed ? 0.4 : 1, cursor: placed ? 'not-allowed' : 'pointer' }}
                                onClick={() => handleShipSelect(ship)}
                                draggable={!placed}
                                onDragStart={placed ? undefined : (e) => {
                                    e.dataTransfer.setData('text/plain', ship.name);
                                    setSelectedShip(ship);
                                }}
                            >
                                {ship.name.charAt(0).toUpperCase() + ship.name.slice(1)} ({ship.size})
                                {placed && <span style={{marginLeft: 6, fontWeight: 'normal', fontSize: 12}}>(Placed)</span>}
                            </div>
                        );
                    })}
                </div>
                <button onClick={handleOrientationChange}>
                    Orientation: {orientation}
                </button>
            </div>
        );
    };

    const submitShipPlacements = async () => {
        const shipsToPlace = {};
        for (const key in shipPlacements) {
            const { ship, orientation } = shipPlacements[key];
            if (!shipsToPlace[ship]) shipsToPlace[ship] = { cells: [], orientation };
            shipsToPlace[ship].cells.push(key);
        }
        for (const shipName in shipsToPlace) {
            const { cells, orientation } = shipsToPlace[shipName];
            const coords = cells.map(k => k.split(',').map(Number));
            let origin;
            if (orientation === 'horizontal') {
                origin = coords.reduce((min, curr) => (curr[0] < min[0] ? curr : min), coords[0]);
            } else {
                origin = coords.reduce((min, curr) => (curr[1] < min[1] ? curr : min), coords[0]);
            }
            const [x, y] = origin;
            const placement = {
                player_id: playerId,
                ship_name: shipName,
                x,
                y,
                orientation
            };
            if (!gameState.id) {
                alert("no game id found.")
                return;
            }
            const response = await fetch(`/games/${gameState.id}/place-ship`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(placement),
            });
            const result = await response.json();
            if (!result.success) {
                alert(result.error || "Failed to place ship: " + placement.ship_name);
                return;
            }
        }
        alert("all ships placed successfully")
    };

    const startGame = async () => {
        try{
            await submitShipPlacements();

            const response = await fetch(`/games/${gameState.id}`);
            const updatedGame = await response.json();

            setGameState({ ...updatedGame, id: updatedGame.game_id});

            setPlacementPhase(false);
        } catch (error) {
            console.error("failed to start game:", error)
        }
    };

    const allShipsPlaced = () => {
        return placedShips.size === availableShips.length;
    };

    if (placementPhase) {
    return (
        <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-6xl">
                <div class="flex flex-row items-start justify-center gap-8">
                    {/* Ship Selector */}
                    <div class="w-64 flex-shrink-0">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Place Your Ships</h3>
                        <div class="space-y-4">
                            {availableShips.map((ship) => {
                                const placed = placedShips.has(ship.name);
                                return (
                                    <div
                                        key={ship.name}
                                        class={`cursor-pointer transition block ${
                                            placed 
                                                ? 'opacity-40 cursor-not-allowed' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        style={{ 
                                            opacity: placed ? 0.4 : 1,
                                            width: `${ship.size * 48}px`,
                                            height: '48px',
                                            overflow: 'hidden'
                                        }}
                                        onClick={() => handleShipSelect(ship)}
                                        draggable={!placed}
                                        onDragStart={placed ? undefined : (e) => {
                                            e.dataTransfer.setData('text/plain', ship.name);
                                            setSelectedShip(ship);
                                        }}
                                    >
                                        {/* Ship visual representation */}
                                        <div class="whitespace-nowrap" style={{ fontSize: 0 }}>
                                            {Array.from({ length: ship.size }, (_, i) => (
                                                <div 
                                                    key={i}
                                                    class="w-12 h-12 border border-black inline-block"
                                                    style={{ backgroundColor: ship.color }}
                                                ></div>
                                            ))}
                                        </div>
                                        {placed && <div class="text-gray-600 dark:text-gray-400 text-sm mt-1">(Placed)</div>}
                                    </div>
                                );
                            })}
                        </div>
                        <button 
                            onClick={handleOrientationChange}
                            class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                        >
                            Orientation: {orientation}
                        </button>
                        
                        {allShipsPlaced() && (
                            <button 
                                onClick={startGame}
                                class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow transition font-semibold"
                            >
                                Start Game
                            </button>
                        )}
                    </div>
                    
                    {/* Board */}
                    <div class="flex-1">
                        <h2 class="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">Your Board</h2>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow flex justify-center max-w-[480px] mx-auto">
                            {renderBoard(myBoard, false)}
                        </div>
                        <div class="text-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            Tip: Click ships on your board to remove them.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

    if (gameState.game_over) {
        const isWinner = gameState.winner_id === playerId;
        return (
            <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Over</h2>
                    <div class="text-2xl font-bold my-6">
                        {isWinner ? (
                            <span class="text-green-600 dark:text-green-400">You win!</span>
                        ) : (
                            <span class="text-red-600 dark:text-red-400">You lose...</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-8">
        {shipSunkMessage && (
                    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                        {shipSunkMessage}
                    </div>
                )}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-7xl">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Battleship Game</h2>
            <div class="mb-6 text-center">
                <p class="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Current Turn: {gameState.current_turn === playerId ? 'Your Turn' : "Opponent's Turn"}
                </p>
                {attackResult && (
                    <div class={`font-bold mt-2 ${attackResult === 'Hit!' ? 'text-red-600' : 'text-blue-600'}`}>
                        {attackResult}
                    </div>   
                )}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Board</h3>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow max-w-[480px] mx-auto">
                        {renderBoard(myBoard, false)}
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enemy Board</h3>
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow max-w-[480px] mx-auto">
                        {renderBoard(enemyBoard, true)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default Game;