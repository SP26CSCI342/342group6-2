require("dotenv").config();
const express = require("express");
const cors = require("cors")
const mongoose = require("mongoose");
const {Schema} = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:5173",                       // dev
    "https://342group6.vercel.app/",          // <-- your Vercel URL (after Step D)
    /\.vercel\.app$/,                              // optional: preview branches
  ],
  credentials: true,
}));
app.use(express.json());

try{
mongoose.connect(process.env.MONGO_URL);

} catch(err) {
    console.log(err);
}

const stat = new mongoose.Schema({
    statName:{
        type: String,
        minLength: 3,
        trim: true,
        required: true
    },
    value: {type: Number}
});

const gameStats = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    stats: {
        type: [stat],
        required: true
    },
    rating: {
        type: Number,
    }
});

const comment = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        minLength: 1
    },
    postTime: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number
    }
});

const playerSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 5
      },
      email: {
        type: String,
        unique:true,
        lowercase: true,
        trim: true,
        required: true
      },
      password: {
        type: String,
        required: true,
        minLength: 32,
      },
      friends: [String],
});

const gameSchema = new mongoose.Schema({
    gameName: {
        type: String,
        minLength: 1,
        trim: true,
        required: true,
        unique: true
    },
    comments: {
        type: [comment]
    },
    gameStats: {
        type: [gameStats]
    },
    totalClicks: {
        type: Number,
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numRatings: {
        type: Number,
        default: 0
    }
});


const Player = mongoose.model('Player',playerSchema);
const Games = mongoose.model('Game',gameSchema);

function validateRegistration({username, email, password}) {
    if(!username || username.trim().length < 5) {
        return "username length must be 5 at minimum"
    }
    if(email === undefined || email.match(/.+@.+\..+/) == null) {
        return 'email must be in format text@text.text';
    }
    if(password === undefined || password.length < 8) {
        return 'password length must be 8 at minimum'
    }
    return '';
};

function findUser(element,username) { return element.username == username}

function removeFriend({player, friendName}) {
    const findFriend = (element) => element == friendName;
    let index = player.friends.findIndex(findFriend);
    if(index >= 0) {
        player.friends.splice(index,1);
    }
    return player
}

//registers a user
app.post("/api/user/register", async (req,res) => {
    const {username,email,password} = req.body;
    const err = validateRegistration({username, email, password});
    if(err) {
        return res.status(400).json({error: err})
    }
    
    if(await Player.findOne({username}) || await Player.findOne({email})) {
        return res.status(409).json({error: 'Username  or email already exists'})
    }

        try {
        const passHash = await bcrypt.hash(password,10);
        await Player.create({username,email,password: passHash});
        const player = await Player.findOne({username});
        const token = await jwt.sign({id: player._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        return res.status(209).json({
            message: "Registration succesful.",
            user: {username: player.username, email: player.email},
            token: token,
        });

    } catch(error) {
        console.error("Login error:", error);
        return res.status(500).json({error: 'Server error.'});
    }
});

//logs a user in
//response contains {username, email, friends, [stat] an array of stats, each stat has a stat.statName, and a stat.value}
app.post("/api/user/login",async (req,res) => {
    console.log("loggin in")
    const {username, password} = req.body;
    if(!username || !password) {
        return res.status(400).json({error: "Username and password are incorrect."});
    }
    try {
        const player = await Player.findOne({username});
        if(!player || !(await bcrypt.compare(password, player.password))) {
            return res.status(409).json({
                error: "Username or password are incorrect",
            });
        }
        let scores = [];
        //array of games played by user
        const games = await Games.find({'gameStats.username': username}, 'gameName gameStats')
        for(i in games) {
            const game = games[i]
            const stats = game.gameStats.find((element) => element.username == username)
            scores.push({gameName: game.gameName, stats: stats.stats});
        }
        const token = await jwt.sign({id: player._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({
            message: "Login successful.",
            user: {username: player.username, email: player.email, friends: player.friends, gameResults: scores},
            token: token,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({error:"Server error."});
    }
});

// logs user out
app.post("/api/user/logout", async (req,res) => {
    if(!req.headers.authorization) {
        return res.status(401).json({error: "Missing or invalid token."})
    }
    const auth = req.headers.authorization;
    const authArr = auth.split(" ");

    if(authArr[0] != "Bearer") {
        return res.status(401).json({error: "Missing or invalid token."})
    }
    return res.status(200).json({message: "Logged out."});
});

// updates user scores, the body should include player username, a valid token, the game name
// body should be in JSON and use following format database requires these names, a
// {"username": "<username>", "gameName": "<name>","stats": [{"statName": "<name>", "value": <value>}]}

app.post("/api/leaderboard/update", async (req,res) => {

    try{
        const {username,gameName,stats} = req.body
        if(!username || !gameName|| !stats) {
            return res.status(400).json({error: "missing username gameName, or game stats"});
        }

        const player = await Player.findOne({username});
        if(!player) {
            return res.status(404).json({
                error: "Invalid username.",
            });
        }

        const hasPlayer = (element) => element.username == username;

        //find game that player played
        const game = await Games.findOne({gameName})
        if(!game) {
            return res.status(404).json({error: "game not found"})
        }

        //check if user has previously played game
        const index = game.gameStats.findIndex(hasPlayer);
        if(index > -1) {
            const playerStats = game.gameStats[index] // get array of game stats
            stats.forEach((element) => {
                const gameStats = (next) => next.statName == element.statName;
                let i = playerStats.stats.findIndex(gameStats);

                if(i < 0) {
                    playerStats.stats.push(element);
                } else if(element.value > playerStats.stats[i].value){
                    playerStats.stats[i].value = element.value;
                }
        });
            game.gameStats[index] = playerStats;
        } else {//player has never played this game before, and we should save all stats

            const newStats = {username: username, stats: stats}
            game.gameStats.push(newStats);
        }
        await game.save();
        return res.status(200).json({message: "player scores updated"})
    } catch(err) {
        console.log(err);
        return res.status(401).json({message: "error updating scores"});
    }
});


// retreives leader board information, body should contain a game name,
// sever will return the scores for all players for that game if an array of users is given it will find the stats array for each provided user
app.post("/api/leaderboard",async (req,res) => {
    const {gameName, players} = req.body;
    if(!gameName || !players) {
        return res.status(409).json({error: 'no game provided, must provide empty array at minimum.'});
    }
    try {
        const leaderboard = await Games.findOne({'gameName':gameName}, 'gameStats');
        if(!leaderboard) {
            return res.status(404).json({error: "game not found."});
        }
        const playerScores = []
        if(players.length > 0) {
            for(i in players) {
                const user = players[i]
                const stats = leaderboard.gameStats.find((element) => element.username == user)
                if(stats) {
                    playerScores.push({username: user, stats: stats});
                }
            }
            return res.status(200).json({leaderboard: playerScores});
        }
        return res.status(200).json({message: "got leaderboard", leaderboard: leaderboard});
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: "failed to get leaderboard"});
    }
});

//adds a friend to a user, returns friend list
app.post("/api/friends/add", async (req, res) => {
    const {username,friendName} = req.body
    const findFriend = (element) => element == friendName;
    try {
        player = await Player.findOne({username});
        if(Player.findOne({friendName}) && player.friends.findIndex(findFriend) < 0) {
            player.friends.push(friendName);
            await player.save();
        } else {
            return res.status(209).json({error: "player already in friends list, or doesn't exist"});
        }

    } catch(err) {
        console.error(err);
        return res.status(409).json({error : "problem adding friend"});
    }
    return res.status(200).json({message: "player added successfully", friends: player.friends})
}); 

//removes a friend from a user, returns new friend list
app.post("/api/friends/remove", async (req,res) => {
    const {username,friendName} = req.body
    const findFriend = (element) => element == friendName;
    if(!username || !friendName) {
        return res.status(400).json({error: "missing username or friendName"});
    }

    removeFriend(username,friendName);

    return res.status(200).json({message : "friend removed successfully.", friends: player.friends})
});

//retreives game information for requested game
app.get("/api/game", async (req,res) => {
    const {gameName} = req.body;
  
    if(!gameName) {
        return res.status(400).json({error: "no game name provided"});
    }
    const game = await Games.findOne({gameName});
    console.log("game is",game.gameName);
    if(!game) {
        return res.status(404).json({error: "game not found."});
    }

    return res.status(200).json({message: "retreived game info", gameName: game.gameName,comments: game.comments, gameStats: game.gameStats, totalClicks: game.totalClicks});
});

//retreives comments for requested game
app.post("/api/game/comments", async (req,res) => {
    const {gameName} = req.body;
    if(!gameName) {
        console.log("no game name provided.");
        return res.status(404).json({error: "no game name provided."});
    }
    const game = await Games.findOne({gameName});
    if(!game) {
        console.log("game not found.")
        return res.status(404).json({error: "game not found."});
    }
    const comments = game.comments
    return res.status(200).json({message: "retreived comments", comments: comments})
});

//adds comment to comment array for chosen game
app.post("/api/game/comments/add", async (req,res) => {
    const {username,gameName, message,rating} = req.body;

    if(!gameName || !username, !message) {
        console.log("missing input")
        return res.status(404).json({error: "no game name, username, or message provided."});
    }

    const game = await Games.findOne({gameName});

    if(!game) {
        console.log("game not found")
        return res.status(404).json({error: "game not found."});
    }

    const player = await Player.findOne({username});
    if(!player) {
        console.log("user not found")
        return res.status(404).json({error: "user not found."});
    }

    const comment = {username: player.username, message: message, rating: rating};
    game.comments.push(comment);
    await game.save();
    return res.status(200).json({message: "added comment", comments: game.comments})
});

// changes rating, and calculates game rating, then returns new rating, and the new average rating
// players should not be able to rate the game until they have played it

app.post("/api/game/rate", async (req,res) => {
    const {username,gameName, rating} = req.body;

     if(!gameName || !username, !rating) {
        return res.status(404).json({error: "no game name, username, or rating provided."});
    }
    const game = await Games.findOne({gameName});
    if(!game) {
        return res.status(404).json({error: "game not found."});
    }
    const player = await Player.findOne({username});
    if(!player) {
        return res.status(404).json({error: "user not found."});
    }
    const hasPlayer = (element) => element.username == username;
    const index = game.gameStats.findIndex(hasPlayer);
        if(index > -1) {
            const playerStats = game.gameStats[index] // get array of game stats
            if(playerStats.rating > 0) {
                let averageRating = game.averageRating;
                game.averageRating = ((averageRating*game.numRatings - playerStats.rating) + rating)/game.numRatings;
                playerStats.rating = rating;
            } else {
                game.averageRating = (game.averageRating*game.numRatings + rating)/(game.numRatings+1);
                game.numRatings += 1;
                playerStats.rating = rating;
            }
            game.gameStats[index] = playerStats;
            await game.save()
            return res.status(200).json({message: "rating changed", averageRating: game.averageRating,rating: rating})
        } 
            return res.status(403).json({error: "you must play the game before you can rate it."})
    
});

// run this to populate your arrays 
app.post("/api/games/add", async (req,res) => {
    await Games.create({gameName: 'Asteroids',totalClicks: 0});
    await Games.create({gameName: 'Pong',totalClicks: 0});
    await Games.create({gameName: 'Brickbreaker',totalClicks: 0});
    await Games.create({gameName: 'Pacman',totalClicks: 0});
    await Games.create({gameName: 'Snake',totalClicks: 0});
    await Games.create({gameName: 'Tetris',totalClicks: 0});
    await Games.create({gameName: 'Minesweeper',totalClicks: 0});
    await Games.create({gameName: 'Frogger',totalClicks: 0});
    return res.status(200).json({message : "database populated"})
});

app.post("/api/user/remove", async (req,res) => {
    const {username} = req.body;
    if(!username) {
        return res.status(404).json({error: "no user provided"})
    }
    if(!req.headers.authorization) {
        return res.status(401).json({error: "Missing or invalid token."})
    }

    const auth = req.headers.authorization;
    const authArr = auth.split(" ");
    if(authArr[0] != "Bearer") {
        return res.status(401).json({error: "Missing or invalid token."})
    }
    //get player and their friends, and remove player
    const player = await Player.findOne({username});
    if(player == null) {
        return res.status(404).json({error: "player does not exist"})
    }
    const friends = player.friends;
    await Player.deleteOne({username: player.username});
    //remove user from game stats and comments
    const games = await Games.find({'gameStats.username': username})
        for(i in games) {
            let index = games[i].gameStats.findIndex((element) => findUser(element,username))
            games[i].gameStats.splice(index,1);
            index = games[i].comments.findIndex((element) => findUser(element,username))
            while(index >= 0) {
                games[i].comments.splice(index,1)
                index = games[i].comments.findIndex((element) => findUser(element,username))
            }
            await games[i].save()
        }
    //remove use from the friendslist of the friends
    for(i in friends) {
        const friend = await Player.findOne(friends[i]);
        friend = removeFriend(friend,username)
        await friend.save()
    }
    
    return res.status(200).json({message: "account removed."});
});

// server.js — add anywhere in your routes section
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1,
  });
});

app.use((req,res) => {
    return res.status(404).json({
        error: "Route not found.",
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT,() => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
