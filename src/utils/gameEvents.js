/*
 game related events,
 process the in-game commands and ask the player object to populate
 the responses
 */
var statsEvents = require('./statisticsEvents.js'); //various useful functions
var storage = require('node-persist');

function attachGameListeners(io, player, players) {

    player.socket.on('getNewWord', getNewWord);
    player.socket.on('pickCharacter', pickCharacter);


    function getNewWord(isRefresh) {
        player.socket.emit('getNewWord',
            (isRefresh.value)
                ? player.updateWord()
                : player.getNewWord());
        storage.setItem(player.GUID, player.gameData);
        return statsEvents.updateStats(io, players);
    }

    function pickCharacter(character) {
        updateWord();
        if (player.processCharacter(character)) {
            updateWord();
            if (player.gameData.word.found) {
                updateWord();
                return player.socket.emit('foundWord');
            }
            return true;
        }

        if (player.gameData.stats.failedTries.length == 10) {
            player.socket.emit('lostWord', player.gameData.word.value);
            player.gameData.displayWord = player.gameData.word.value;
        }
        player.socket.emit('status',
            {
                stats: player.gameData.stats
            });
        return statsEvents.updateStats(io, players);
    }

    function updateWord() {
        //TODO: should be merged
        player.socket.emit('updateWord', player.updateWord());
        player.socket.emit('status',
            {
                stats: player.gameData.stats
            });
        storage.setItem(player.GUID, player.gameData);
        return statsEvents.updateStats(io, players);
    }
}
module.exports = attachGameListeners;