import './Game.css';


//game object needs to have: image, name, description, page link.
export default function Game({game}) {

    return (
        <div className="Game">
            <img className="Game-Image" src={game.image} alt = {game.name}/>
            <div className="Game-Content">
                <p className = 'Game-Title'>{game.title}</p>
                <p className="Game-Description">{game.Description}</p>
                <button className="Play-Button">Play</button>
            </div>
        </div>
    )
}