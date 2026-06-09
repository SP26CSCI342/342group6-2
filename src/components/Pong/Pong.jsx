import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPaddle, OppPaddle, Ball } from "./PongEngine.js";
import Leaderboard from "../Leaderboard/Leaderboard.jsx";
import CommentsSection from "../CommentsSection/CommentsSection.jsx";


function Pong() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Game State Managers
  const [gameState, setGameState] = useState("playing"); // "playing", "gameover", "victory"
  const userScoreRef = useRef(0);
  const oppScoreRef = useRef(0);


  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const paddle = new UserPaddle("player", canvas.width, canvas.height);
    const oppPaddle = new OppPaddle("opp", canvas.width, canvas.height);
    const ball = new Ball(canvas.width, canvas.height);
    const resetDx = ball.dx;
    const resetDy = ball.dy;
    ball.dx = 0
    ball.dy = 0

    setTimeout(() => {
      ball.dx = resetDx;
      ball.dy = resetDy;
    }, 1000)

    const keys = {};
    const handleKeyDown = (e) => keys[e.key] = true;
    const handleKeyUp = (e) => keys[e.key] = false;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationId;

    const onScore = (side) => {
      if (side === "left"){
        userScoreRef.current++;
        if (userScoreRef.current >= 11){
          setGameState("victory");
          return;
        }
      } else{
        oppScoreRef.current++;
        if (oppScoreRef.current >= 11){
          setGameState("gameover");
          return;
        }
      }
      paddle.reset();
      oppPaddle.reset();

      ball.reset();

      const resetDx = ball.dx;
      const resetDy = ball.dy;
      ball.dx = 0
      ball.dy = 0

      setTimeout(() => {
        ball.dx = resetDx;
        ball.dy = resetDy;
      }, 1000)
            
    };

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // HUD
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#FFF";
        ctx.fillText(`${oppScoreRef.current}`, canvas.width / 2 - 110, 30);
        ctx.fillText(`${userScoreRef.current}`, canvas.width / 2 + 100, 30);

        paddle.update(keys);
        paddle.draw(ctx);
        oppPaddle.update(ball);
        oppPaddle.draw(ctx);
        
        ball.update(paddle, oppPaddle, onScore);
        ball.draw(ctx);
        animationId = window.requestAnimationFrame(render);
    }

    render();
    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") return;
    const savedUser = JSON.parse(localStorage.getItem("User") || "null");
    if (!savedUser) return;
    fetch("/api/leaderboard/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: savedUser.username, gameName: "Pong", stats: [{ statName: "score", value: userScoreRef.current }] })
    }).catch(err => console.error("Failed to submit score", err));
  }, [gameState]);

  // Global Reset Function
  const restartGame = () => {
    userScoreRef.current = 0;
    oppScoreRef.current = 0;
    setGameState("playing");
  };

  const isWin = gameState === "victory";

  // --- UNIFIED RENDER ---
  return (
    <div style={{ background: '#222', paddingBottom: '40px' }}>
      {gameState === "playing" ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <h2 style={{ color: 'white', fontFamily: 'sans-serif', marginBottom: '10px' }}>Pong</h2>
          <canvas ref={canvasRef} width={800} height={600} style={{ border: '4px solid #0095DD', borderRadius: '4px', background: 'black' }} />
          <button onClick={() => navigate("/")} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>Quit to Menu</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'white' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '25px', color: isWin ? '#FFD700' : '#FF5733' }}>
            {isWin ? "VICTORY!" : "Game Over"}
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Your Final Score: {userScoreRef.current}</p>
          <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Opponent's Final Score: {oppScoreRef.current}</p>
          <div style={{ marginBottom: '30px' }}><Leaderboard /></div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={restartGame} style={{ padding: '10px 20px', cursor: 'pointer', background: '#0095DD', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.2rem' }}>
              Play Again
            </button>
            <button onClick={() => navigate("/")} style={{ padding: '10px 20px', cursor: 'pointer', background: '#555', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.2rem' }}>
              Quit to Menu
            </button>
          </div>
        </div>
      )}
      <div style={{
        width: '100%', maxWidth: '820px', margin: '0 auto 0',
        background: '#1a2332', borderRadius: '12px', padding: '20px 24px',
        color: 'white', boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 600 }}>Controls</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <span style={{ color: '#a0b4c8' }}>Arrow Up / W</span><span>Move Up</span>
          <span style={{ color: '#a0b4c8' }}>Arrow Down / S</span><span>Move Down</span>
        </div>
      </div>
      <CommentsSection gameName="Pong" />
    </div>
  );

}

export default Pong;