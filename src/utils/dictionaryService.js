/**
 * Created by kapek on 23/12/2015.
 */
var maxWords = 10;
var store = [];
var index = 0;
var http = require('http')
function fetchNewWord() {
    fetchWord(true);
}
function Words() {
    setInterval(function () {
        if (index > maxWords) {
            clearInterval(this)
        }
        fetchWord(false, index);
        index++;
    }, 500);
}
//alternative source
//TODO: To be added in fail callbacks
//host: "randomword.setgetgo.com",
//path: "/get.php"
function fetchWord(singlecall, index) {
    try {
        http.get({
            host: "creativitygames.net",
            path: "/random-word-generator/singleword/"
        }, function (response) {
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
                //small hack for the data we get from the second url
                body = body.substring(body.indexOf('>') + 1, body.length);
                if ((body && singlecall) || body && (!singlecall && index < maxWords)) {
                    (singlecall) ? store.push(body) : store[index] = body;
                }
            });
            response.on('error', function (error) {
                console.log('resp error: ', error);
            });
        });
    } catch (ex) {
        console.log(ex);
    }
}
module.exports.Words = Words;
module.exports.fetchNewWord = fetchNewWord;
module.exports.data = {
    store: store,
    length: store.length
};