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

function fetchWord(singlecall, index) {
    try {
        http.get({
            host: "random-word-api.herokuapp.com",
            path: "/word/",
            headers: {
                "content-type": "application/json"
            }
        }, function (response) {
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
                body = body.substring(body.indexOf('["') + 2, body.indexOf('"]'));
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