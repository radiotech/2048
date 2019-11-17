const onSetup = ()=>{
  // This is the service worker with the Cache-first network

  // Add this below content to your HTML page, or add the js file to your page at the very top to register service worker

  // Check compatibility for the browser we're running this in
  if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
      console.log("[PWA Builder] active service worker found, no need to register");
    } else {
      // Register the service worker
      navigator.serviceWorker
        .register("serviceWorker.js", {
          scope: "./"
        })
        .then(function (reg) {
          console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
        });
    }
  }

}

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  $('#install-button').show();
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

async function install() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    console.log(deferredPrompt)
    deferredPrompt.userChoice.then(function(choiceResult){

      if (choiceResult.outcome === 'accepted') {
      console.log('Your PWA has been installed');
    } else {
      console.log('User chose to not install your PWA');
    }

    deferredPrompt = null;

    });


  }
}




class Game {
  constructor(size) {
    this.size = size;
    this.setupNewGame();
  }

  onMove(callback) {
    this.moveList.push(callback);
  }
  onWin(callback) {
    this.winList.push(callback);
  }

  onLose(callback) {
    this.lostList.push(callback);
  }

  getGameState() {
    return {
      board: this.board,
      score: this.score,
      won: this.won,
      over: this.over
    };
  }

  loadGame(gameState) {
    this.score = gameState.score;
    this.board = gameState.board;
    this.won = gameState.won;
    this.over = gameState.over;
  }

  toString() {
    var result = "";
    for (let line = 0; line < this.size; line++) {
      let start = line * this.size;
      for (let i = 0; i < this.size; i++) {
        let val = this.board[start + i];
        val != 0 ? (val = `[${this.board[start + i]}]`) : (val = `[ ]`);
        result = result + val;
        // process.stdout.write(val);
      }
      result = result + "\n";
      // process.stdout.write("\n");
    }

    return result;
  }

  setupNewGame() {
    this.score = 0;
    this.won = false;
    this.over = false;
    this.board = this.getNewBoard(this.size);
    this.moveList = [];
    this.winList = [];
    this.lostList = [];

    $("#game-board").html(
      this.range(this.size)
        .map(x =>
          this.range(this.size)
            .map(
              y =>
                `<div class="block" style="left: ${x * 25}%; top: ${y *
                  25}%;"><div class="block-inner"></div></div>`
            )
            .join("")
        )
        .join("")
    );
  }

  moveDir(board, dir) {
    let [dx, dy] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[
      dir
    ];
    board = this.copyBoard(board);
    let lastBoard = undefined;
    do {
      lastBoard = this.copyBoard(board);

      switch (dir) {
        case "left":
        case "up":
          for (
            let i = dx == -1 ? 1 : 0;
            i < board.length - (dx == 1 ? 1 : 0);
            i++
          ) {
            for (
              let j = dy == -1 ? 1 : 0;
              j < board.length - (dy == 1 ? 1 : 0);
              j++
            ) {
              let a = board[i][j];
              let b = board[i + dx][j + dy];
              if (a !== undefined) {
                if (b === undefined) {
                  board[i][j] = undefined;
                  board[i + dx][j + dy] = a;
                } else if (
                  a.value === b.value &&
                  a.newValue === undefined &&
                  b.newValue === undefined
                ) {
                  board[i][j] = undefined;
                  board[i + dx][j + dy] = { ...a, newValue: a.value * 2 };
                }
              }
            }
          }
          break;
        case "right":
        case "down":
          for (
            let i = board.length - (dx == 1 ? 2 : 1);
            i >= (dx == -1 ? 1 : 0);
            i--
          ) {
            for (
              let j = board.length - (dy == 1 ? 2 : 1);
              j >= (dy == -1 ? 1 : 0);
              j--
            ) {
              let a = board[i][j];
              let b = board[i + dx][j + dy];
              if (a !== undefined) {
                if (b === undefined) {
                  board[i][j] = undefined;
                  board[i + dx][j + dy] = a;
                } else if (
                  a.value === b.value &&
                  a.newValue === undefined &&
                  b.newValue === undefined
                ) {
                  board[i][j] = undefined;
                  board[i + dx][j + dy] = { ...a, newValue: a.value * 2 };
                }
              }
            }
          }
          break;
      }
    } while (!this.boardsEqual(lastBoard, board));

    let score = 0;
    let values = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        let temp = board[i][j];
        if (temp !== undefined && temp.newValue !== undefined) {
          temp = { id: temp.id, value: temp.newValue };
          values = [...values, temp.value];
          score += temp.value;
        }
        board[i][j] = temp;
      }
    }

    return {
      board,
      score,
      values
    };
  }

  boardsEqual(a, b) {
    return a.every((x, i) => x.every((y, j) => this.squaresEqual(y, b[i][j])));
  }

  squaresEqual(a, b) {
    if (a === undefined && b === undefined) {
      return true;
    }
    if (a !== undefined && b !== undefined) {
      return a.value === b.value && a.id === b.id;
    }
    return false;
  }

  copyBoard(x) {
    return x.map(a => a.map(b => this.copyTile(b)));
  }
  copyTile(x) {
    return x === undefined ? x : { ...x };
  }

  updateScore(num) {
    this.score += num;
  }
  isGameOver() {
    if (
      this.boardsEqual(this.board, this.moveDir(this.board, "left").board) &&
      this.boardsEqual(this.board, this.moveDir(this.board, "right").board) &&
      this.boardsEqual(this.board, this.moveDir(this.board, "up").board) &&
      this.boardsEqual(this.board, this.moveDir(this.board, "down").board)
    ) {
      game.over = true;
      return true;
    } else {
      game.over = false;
      return false;
    }
  }
  move(direction) {
    let beforeMove = this.copyBoard(this.board);
    let moved = this.moveDir(this.board, direction);
    this.board = moved.board;
    game.won = moved.values.includes(2048);
    if (game.won) {
      for (let i = 0; i < this.winList.length; i++)
        this.winList[i](this.getGameState());
    }
    this.updateScore(moved.score);
    if (!this.boardsEqual(beforeMove, this.board)) {
      this.board = this.addRandomTile(this.board);
    } else {
    }

    for (let i = 0; i < this.moveList.length; i++)
      this.moveList[i](this.getGameState());
    if (this.won)
      for (let i = 0; i < this.winList.length; i++)
        this.winList[i](this.getGameState());
    if (!this.won && this.over)
      for (let i = 0; i < this.lostList.length; i++)
        this.lostList[i](this.getGameState());
  }

  range(length) {
    return Array.from({ length }, (_, i) => i);
  }

  getNewBoard(size) {
    return this.addRandomTile(
      this.addRandomTile(
        this.range(size).map(x => this.range(size).map(x => undefined))
      )
    );
  }

  addRandomTile(arr) {
    // console.log(arr);
    let emptySpots = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (arr[i][j] === undefined) {
          emptySpots.push([i, j]);
        }
      }
    }
    if (emptySpots.length === 0) {
      this.over = true;
      return arr;
    }
    let value = Math.random() < 0.9 ? 2 : 4;
    let k = Math.floor(Math.random() * emptySpots.length);
    return arr.map((x, i) =>
      x.map((y, j) =>
        i === emptySpots[k][0] && j === emptySpots[k][1]
          ? {
              value,
              id: Math.floor(Math.random() * 100000000).toString(16)
            }
          : y
      )
    );
  }
}

