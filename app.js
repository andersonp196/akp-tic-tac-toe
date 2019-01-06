var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log('Server started.');
//---------------------------------------------------------------------

var SOCKET_LIST = {};
var PLAYER_LIST = {
  x:'',
  o:'',
};

var game = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];
var lastPlayer;

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
  console.log(socket.id + ' connected.');
  SOCKET_LIST[socket.id] = socket;

  if (PLAYER_LIST.x == '') {
    PLAYER_LIST.x = socket.id;
  }else if (PLAYER_LIST.o == '') {
    PLAYER_LIST.o = socket.id;
  }

  socket.on('disconnect', function () {
    delete SOCKET_LIST[socket.id];
    if (socket.id == PLAYER_LIST.x) {
      delete  PLAYER_LIST.x;
    }else if (socket.id == PLAYER_LIST.o) {
      delete  PLAYER_LIST.o;
    }
  });

  socket.on('boxClick', function (data) {
    var fill;
    if (socket.id == PLAYER_LIST.x && lastPlayer != socket.id) {
      game[Math.floor(data.boxId/3)][data.boxId%3] = 'X';
      lastPlayer = socket.id;
    }else if (socket.id == PLAYER_LIST.o && lastPlayer != socket.id) {
      game[Math.floor(data.boxId/3)][data.boxId%3] = 'O';
      lastPlayer = socket.id;
    }

    var play;
    if (socket.id == PLAYER_LIST.x) {
      play = 'X';
    }else if (socket.id == PLAYER_LIST.o) {
      play = 'O';
    }

    //broadcasts to everyone except current socket.id
    io.emit('newFill', {
      game:game,
      lastPlayer:play,
    });
  });

  socket.on('reset', function(newGame) {
    game = newGame;
  });
});
