import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paddle, Ball, Brick, PowerUp } from "./BrickEngine.js";
import Leaderboard from "../Leaderboard/Leaderboard.jsx";
import CommentsSection from "../CommentsSection/CommentsSection.jsx";

// Level Blueprints for System Architecture
// 0 = Empty, 1 = Normal, 2 = Hard (2 Hits), 3 = PowerUp (Gold)
const LEVELS = [
  // Level 1: Entry
  [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 3, 1, 1, 3, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Level 2: Medium
  [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 3, 1, 1, 3, 1, 2],
    [2, 1, 1, 2, 2, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ],
  // Level 3: Hard
  [
    [0, 2, 0, 0, 0, 0, 2, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [2, 2, 1, 3, 3, 1, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 0, 2, 2, 0, 2, 0]
  ]
];

function BrickBreaker() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Game State Managers
  const [gameState, setGameState] = useState("playing"); // "playing", "gameover", "victory"
  const [currentLevel, setCurrentLevel] = useState(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const paddle = new Paddle(canvas.width, canvas.height);
    const balls = [new Ball(canvas.width, canvas.height)];
    const powerUps = []; 

    // --- Generate Levels
    const levelMatrix = LEVELS[currentLevel]; // Pull the current level design
    const bricks = [];
    const brickWidth = 80;
    const brickHeight = 20;
    const padding = 10;
    const offsetTop = 60;
    const offsetLeft = 45;
    
    let totalBricks = 0;

    for (let r = 0; r < levelMatrix.length; r++) {
      for (let c = 0; c < levelMatrix[r].length; c++) {
        const type = levelMatrix[r][c];
        if (type > 0) {
          const brickX = c * (brickWidth + padding) + offsetLeft;
          const brickY = r * (brickHeight + padding) + offsetTop;
          bricks.push(new Brick(brickX, brickY, brickWidth, brickHeight, type));
          totalBricks++;
        }
      }
    }

    const keys = {};
    const handleKeyDown = (e) => keys[e.key] = true;
    const handleKeyUp = (e) => keys[e.key] = false;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // HUD
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#FFF";
      ctx.fillText(`Score: ${scoreRef.current}`, 20, 30);
      ctx.fillText(`Level: ${currentLevel + 1}`, canvas.width / 2 - 35, 30);
      ctx.fillText(`Lives: ${livesRef.current}`, canvas.width - 100, 30);

      paddle.update(keys, canvas.width);
      paddle.draw(ctx);

      // Power Ups
      for (let i = powerUps.length - 1; i >= 0; i--) {
        let p = powerUps[i];
        p.update();
        p.draw(ctx);

        if (p.active && p.y + p.radius > paddle.y && p.x > paddle.x && p.x < paddle.x + paddle.width) {
          p.active = false;
          powerUps.splice(i, 1);
          
          if (p.type === "life") livesRef.current++;
          if (p.type === "multiball") {
            balls.push(new Ball(canvas.width, canvas.height));
            balls.push(new Ball(canvas.width, canvas.height));
          }
        } else if (p.y > canvas.height) {
          powerUps.splice(i, 1);
        }
      }

      // Multiple Balls and Collisions
      for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        
        b.update(canvas.width, canvas.height, paddle, () => {
          balls.splice(i, 1); 
        });

        b.checkBrickCollision(bricks, (destroyedBrick) => {
          scoreRef.current += (destroyedBrick.type === 2 ? 20 : 10);
          totalBricks--;
          
          if (destroyedBrick.type === 3) {
             const powerType = Math.random() > 0.5 ? "life" : "multiball";
             powerUps.push(new PowerUp(destroyedBrick.x + destroyedBrick.width / 2, destroyedBrick.y, powerType));
          }

          // Level Advamcement
          if (totalBricks <= 0) {
            window.cancelAnimationFrame(animationId); // Stop current frame
            if (currentLevel + 1 < LEVELS.length) {
              setCurrentLevel(prev => prev + 1); // Triggers useEffect to rebuild next stage
            } else {
              setGameState("victory"); // Finished the final level!
            }
            return; 
          }
        });
        
        b.draw(ctx);
      }

      // Track lives
      if (balls.length === 0 && totalBricks > 0) {
        livesRef.current--;
        if (livesRef.current <= 0) {
          window.cancelAnimationFrame(animationId);
          setGameState("gameover");
          return; 
        } else {
          balls.push(new Ball(canvas.width, canvas.height));
        }
      }

      bricks.forEach((brick) => brick.draw(ctx));

      animationId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, currentLevel]); // Rebuild when level changes

  useEffect(() => {
    if (gameState === "playing") return;
    const savedUser = JSON.parse(localStorage.getItem("User") || "null");
    if (!savedUser) return;
    fetch("/api/leaderboard/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: savedUser.username, gameName: "Brickbreaker", stats: [{ statName: "score", value: scoreRef.current }] })
    }).catch(err => console.error("Failed to submit score", err));
  }, [gameState]);

  // Global Reset Function
  const restartGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    setCurrentLevel(0);
    setGameState("playing");
  };

  const isWin = gameState === "victory";

  // --- Render ---
  return (
    <div className="body">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        {/* Game wrapper */}
        <div className="game" style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#222', padding: '100px 0 40px 0' }}>
          
          {gameState === "playing" ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <h2 style={{ color: 'white', fontFamily: 'sans-serif', marginBottom: '10px' }}>Brick Breaker</h2>
              <canvas ref={canvasRef} width={800} height={600} style={{ border: '4px solid #0095DD', borderRadius: '4px', background: 'black' }} />
              
              {/* Controls and instructions */}
              <div style={{ marginTop: '20px', color: '#ccc', textAlign: 'center', fontFamily: 'monospace', background: '#111', padding: '15px 30px', borderRadius: '4px', border: '1px solid #444' }}>
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}><strong>CONTROLS</strong></p>
                <p style={{ margin: '5px 0' }}>[A] / [D]  or  [◄] / [►] Arrows to move paddle</p>
                <p style={{ margin: '10px 0 5px 0', color: '#FFD700' }}><strong>POWER-UPS</strong></p>
                <p style={{ margin: '0' }}>[L] = Extra Life &nbsp;|&nbsp; [M] = Multi-ball</p>
              </div>

              <button onClick={() => navigate("/")} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>
                Quit to Menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#111', color: 'white', width: '100%' }}>
              <h1 style={{ fontSize: '4rem', marginBottom: '10px', color: isWin ? '#FFD700' : '#FF5733' }}>
                {isWin ? "VICTORY!" : "Game Over"}
              </h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Final Score: {scoreRef.current}</p>
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

        </div>

        {/* Controls */}
        <div style={{
          width: '100%', maxWidth: '820px', margin: '0 auto',
          background: '#1a2332', borderRadius: '12px', padding: '20px 24px',
          color: 'white', boxSizing: 'border-box'
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 600 }}>Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <span style={{ color: '#a0b4c8' }}>Arrow Left / A</span><span>Move Paddle Left</span>
            <span style={{ color: '#a0b4c8' }}>Arrow Right / D</span><span>Move Paddle Right</span>
            <span style={{ color: '#a0b4c8' }}>Gold Brick</span><span>Drops a Power-up</span>
          </div>
        </div>

        {/* Comment section */}
        <div style={{ width: '800px', maxWidth: '90%', marginTop: '20px' }}>
          <CommentsSection gameName="Brickbreaker" />
        </div>

      </div>
    </div>
  );
}

export default BrickBreaker;