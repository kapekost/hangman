/*
 client stats -page logic
 */
socket.emit('updateStats');//notify server: reload
socket.on('updateStats', displayActiveUsers);

var outputDOM = document.getElementById('connectedUsers');
function displayActiveUsers(reply) {
    writeTable(reply);
}

function writeTable(reply) {
    outputDOM.innerHTML = "";
    var i = 0;
    while (i < reply.usersList.length) {
        console.log(reply.usersList[i].details);
        outputDOM.appendChild(createUserLineHTML(reply.usersList[i]));
        i++;
    }
}

function createUserLineHTML(player) {
    var SpanElem;
    var lineDiv = document.createElement('div');
    lineDiv.setAttribute('class', 'well');
    SpanElem = document.createElement('span');

    addNodeInfo("GUID:", player.GUID);
    addNodeInfo("score:", player.gameData.stats.score);
    addNodeInfo("current word:", player.gameData.word.value);
    addNodeInfo("failed tries:", '(' + player.gameData.stats.failedTries.length + ') ' +
        player.gameData.stats.failedTries);
    addNodeInfo("successful tries:", '(' + player.gameData.stats.successfulTries.length + ') ' +
        player.gameData.stats.successfulTries);
    addSpan('info');
    SpanElem.innerHTML = 'History';
    lineDiv.appendChild(SpanElem);
    lineDiv.appendChild(document.createElement('br'));
    var k = 0;
    while (k < player.gameData.history.length) {
        updateHistory(player.gameData.history[k]);
        k++;
    }
    lineDiv.appendChild(document.createElement('hr'));

    function updateHistory(word) {
        addNodeInfo(word.value,word.found,true);
    }

    function addNodeInfo(label, value,isHistory) {
        //if not history add the label field
        if(!isHistory) {
            addSpan('primary')
            SpanElem.innerHTML = label;
            lineDiv.appendChild(SpanElem);
        }
        //if history, change label color to represent the skipped value field
        (isHistory) ?   addSpan(getGreenRed(value)) : addSpan('warning');
        SpanElem.innerHTML = (isHistory) ? label : value;
        SpanElem.appendChild(document.createElement('br'));
        lineDiv.appendChild(SpanElem);
        //get color for history value field (true false)
        function getGreenRed(value){
            return (value) ?  'success':'danger';
        }
    }

    function addSpan(type) {
        SpanElem = document.createElement('span');
        SpanElem.setAttribute('class', 'label label-' + type);
        SpanElem.setAttribute('role', 'alert');
    }

    //  lineDiv.innerHTML = player.details + '<hr/>';
    return lineDiv;
}