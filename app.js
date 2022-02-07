/*

SERVEUR

*/

// GLOBAL
global.games = [];

// MODULES
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var session = require('express-session');

app.set('view engine','ejs');


//MIDDLEWARES
app.use('/assets',express.static('public'));
app.use(express.static('socket.io'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('trust proxy', 1)
app.use(session({secret: 'trolol',resave:false,saveUninitialized:true,cookie:{secure:false}}));

// ROUTES
app.use('/', require('./routes/index'));
app.use('/puissance4', require('./routes/puissance4'));


server = app.listen(8080);
global.io = require('socket.io')(server);

io.on('connection',(socket) => {
    socket.on('play', (res) => {
        let end = (games[res.gameid] && res.playerid == games[res.gameid].game.next) ? games[res.gameid].game.play(res.column,io) : false;
        if(end) delete games[res.gameid];
    });
});
