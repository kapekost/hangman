/*
 client Hangman -page script
 */
//local variables
var freeze = false;
var remainingTries;
//receivers
socket.on('updateWord', function (playerData) {
    freeze = false;
    updateHTML('displayWord', playerData.displayWord);
});
socket.on('getNewWord', function (playerData) {
    freeze = false;
    updateHTML('displayWord', playerData.displayWord);
    remainingTries = 10 - playerData.stats.failedTries.length;
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
    updateFields(playerData);
    console.log('status', playerData);
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
    updateHTML('remainingTries', 10 - playerData.stats.failedTries.length);
    updateHTML('score', playerData.stats.score);
}

function updateHTML(elementName, value) {
    document.getElementById(elementName).innerHTML = value;
}
function updateAttr(elementName, attr, value) {
    document.getElementById(elementName).setAttribute(attr, value);
}