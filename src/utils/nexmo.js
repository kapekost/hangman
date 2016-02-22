    var https = require('https');
    var API_KEY = 'API_KEY';
    var API_SECRET = 'API_SECRET';
    var FROM_NUMBER = 'HANGMAN';
    var receiver;

    function attachNexmo(player) {


        player.socket.on('sendCheat', sendCheat);

        function sendCheat(phoneNumber) {
            receiver = phoneNumber.value;

            var data = JSON.stringify({
                api_key: API_KEY,
                api_secret: API_SECRET,
                to: receiver,
                from: FROM_NUMBER,
                text: 'The word you are looking for is: -- ' + player.gameData.word.value + ' -- powered by - '
            });

            var options = {
                host: 'rest.nexmo.com',
                path: '/sms/json',
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            var req = https.request(options);
            req.write(data);
            req.end();
            var responseData = '';
            req.on('response', function (res) {
                res.on('data', function (chunk) {
                    responseData += chunk;
                });
                res.on('end', function () {
                    console.log(JSON.parse(responseData));
                });
            });
        }
    }
    module.exports = attachNexmo;