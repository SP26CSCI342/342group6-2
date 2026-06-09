import { useState, useEffect } from 'react';

function Leaderboard({ setScreen, lastScore }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
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
        if(localStorage.getItem("user"));
      };
      load();
    }, []);


  return (
    <div style={{ color: 'white', padding: 20 }}>
      <p style={{ fontSize: 30 }}>LeaderBoard</p>

      {lastScore !== null && lastScore !== undefined && (
        <p style={{ fontSize: 20 }}>Your last score: {lastScore}</p>
      )}

      <table style={{ margin: '0 auto', fontSize: 20, borderSpacing: '24px 4px' }}>
        <thead>
          <tr><th>Player</th><th>Score</th></tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={index}>
              <td>{player.userName}</td>
              <td>{player.Score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setScreen("start")} style={{ marginTop: 20 }}>
        Back to Menu
      </button>
    </div>
  );
}
export default Leaderboard;