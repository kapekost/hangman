/*
 general client side handshake script
 manage GUID, notify in case of an existing session
 */
var socket = io();
socket.on('connect', connect);
socket.on('close', close);
socket.on('register', register);

function connect() {
    console.log('connection open');
    if (sessionStorage.GUID) {
        socket.emit('restoreGUID', {GUID: sessionStorage.GUID});//notify server: reload
    }
}

function register(player) {
    if (!sessionStorage.GUID && player.GUID) {
        sessionStorage.GUID = player.GUID;
    }
}