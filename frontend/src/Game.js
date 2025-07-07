import React, { useState, useEffect, useRef } from 'react';

function Game({gameData, onGameEnd}){
    const [gameState, setGameState] = useState(gameData);
    const [selectedShip, setSelectedShip] = useState(null)
    const [shipPlacements, setShipPlacements] = useState({});
    const [orientation, setOrientation] = useState('horizontal');

    const playerId = localStorage.getItem('playerID');
    const isPlayer1 = gameData.player1.id === playerId;
    const myBoard = isPlayer1 ? gameData.boards.player1_board : gameData.boards.player2_board;

    const available_ships = [
        {name: 'carrier', size: 5, color: 'FF6B6B'},
        {name: 'battleship', size: 4, color: '4ECDC4'},
        {name: 'curiser', size: 3, color: '45B7D1'},
        {name: 'destroyer', size: 2, color: '96CEB4'},
        {name: 'submarine', size: 2, color: 'FFEEAA7'}
    ];

    const handleShipSelect = (ship) => {
        setSelectedShip(ship);
    }

    const handleOrientationChange = () => {
        setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
    }

    const canPlaceShip = (ship, x, y, orientation) => {
        const size = ship.size;

        if (orientation === 'horizontal') {
            if (x + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (shipPlacements[`${x+i},${y}`]) return false;
            }
        } else {
            if (y + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (shipPlacements[`${x},${y+1}`]) return false;
            }
        }

        return true;
    }

    const placeShip = (ship, x, y, orientation) => {
        if (!canPlaceShip(ship, x, y, orientation)) return false;

        const newPlacements = {...shipPlacements };
        const size = ship.size;

        if (orientation === 'horizontal') {
            for (let i = 0; i < size; i++){
                newPlacements[`${x+i},${y}`] = {ship: ship.name, color: ship.color };
            }
        } else {
            for (let i = 0; i < size; i ++) {
                newPlacements[`${x},${y+i}`] = {ship: ship.name, color: ship.color };
            }
        }

        setShipPlacements(newPlacements);
        return true;
    };

    

}