import GameList from '../components/GameList/GameList.jsx'
import Navigation from '../components/Navigation/Navigation.jsx'
import GlobalLeaderBoard from '../components/GlobalLeaderboard/GlobalLeaderboard.jsx'
import Footer from '../components/Footer/Footer.jsx'
import './HomePage.css';

export default function HomePage() {
    return (
    <div>
        <div className="ticker">
            <div className="ticker-track">
                <p className="ticker-text">Are you ready to test your valor?</p>
                <p className="ticker-text">Who will you become?</p>
                <p className="ticker-text">Can you get the high score?</p>
                <p className="ticker-text">The arcade awaits...</p>
                <p className="ticker-text">Surely you'll fail!</p>
            </div>
        </div>
        <GameList/>
    </div>
    );
}
