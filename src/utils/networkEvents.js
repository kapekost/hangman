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
        console.log("player is back, should search for his data");
        player.GUID = restoreGUID.GUID;
        if(storage.getItem(player.GUID)){
            //add an additional date object to make a retention policy for those who left
            player.gameData = storage.getItem(player.GUID);
        }
        disconnectedPlayers.map(function(disconnectedPlayer){
            if(disconnectedPlayer.GUID === player.GUID) {
                player.socket.emit('register', {GUID: player.GUID});
                player.gameData = disconnectedPlayer.gameData;
                disconnectedPlayers.splice(disconnectedPlayers.indexOf(disconnectedPlayer),1);
                return true;
            }
        });

        //players.push(player);
        return false;
    }

    function disconnect(player) {
        var i = 0;
        while (i < players.length) { //find and remove the disconnected player from players
            if (players[i].socket.id === (this.id)) {
                console.log('preserving player\'s data with id: ' + this.id);
                var removedPlayerArray = players.splice(i, 1);
                //add an additional date object to make a retention policy for those who left
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
