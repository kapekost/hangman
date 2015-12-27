/*
 shared statistic specific assets
 */
var updateStats = function (io, players) {
    var filteredUsers = players.map(filter);

    function filter(player) {
        return {
            details: player.toString(),
            GUID: player.GUID,
            gameData: player.gameData
        };
    }

    io.emit('updateStats', {'usersList': filteredUsers});
};
module.exports.updateStats = updateStats;