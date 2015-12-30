/*
 Player object
 per client communication and data processed to run
 the game logic
 */
var dictionary = require('./dictionaryService.js');
dictionary.Words();

function Player() {
    this.gameData = {
        totalTries:10,
        stats: {
            score: 0,
            failedTries: [],
            successfulTries: []
        },
        history: [],
        displayWord: '',
        word: {
            value: '',
            found: false
        }
    };
    return this;
}

Player.prototype.toString = function () {
    return "current status: score: " + this.gameData.stats.score +
        ", active word: " + this.gameData.displayWord +
        ", for: " + this.gameData.word.value +
        ", correct letters: " + this.gameData.stats.successfulTries +
        ", wrong letters: " + this.gameData.stats.failedTries +
        ", history: " + stringifyHistory(this.gameData.history);
};

Player.prototype.updateWord = function () {

    return {
        stats: this.gameData.stats,
        displayWord: this.gameData.displayWord,
        totalTries: this.gameData.totalTries
    };
};

Player.prototype.getNewWord = function () {
    if (this.gameData.word.value !== '') {
        this.gameData.history.push(this.gameData.word);
        updateScore(this);
    }

    var newWord = fetchWord()//another dictionary source : "randomword.setgetgo.com", "/get.php"

    if (newWord == undefined) {
        this.getNewWord();
        return false;
    }
    var i = 0;
    while (i < this.gameData.history.length) {
        if (this.gameData.history[i].value === newWord) {
            this.getNewWord();
        }
        i++;
    }
    this.gameData.word = {value: newWord, found: false};
    this.gameData.stats.failedTries = [];
    this.gameData.stats.successfulTries = [];
    this.gameData.displayWord =
        this.gameData.word.value.replace(/[a-zA-Z0-9]/g, ' _ ');
    return {
        stats: this.gameData.stats,
        displayWord: this.gameData.displayWord,
        totalTries: this.gameData.totalTries
    };
};

Player.prototype.processCharacter = function (character) {
    this.gameData.word.value = this.gameData.word.value.toLowerCase();
    character = character.toLowerCase();
    //skip characters that are already used (could be applied in client)
    if (!this.gameData.stats.failedTries.includes(character)
        && !(this.gameData.stats.successfulTries.includes(character))
    && this.gameData.totalTries > this.gameData.stats.failedTries.length) {
        if (this.gameData.word.value.indexOf(character) !== -1) {

            //save successful guess and populate RegEx
            this.gameData.stats.successfulTries.push(character);
            var pattern = '[^' + this.gameData.stats.successfulTries.join("|") + ']',
                reg = new RegExp(pattern, "g");
            this.gameData.displayWord =
                this.gameData.word.value.replace(reg, " _ ");

            //check if it was the winning guess
            if (this.gameData.word.value === this.gameData.displayWord) {
                updateScore(this);
                this.gameData.word.found = true;
            }
            return true;
        } else {
            //save to wrong guesses
            this.gameData.stats.failedTries.push(character);
            return false;
        }
    }
};

function updateScore(player) {
    var score = 0;
    player.gameData.history.map(countScore);
    player.gameData.stats.score = score;
    function countScore(word) {
        (word.found) ? score++ : score--;
        if (score < 0) score = 0;
    }
}

function fetchWord() {
    //dictionary was async populated with some words,
    //get one word and a new will replace the one we took
    if (dictionary.data.store.length > 0) {
        var indexToSelect = Math.floor((Math.random() * dictionary.data.store.length));
        var returnWord = dictionary.data.store[indexToSelect];
        dictionary.data.store.splice(dictionary.data.store.indexOf(returnWord), 1);
        dictionary.fetchNewWord();
        return returnWord;
    }
    else {
        return false;
    }
}

//make history array printable for toString() replacement
function stringifyHistory(historyEntries) {
    var historyString = '';
    historyEntries.map(makeString);
    function makeString(history) {
        var wordStatus = (history.found == true) ? 'found' : 'missed';
        historyString += '[' + history.value + ' : ' + wordStatus + '] ';
    }

    return historyString;
}
module.exports = Player;