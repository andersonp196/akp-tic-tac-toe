var socket = io();
var boxes = document.getElementsByClassName('box');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
];

async function checkWin(game) {
  var won = false;
	for (var i = 0; i < winCombos.length; i++) {
    let spot = winCombos[i];
    if (game[Math.floor(spot[0]/3)][spot[0]%3] != '' && game[Math.floor(spot[0]/3)][spot[0]%3] == game[Math.floor(spot[1]/3)][spot[1]%3] && game[Math.floor(spot[1]/3)][spot[1]%3] == game[Math.floor(spot[2]/3)][spot[2]%3]){
      if (document.getElementById('p'+spot[0]).innerHTML == 'O') {
        boxes[spot[0]].style.backgroundColor = 'blue';
        boxes[spot[1]].style.backgroundColor = 'blue';
        boxes[spot[2]].style.backgroundColor = 'blue';
        await sleep(1);
        alert('O WINS!');
      }
      else {
        boxes[spot[0]].style.backgroundColor = 'red';
        boxes[spot[1]].style.backgroundColor = 'red';
        boxes[spot[2]].style.backgroundColor = 'red';
        await sleep(1);
        alert('X WINS!');
      }
      for (ps of document.getElementsByClassName('boxText')) {
        ps.innerHTML = '';
      }

      won = true;
    }
  }
  if (!won) {
    var empty = 0;
    for (ps of document.getElementsByClassName('boxText')) {
      if (ps.innerHTML == '') {
        empty++;
      }
    }
    if (empty == 0) {
      for (box of boxes) {
        box.style.backgroundColor = 'green';
      }
      await sleep(1);
      alert('TIE!');
      return true;
    }
    else {
      return false;
    }
  }
  else {
    return true;
  }
}

function onClicks() {
  for (var i = 0; i < 9; i++) {
    boxes[i].addEventListener('click', function () {
      if (document.getElementById('p'+String(this.getAttribute('id'))).innerHTML == '') {
        socket.emit('boxClick', {
          boxId:String(this.getAttribute('id')),
        });
      }
    });
  }
}

function updateGame(game) {
  for (var i = 0; i < 9; i++) {
    document.getElementById('p'+i).innerHTML = game[Math.floor(i/3)][i%3];
  }
}

socket.on('newFill', async function(data) {
  //right now, when one user closes an alert, it erases board for all users
  //and user who close prompt cant play untill other user closes alert

  //also, sometimes only one user has red/blue/green
  updateGame(data.game);
  if (data.lastPlayer == 'X') {
    document.getElementById('turn').innerHTML = "O's turn";
  }else {
    document.getElementById('turn').innerHTML = "X's turn";
  }

  await sleep(250);
  const won = await checkWin(data.game);
  if (won == true) {
    console.log('here');
    for (box of boxes) {
      box.style.backgroundColor = '';
    }
    console.log('here2');
    var newGame = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    updateGame(newGame);
    socket.emit('reset', newGame);
  }

});

onClicks();
