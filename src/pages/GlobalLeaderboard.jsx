import { useState, useEffect } from 'react';
import '../components/GlobalLeaderboard/GlobalLeaderboard.css';

const GAMES = ['Asteroids', 'Pong', 'Brickbreaker'];
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
function GlobalLeaderboard() {
  const [gameName, setGameName] = useState('Asteroids');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${baseUrl}/api/leaderboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameName, players: [] }),
        });
        const text = await res.text();
        if (!text) throw new Error('Server returned an empty response.');
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.error || 'Error getting leaderboard.');
        const stats = data.leaderboard?.gameStats ?? [];
        const sorted = stats
          .map(p => ({ username: p.username, score: p.stats?.find(s => s.statName === 'score')?.value ?? 0 }))
          .filter(p => p.score > 0)
          .sort((a, b) => b.score - a.score);
        setLeaderboard(sorted);
      } catch (err) {
        setError(err.message || 'Error getting leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameName]);

  return (
    <div className="LeaderBoardRow">
      <h1 style={{ background: 'linear-gradient(to right, #ffffff, #ffa500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 80, lineHeight: '1', margin: '32px 0 24px' }}>
        ༻❁༺ Leader Board ༻❁༺
      </h1>

      <div className="leaderboard-tabs">
        {GAMES.map(game => (
          <button
            key={game}
            className={`leaderboard-tab${gameName === game ? ' active' : ''}`}
            onClick={() => setGameName(game)}
          >
            {game}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#aaa', margin: '2rem 0' }}>Loading...</p>
      ) : error ? (
        <p style={{ color: '#ff5733', margin: '2rem 0' }}>{error}</p>
      ) : leaderboard.length === 0 ? (
        <p style={{ color: '#aaa', margin: '2rem 0' }}>No scores yet for {gameName}.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, width: '100%', maxWidth: '800px' }}>
          {leaderboard.map((player, index) => (
            <li key={player.username} style={{ width: '100%', marginBottom: '8px' }}>
              <div className={index === 0 ? 'First' : 'Last'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {index === 0 && <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>⊹ ♛ ⊹</span>}
                <span style={{ marginRight: '1rem', opacity: 0.6, minWidth: '2rem' }}>#{index + 1}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{player.username}</span>
                <span style={{ fontWeight: 'bold' }}>{player.score.toLocaleString()}</span>
                {index === 0 && <span style={{ fontSize: '1.5rem', marginLeft: '1rem' }}>⊹ ♛ ⊹</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GlobalLeaderboard;
