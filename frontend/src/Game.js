import React, { useState, useEffect, useRef } from 'react';
import './Game.css';

function Game({ gameData, onGameEnd }) {
    const [gameState, setGameState] = useState(gameData);
    const [placementPhase, setPlacementPhase] = useState(true);
    const [selectedShip, setSelectedShip] = useState(null);
    const [shipPlacements, setShipPlacements] = useState({});
    const [dragOverCell, setDragOverCell] = useState(null);
    const [orientation, setOrientation] = useState('horizontal');
    
    const playerId = localStorage.getItem('playerId');
    const isPlayer1 = gameData.player1.id === playerId;
    const myBoard = isPlayer1 ? gameData.boards.player1_board : gameData.boards.player2_board;
    const enemyBoard = isPlayer1 ? gameData.boards.player2_board : gameData.boards.player1_board;

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

    const renderCell = (x, y, isEnemy = false) => {
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
            if (!placement || isEnemy || !placementPhase) return;
            // Remove all cells for this ship
            const newPlacements = { ...shipPlacements };
            Object.keys(newPlacements).forEach(cellKey => {
                if (newPlacements[cellKey].ship === placement.ship) {
                    delete newPlacements[cellKey];
                }
            });
            setShipPlacements(newPlacements);
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

    const renderBoard = (boardData, isEnemy = false) => {
        const cells = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                cells.push(renderCell(x, y, isEnemy));
            }
        }
        return (
            <div className="board-grid">
                {cells}
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
        // Group cells by ship name
        const shipsToPlace = {};
        for (const key in shipPlacements) {
            const { ship, orientation } = shipPlacements[key];
            if (!shipsToPlace[ship]) shipsToPlace[ship] = { cells: [], orientation };
            shipsToPlace[ship].cells.push(key);
        }
        for (const shipName in shipsToPlace) {
            const { cells, orientation } = shipsToPlace[shipName];
            // Find origin: for horizontal, leftmost x; for vertical, topmost y
            const coords = cells.map(k => k.split(',').map(Number));
            let origin;
            if (orientation === 'horizontal') {
                // Find cell with min x, then min y (should all have same y)
                origin = coords.reduce((min, curr) => (curr[0] < min[0] ? curr : min), coords[0]);
            } else {
                // Find cell with min y, then min x (should all have same x)
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
            const gameId = localStorage.getItem("gameId") || gameState.id || gameState.game_id;
            if (!gameId) {
                alert("no game id found.")
                return;
            }
            const response = await fetch(`/games/${gameId}/place-ship`, {
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
        submitShipPlacements();
        setPlacementPhase(false);
    };

    const allShipsPlaced = () => {
        return placedShips.size === availableShips.length;
    };

    if (placementPhase) {
        return (
            <div className="game-container" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 48, minHeight: 400}}>
                <div style={{flex: '0 0 260px'}}>
                    {renderShipSelector()}
                </div>
                <div style={{flex: 0, marginLeft: 32}}>
                    <h2 style={{ textAlign: 'center' }}>Your Board</h2>
                    <div className="board-outer">
                        {renderBoard(myBoard, false)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8, color: '#555', fontSize: 14 }}>
                        Tip: Click ships on your board to remove them.
                    </div>
                </div>
                {allShipsPlaced() && (
                    <button onClick={startGame} className="start-game-btn" style={{position: 'absolute', left: 60, bottom: 60}}>
                        Start Game
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="game-container">
            <h2>Battleship Game</h2>
            <div className="game-status">
                <p>Current Turn: {gameState.current_turn === playerId ? 'Your Turn' : 'Opponent\'s Turn'}</p>
            </div>
            <div className="boards-container">
                <div className="board-section">
                    <h3>Your Board</h3>
                    <div className="board-outer">
                        {renderBoard(myBoard, false)}
                    </div>
                </div>
                <div className="board-section">
                    <h3>Enemy Board</h3>
                    <div className="board-outer">
                        {renderBoard(enemyBoard, true)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;