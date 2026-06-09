import Game from '../Game/Game.jsx';
import { Link } from 'react-router-dom';

import asteroidImage from '../GamePlay/sprites/Ship_active.png';
import brickImage from '../GamePlay/sprites/BrickBreaker.png';
import pongImage from '../GamePlay/sprites/pong_btn_image.png';
import lineImage from '../white_line.png';
import Outoforder from '../GamePlay/sprites/OutOfOrder.png';


import './GameList.css'

function GameList() {

    const games = [
        {
            title: 'Asteroids',
            image: asteroidImage,
            gameLink: '/asteroids',
            Description: "Fly. Shoot. Destroy. Survive."
        },
        {
            title: 'Pong',
            image: pongImage,
            gameLink: '/pong',
            Description: "One bar against another, who will win?"

        },
        {
            title: 'Brickbreaker',
            image: brickImage,
            gameLink: '/brickbreaker',
            Description: "All that stands between you and victory is... a wall of bricks?"
        },
        {
            title: 'Pacman',
            image: Outoforder,
            gameLink: '/PageNotFound',
            Description: "WAKA WAKA WAKA"
        },
        {
            title: 'Snake',
            image: Outoforder,
            gameLink: '/PageNotFound',
            Description: "Eat em up! How long can you get?"
        },
        {
            title: 'Tetris',
            image: Outoforder,
            gameLink: '/PageNotFound',
            Description: "Hope youre good at puzzles"
        },
        {
            title: 'Minesweeper',
            image: Outoforder,
            gameLink: '/PageNotFound',
            Description: "Watch your step!"
        },
        {
            title: 'Frogger',
            image: Outoforder,
            gameLink: '/PageNotFound',
            Description: "Why did the... nevermind"
        },
    ];

    return (
        <div>
            <nav className="game-row">
                {games.map((game) => (
                    <Link key={game.title} to={game.gameLink} className="game-link">
                        <Game game={game} />
                    </Link>
                ))}
            </nav>          
        </div>

    );
}

export default GameList;