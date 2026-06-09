import GamePlay from "..//GamePlay/GamePlay.jsx";
import PlayerInfo from "..//PlayerInfo/PlayerInfo.jsx";
import Leaderboard from "..//Leaderboard/Leaderboard.jsx";
import Start from "../Start.jsx";
import CommentsSection from "../CommentsSection/CommentsSection.jsx";
import { useState } from "react";
function Asteroids() {
  const [screen, setScreen] = useState("start");
  const [user] = useState({ name: "Guest", id: null });
  const [lastScore, setLastScore] = useState(null);

  const handleGameOver = (score) => {
    setLastScore(score);
    setScreen("leaderboard");
    const savedUser = JSON.parse(localStorage.getItem("User") || "null");
    if (!savedUser) return;
    fetch("/api/leaderboard/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: savedUser.username, gameName: "Asteroids", stats: [{ statName: "score", value: score }] })
    }).catch(err => console.error("Failed to submit score", err));
  };

  return(
    <div className="body">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="game">
          {screen === "start" && <Start setScreen={setScreen} user={user} />}

          {screen === "game" && (
            <GamePlay
              setScreen={setScreen}
              user={user}
              onGameOver={handleGameOver}
            />
          )}

          {screen === "leaderboard" && (
            <Leaderboard setScreen={setScreen} lastScore={lastScore} />
          )}
          {screen === "playerInfo" && (
            <PlayerInfo setScreen={setScreen}/>
          )}
        </div>
        <div style={{
          width: '100%', maxWidth: '820px', margin: '0 auto',
          background: '#1a2332', borderRadius: '12px', padding: '20px 24px',
          color: 'white', boxSizing: 'border-box'
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 600 }}>Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <span style={{ color: '#a0b4c8' }}>Arrow Left / A</span><span>Rotate Left</span>
            <span style={{ color: '#a0b4c8' }}>Arrow Right / D</span><span>Rotate Right</span>
            <span style={{ color: '#a0b4c8' }}>Arrow Up / W</span><span>Thrust</span>
            <span style={{ color: '#a0b4c8' }}>Space</span><span>Shoot</span>
          </div>
        </div>
        <CommentsSection gameName="Asteroids" />
      </div>
    </div>
  )
}

export default Asteroids;