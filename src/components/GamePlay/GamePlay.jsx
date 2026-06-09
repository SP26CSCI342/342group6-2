import { useRef, useEffect, useState } from "react";
import { Player, Asteroid } from "./Engine.js";

const STARTING_LIVES = 3;
const STARTING_ASTEROIDS = 4;

function GamePlay({ setScreen, onGameOver }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [wave, setWave] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let running = true;

    const player = new Player(canvas.width, canvas.height);
    let bullets = [];
    let asteroids = [];
    let liveCount = STARTING_LIVES;
    let scoreCount = 0;
    let waveCount = 1;

    const spawnWave = (n) => {
      asteroids = [];
      for (let i = 0; i < n; i++) {
        asteroids.push(new Asteroid(canvas.width, canvas.height));
      }
    };
    spawnWave(STARTING_ASTEROIDS);

    const keys = {};
    const handleKeyDown = (e) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => { keys[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const render = () => {
      if (!running) return;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      player.update(keys);
      const newBullet = player.tryShoot(keys);
      if (newBullet) bullets.push(newBullet);
      player.draw(ctx);

      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw(ctx);
        if (bullets[i].isDead()) bullets.splice(i, 1);
      }

      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.update();
        a.draw(ctx);

        let hit = false;
        for (let j = bullets.length - 1; j >= 0; j--) {
          if (a.collidesWith(bullets[j])) {
            scoreCount += a.scoreValue();
            setScore(scoreCount);
            bullets.splice(j, 1);
            asteroids.splice(i, 1);
            asteroids.push(...a.split());
            hit = true;
            break;
          }
        }
        if (hit) continue;

        if (player.invulnFrames <= 0 && a.collidesWith(player)) {
          liveCount--;
          setLives(liveCount);
          if (liveCount <= 0) {
            running = false;
            if (onGameOver) onGameOver(scoreCount);
            else setScreen("start");
            return;
          }
          player.reset();
        }
      }

      if (asteroids.length === 0) {
        waveCount++;
        setWave(waveCount);
        spawnWave(STARTING_ASTEROIDS + waveCount - 1);
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onGameOver, setScreen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas ref={canvasRef} width={800} height={600} style={{ display: 'block' }} />
      <div style={{
        position: 'absolute', top: 10, left: 12, color: 'white',
        fontFamily: 'monospace', fontSize: 18, textShadow: '0 0 4px black',
      }}>
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>Wave: {wave}</div>
      </div>
      <div style={{
        position: 'absolute', top: 10, right: 12, color: '#aaa',
        fontFamily: 'monospace', fontSize: 12, textAlign: 'right',
      }}>
        <div>Rotate: A / D or ←/→</div>
        <div>Thrust: W or ↑</div>
        <div>Shoot: Space</div>
      </div>
      <button
        onClick={() => setScreen("start")}
        style={{ position: 'absolute', bottom: '10px', right: '10px' }}
      >
        Quit to Menu
      </button>
    </div>
  );
}
export default GamePlay;