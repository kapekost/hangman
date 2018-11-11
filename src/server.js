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
var nexmo = require('./utils/nexmo.js');
var storage = require('node-persist');
var express = require('express');
var parseurl = require('parseurl');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 8080;
var pathname;
var players = [];
var disconnectedPlayers = [];

storage.initSync({
    encoding: 'utf8',
    logging: false,
    continuous: true,
    interval: false,
    ttl: false
});

io.on('connection', register);

app.use(function(req, res, next) {
    pathname = parseurl(req).pathname;
    next()
});

http.listen(PORT, function() {
    console.log('HANGMAN\'s server listening on *:%s', PORT);
});

app.use(express.static(__dirname + '/public'));

function register(connection) {
    var player = new Player;
    if (pathname && pathname.indexOf('stats') !== -1) {
        statEvents.updateStats(io, players);
        return;
    }
    player.socket = connection;
    player.GUID = assets.createGUID();
    player.socket.emit('register', { GUID: player.GUID });

    //set up the Hangman modules for the new player object
    //core modules
    gameEvents(io, player, players);
    networkEvents(io, player, players, disconnectedPlayers);
    nexmo(player);
}