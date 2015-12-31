/*
 client Hangman -page script
 */
//local variables
var freeze = false;
var remainingTries;
var totalTries;
//receivers
socket.on('updateWord', function (playerData) {
    refreshWordAndCounts(playerData);
});
socket.on('getNewWord', function (playerData) {
    refreshWordAndCounts(playerData);
    updateAttr('resultBadge', 'style', 'display:none');

    if (remainingTries <= 0) {
        updateBadge('Fail', 'danger');
    }
    updateFields(playerData);
});
socket.on('foundWord', function () {
    freeze = true;
    updateBadge('Success', 'success');
});
socket.on('lostWord', function (word) {
    freeze = true;
    updateHTML('displayWord', word);
    updateBadge('Fail', 'danger');
});
socket.on('status', function (playerData) {
    remainingTries = totalTries - playerData.stats.failedTries.length;
    updateFields(playerData);
});

//emitters
function getNewWord(isRefresh) {
    //distinguish the initial load
    if (!sessionStorage.GUID) {
        isRefresh = false;
    }
    socket.emit('getNewWord', {value: isRefresh});
}

function pickCharacter(event) {
    //small convenient hook for 'enter' to change word
    if (event.which == 13) {
        getNewWord(false);
    }
    if (
        ((event.which <= 90
        && event.which >= 48) //characters and numbers
        || event.which == 32) //space
        && !freeze) {
        socket.emit('pickCharacter',
            String.fromCharCode(event.keyCode));
    }
}


//helpers

function updateBadge(innerTextValue, labelTypeName) {
    updateHTML('resultBadge', innerTextValue);
    updateAttr('resultBadge', 'class', 'label label-' + labelTypeName);
    updateAttr('resultBadge', 'style', 'display:block');
}

function updateFields(playerData) {
    updateHTML('pickedChars', playerData.stats.failedTries);
    updateHTML('remainingTries', remainingTries);
    updateHTML('score', playerData.stats.score);
    updateGraphic(playerData.stats.failedTries.length, totalTries);
}

function updateHTML(elementName, value) {
    document.getElementById(elementName).innerHTML = value;
}

function updateAttr(elementName, attr, value) {
    document.getElementById(elementName).setAttribute(attr, value);
}
function refreshWordAndCounts(playerData) {

    freeze = false;
    totalTries = playerData.totalTries;
    remainingTries = playerData.totalTries - playerData.stats.failedTries.length;
    updateHTML('displayWord', playerData.displayWord);
}
function updateGraphic(noOfFailedTries, totalTries) {
    var svgElements = document.getElementsByTagName('g')[0];
    svgElements.setAttribute('style', 'display:block');
    var elemnum = Math.round((noOfFailedTries / totalTries) * svgElements.childElementCount);
    var i = 0;
    while (i < svgElements.childElementCount) {
        var display;
        display = (i < elemnum) ?  "block" : "none";
        svgElements.children[i].setAttribute('style', 'display:' + display);
        i++;
    }
}