let game = new Game(4);

$(() => {
  update();
  onSetup();
});

$("#restart").click(function() {
  game.setupNewGame();
  $("#won").css("display", "none");
  $("#over").css("display", "none");
  update();
});
function valToColor(val) {
  let x = {
    0: "#9E9E9E",
    2: "#e3d9c6",
    4: "#FFBC39",
    8: "#f67828",
    16: "#FFDD9A",
    32: "#cb8e00",
    64: "#cb7375",
    128: "#FF7F50",
    256: "#f1dd38",
    512: "#f99a1c",
    1024: "#D2691E",
    2048: "yellow"
  }[val];
  if (x === undefined) {
    return "#ff0080";
  }
  return x;
}
function update() {
  let blocks = $(".tracked-block");
  let drawCell = (block, i, j) => {
    let found = blocks.filter(`#block-${block.id}`);
    // console.log("found : " + block.id);
    if (found.length == 1) {
      blocks = blocks.not(`#block-${block.id}`);
      found.css({ left: `${i * 25}%`, top: `${j * 25}%` });
      let ref = found;
      setTimeout(() => {
        ref.children().text(block.value);
        ref.children().css({ backgroundColor: this.valToColor(block.value) });
      }, 150);
    } else {
      // console.log("else");

      //bringing in the new tile
      $("#game-board").append(
        `<div class="block tracked-block " id="block-${
          block.id
        }" style="left: ${i * 25}%; top: ${j * 25}%;">
            <div class="block-inner" style="background-color: ${this.valToColor(
              block.value
            )}; ">${block.value}
            </div>
          </div>`
      );
    }
  };

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (game.board[i][j] !== undefined) {
        drawCell(game.board[i][j], i, j);
        //ctx.fillText(game.board[i][j].value, 60 + 120 * i, 70 + 120 * j);
      }
    }
  }
  blocks.css({ zIndex: -1 });
  setTimeout(() => {
    blocks.remove();
  }, 200);

  $("#score").html(game.score);
  if (game.isGameOver()) {
    $("#over").css("display", "block");
    return;
  } else if (game.won) {
    $("#won").css("display", "block");
    return;
  }
}

$(document).keydown(function(event) {
  if (game.over || game.won) {
    return;
  }
  let key = event.keyCode ? event.keyCode : event.which;
  switch (key) {
    case 37:
      game.move("left");
      break;
    case 38:
      game.move("up");
      break;
    case 39:
      game.move("right");
      break;
    case 40:
      game.move("down");
      break;
  }
  update();
});

$("#game-board")[0].addEventListener("touchstart", handleTouchStart, {
  passive: false
});
$("#game-board")[0].addEventListener("touchmove", handleTouchMove, {
  passive: false
});

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return (
    evt.touches || evt.originalEvent.touches // browser API
  ); // jQuery
}

function handleTouchStart(evt) {
  evt.preventDefault();

  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  evt.preventDefault();

  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    /*most significant*/
    if (xDiff > 0) {
      /* left swipe */
      game.move("left");
    } else {
      /* right swipe */
      game.move("right");
    }
  } else {
    if (yDiff > 0) {
      /* up swipe */
      game.move("up");
    } else {
      /* down swipe */
      game.move("down");
    }
  }

  update();

  /* reset values */
  xDown = null;
  yDown = null;
}
