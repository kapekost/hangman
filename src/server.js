/*
 main server class,
 put the pieces together,
 configure
 run as main NodeJS
 */
require('./utils/arrayCompatibilityFactory.js')(); //factory for official useful Array function not yet in JS
var Player = require('./utils/PlayerModel.js'); //Player Class for Hangman game
var assets = require('./utils/assetsService.js'); //various useful functions
var gameEvents = require('./utils/gameEvents.js');
var networkEvents = require('./utils/networkEvents.js');
var statEvents = require('./utils/statisticsEvents.js');
var storage = require('node-persist');

var express = require('express');
var parseurl = require('parseurl');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = 8080;
var pathname;

storage.initSync({
    encoding: 'utf8',
    logging: false,  // can also be custom logging function
    continuous: true,
    interval: false,
    ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
},onSuccess );
function onSuccess(){
    console.log('MEMORY Initialised');
}

app.use(function (req, res, next) {
    pathname = parseurl(req).pathname;
    next()
});

var players = (storage.getItem('players')) ? [] : [];
var disconnectedPlayers = (storage.getItem('disconnectedPlayers')) ? [] : [];

http.listen(PORT, function () {
    console.log('HANGMAN\'s server listening on *:%s', PORT);
});

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/hangman.html');
});
app.get('/stats', function (req, res) {
    res.sendFile(__dirname + '/public/stats.html');
});

io.on('connection', register);
function register(connection) {
    if (pathname && pathname.indexOf('stats') !== -1) {

        statEvents.updateStats(io, players);
        return;
    }

    var player = new Player;

    // save the new connection in a holding area
    //remove this if  the client rejects the new GUID and delivers a persisted one
    players.push(player);
    player.socket = connection;
    player.GUID = assets.createGUID();
    player.socket.emit('register', {GUID: player.GUID});
    console.log('a player is connected', player.GUID);

    //set up the Hangman modules for the new player object
    //core modules
    gameEvents(io, player, players);
    networkEvents(io, player, players, disconnectedPlayers);

}


