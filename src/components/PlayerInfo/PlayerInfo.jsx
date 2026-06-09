function PlayerInfo({ setScreen }) {
  return (
    <div style={{ color: 'white', padding: 20 }}>
      <p>Should add player profile to this screen later</p>
      <button onClick={() => setScreen("start")} style={{ marginTop: 20 }}>
        Back to Menu
      </button>
    </div>
  );
}
export default PlayerInfo;