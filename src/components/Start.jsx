import "./App/App.css";
import playButton from "./play_button.png";
import playerButton from "./player_info.png";
import leaderBoard from "./leader_board.png";
import moon from "./moon.png";


function Start({setScreen}) {
  return (
    <div>
        <h1>Asteroids</h1>
        <div className="buttonRow">
            <button className="button" onClick={() => setScreen("game")}> 
                <span className="buttonText">Start Game</span>
                <img src={playButton} alt="Play" />
            </button>

            <button className="button" onClick={() => setScreen("playerInfo")}> 
                <span className="buttonText">Player Info</span>
                <img src={playerButton} alt="Player Info" />
            </button>

            <button className="button" onClick={() => setScreen("leaderboard")}> 
                <span className="buttonText">Leaderboard</span>
                <img src={leaderBoard} alt="Leaderboard" />
            </button>
        </div>
        <img src={moon} alt="moon" className="moon"/>
    </div>
  );
}

export default Start;

