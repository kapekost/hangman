/*
 general network related events,
 handshake and  identify an existing user
 */
var assets = require('./statisticsEvents.js');
var storage = require('node-persist');

function attachConnectionListeners(io, player, players, disconnectedPlayers) {
    player.socket.on('updateStats', updateStats);
    player.socket.on('restoreGUID', restoreGUID);
    player.socket.on('disconnect', disconnect);

    function updateStats() {
        return assets.updateStats(io, players);
    }

    function restoreGUID(restoreGUID) {
        player.GUID = restoreGUID.GUID;
        if (storage.getItem(player.GUID)) {
            //add an additional date object to make a retention policy for those who left
            player.gameData = storage.getItem(player.GUID);
        }
        //avoid duplicate for ready to ping-time-out sockets
        players.map(
            function (playerToRestore) {
                if (playerToRestore.GUID === player.GUID) {
                    players.splice(players.indexOf(player), 1);
                }
            }
        );
        players.push(player);
        disconnectedPlayers.map(function (disconnectedPlayer) {
            if (disconnectedPlayer.GUID === player.GUID) {
                player.socket.emit('register', {GUID: player.GUID});
                player.gameData = disconnectedPlayer.gameData;
                disconnectedPlayers.splice(disconnectedPlayers.indexOf(disconnectedPlayer), 1);
                return true;
            }
        });
        return false;
    }

    function disconnect() {
        var i = 0;
        while (i < players.length) {
            if (players[i].socket.id === (this.id)) {
                var removedPlayerArray = players.splice(i, 1);
                //TODO: add an additional date object to make a retention policy for those who left
                // removedPlayerArray.removedTimestamp = new Date();
                disconnectedPlayers.push(removedPlayerArray[0]);
                //shouldn't need storage as the client keeps the GUID and will find latest data in storage-GUID
            }
            i++;
        }
        return assets.updateStats(io, players);
    }

}
module.exports = attachConnectionListeners;
