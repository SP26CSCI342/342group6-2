import {useState} from 'react';
import React from 'react'
import './GlobalLeaderboard.css'
import Asteroid from '../GamePlay/sprites/Ship_active.png';
import BrickBreaker from '../GamePlay/sprites/BrickBreaker.png';



const example= {
  userName: "example_Player",
  Score: 2000,
};

const leaderBoardList = [example,example,example,example];


function GlobalLeaderboard({setScreen}) {
  return (
    <div>

    </div>
  );
}
export default GlobalLeaderboard;