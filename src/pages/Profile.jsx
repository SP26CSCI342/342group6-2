import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Profile.css";

function Profile() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("User"));

  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseUrl}api/user/logout`, {
        method: "POST",
        headers: {Authorization: "Bearer " + localStorage.getItem("token")}
      });
    } catch(err) {
      console.error("Logout error:", err);
      setError("error loggin out. please check if the server is down")
    }
    localStorage.removeItem("token");
    localStorage.removeItem("User");
    toast("logged out") + navigate("/");
  };

  const getStat = (game, statName) => {
    const statObj = game.stats.find(
      (s) => s.statName === statName
    );

    return statObj?.value ?? 0;
  };

  return (
    <div className="profile-container">

      {/* PROFILE HEADER */}
      <div className="profile-card">

        <h2 className="profile-title">
          {user.username}
        </h2>

        <p className="profile-email">
          {user.email}
        </p>

        <p className="profile-friends">
          Friends: {user.friends.length}
        </p>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Log out
        </button>

      </div>

      {/* GAME SECTION */}
      <div className="stats-section">

        <h3 className="games-title">
          Game Stats
        </h3>

        <div className="games-grid">

          {user.gameResults.map((game) => (
            <div
              key={game.gameName}
              className="game-card"
            >

              <h3 className="game-title">
                {game.gameName}
              </h3>

              {game.stats.map((stat) => (
                <p key ={stat.statName}>{stat.statName}: {getStat(game, stat.statName)}</p>
              ))}
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Profile;