const sfx = {
  killed: new Howl({
    src: "sounds/killed.wav",
  }),
  eat: new Howl({
    src: "sounds/eat.wav",
  }),
  eatGhost: new Howl({
    src: "sounds/eatGhost.wav",
  }),
  loose: new Howl({
    src: "sounds/loose.wav",
  }),
  win: new Howl({
    src: "sounds/win.wav",
  }),
};
const board = ["red", "purple", "orange", "green", "pink", "blue"];
const myBoard = [];
const tempBoard = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 2, 2, 2, 1, 1, 2, 2, 1, 1, 1,
  1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2,
  2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1, 1, 2, 2, 2, 2, 2, 2, 2,
  2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
const controls = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};
const ghosts = [];

const game = {
  x: "",
  y: "",
  h: 50,
  size: 6,
  ghostsNumber: 1,
  dotsNumber: 0,
  active: false,
  rePosGhost: 11,
  dotsEaten: 0,
  level: 1,
};

const player = {
  pos: 32,
  speed: 6,
  cool: 0,
  pause: false,
  score: 0,
  lives: 3,
  GameOver: false,
  winner: false,
  powerUp: false,
  powerCount: 0,
};
const startGame = document.querySelector(".start_btn");
/// event listeners
document.addEventListener("DOMContentLoaded", () => {
  game.grid = document.querySelector(".grid");
  game.pacMan = document.querySelector(".pacman");
  game.pacManEye = game.pacMan.firstElementChild;
  game.pacManMouth = game.pacMan.lastElementChild;
  game.ghost = document.querySelector(".ghost");
  game.ghost.style.display = "none";
  game.ghost.style.opacity = ".9";
  game.score = document.querySelector(".score");
  game.lives = document.querySelector(".live");
  game.H_level = document.querySelector(".level");

  game.grid.style.display = "none";
  game.pacMan.style.display = "none";
});
document.addEventListener("keydown", (e) => {
  if (player.GameOver) return;
  if (e.code in controls) controls[e.code] = true;

  if (!game.active && !player.pause) {
    game.active = true;
    player.play = requestAnimationFrame(move);
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code in controls) controls[e.code] = false;
});

startGame.addEventListener("click", function (e) {
  e.preventDefault();
  buildBoard();
  resetValues();
  createGame();
  game.dotsNumber = document.querySelectorAll(".dot").length;
  updateScoreOnScreen();

  game.grid.style.display = "grid";
  game.pacMan.style.display = "block";
  e.target.style.display = "none";
});

/// main game play
function move() {
  if (!game.active) return;

  player.cool--;
  if (player.cool < 0) {
    isPowerStateAtive();
    displayGhosts();
    let tempPos = player.pos;
    updatePlayerPos();
    let newPlace = myBoard[player.pos];
    newPlace.cellType = updateBoardCells(newPlace.cellType, tempPos);
    player.cool = player.speed;
  }
  if (!game.pause) {
    myBoard[player.pos].append(game.pacMan);
    player.play = requestAnimationFrame(move);
  }
}

const resetValues = () => {
  myBoard.length = 0;
  ghosts.length = 0;
  game.grid.innerHTML = "";
  game.x = "";
  game.dotsEaten = 0;
  if (!player.winner) {
    player.lives = 3;
    player.score = 0;
    game.level = 1;
  } else {
    player.winner = false;
    game.level++;
    game.H_level.innerHTML = ` Level : ${game.level}`;
  }

  game.rePosGhost = 11;

  player.GameOver = false;
};

const GameOver = () => {
  sfx.loose.play();
  pauseGame("Start A new Game");
  game.lives.innerHTML = " 💀: Game Over ☠️";
  game.level = 1;
};
const isPowerStateAtive = () => {
  if (player.powerUp) {
    player.powerCount--;
    if (player.powerCount > 30) game.pacMan.style.backgroundColor = "RED";
    else {
      if (player.powerCount % 2) game.pacMan.style.backgroundColor = "orange";
      else game.pacMan.style.backgroundColor = "lightYellow";
    }
    console.log(player.powerCount);
    if (player.powerCount <= 0) {
      player.powerUp = false;
      console.log("powerDown");
      game.pacMan.style.backgroundColor = "YELLOW";
    }
  }
};
/// create GameBoard and set up

const buildBoard = () => {
  // cleaning old
  tempBoard.length = 0;

  // create the newBoard according to screen
  let boxSize = Math.min(
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );
  game.h = boxSize / game.size - boxSize / (game.size * 20);

  /// 2D board creation
  for (let x = 0; x < game.size; x++) {
    let wallz = 0;

    for (let y = 0; y < game.size; y++) {
      let val = 2;
      wallz--;
      if (wallz > 0 && (x - 1) % 2) val = 1;
      else {
        wallz = Math.floor(Math.random() * (game.size / 2));
      }
      if (x == 1 || x == game.size - 2 || y == 1 || y == game.size - 2) val = 2;
      if (x == game.size - 2) val = 4;
      if (y == 3 && (x == 1 || x == game.size - 3)) val = 3;

      if (x == 0 || x == game.size - 1 || y == 0 || y == game.size - 1) val = 1;
      tempBoard.push(val);
    }
    //game.startGhostPos = tempBoard.length - game.size * 2;
  }
};
function createGame() {
  for (let i = 0; i < game.ghostsNumber; i++) createGhost();
  tempBoard.forEach((cell) => {
    fillCell(cell);
  });
  game.grid.style.setProperty(
    "grid-template-columns",
    "repeat(" + game.size + `,${game.h}px)`
  );

  game.grid.style.setProperty(
    "grid-template-rows",
    "repeat(" + game.size + `,${game.h}px)`
  );
  StartPos();
}
function createGhost() {
  // a copy from original ghost with some changes

  let newGhost = game.ghost.cloneNode(true);
  newGhost.pos = game.rePosGhost;
  newGhost.style.display = "flex";
  newGhost.style.backgroundColor = board[ghosts.length];
  newGhost.name = "Agent" + board[ghosts.length];
  newGhost.defaultColor = board[ghosts.length];

  newGhost.counter = 0;
  newGhost.dx = Math.floor(Math.random() * 2);
  ghosts.push(newGhost);
}
function fillCell(value) {
  const div = document.createElement("div");
  div.classList.add("box");

  if (value == 1) div.classList.add("wall");
  else if (value == 2 || value == 3) {
    const dot = document.createElement("div");
    div.append(dot);
    dot.classList.add(`${value == 2 ? "dot" : "superdot"}`);
  } else if (value == 4) {
    div.classList.add("hideout");
    if (game.rePosGhost == 11) {
      game.rePosGhost = myBoard.length;
    }
  }
  game.grid.append(div);
  myBoard.push(div);
  div.cellType = value;
  //div.idVal = myBoard.length
  div.addEventListener("click", (e) => {});
}

const StartPos = function () {
  player.pause = false;
  let startPlayerPos = 20;
  player.pos = putPlayer(startPlayerPos);
  myBoard[player.pos].append(game.pacMan);
  // ghost position
  //////////// bug solved
  ghosts.forEach((ghost, ind) => {
    // let startGhostPos = game.size + 1 + ind;
    let startGhostPos = game.rePosGhost;
    ghost.pos = putPlayer(startGhostPos);
    myBoard[ghost.pos].append(ghost);
  });
};
const putPlayer = function (pos) {
  if (myBoard[pos].cellType != 1) return pos;

  return putPlayer(pos + 1);
};

/////////////////////////////    Game Play Updates
const updateScore = function (eaten = false) {
  if (eaten) {
    player.lives--;
    if (player.lives == -1) {
      GameOver();
      return;
    }
  } else {
    if (myBoard[player.pos]) {
      sfx.eat.play();
      toggleMouth();
      player.score++;
      game.dotsEaten++;
    }
  }
  updateScoreOnScreen();
  if (game.dotsEaten == game.dotsNumber) winning();
};
const updateScoreOnScreen = () => {
  game.score.innerHTML = `Score : ${player.score}`;
  game.lives.innerHTML = `❤️ : ${player.lives}`;
  game.H_level.innerHTML = `Level : ${game.level}`;
};

const updateBoardCells = (cellType, backValue) => {
  if (cellType == 1 || cellType == 4) player.pos = backValue;
  else if (cellType == 2 || cellType == 3) {
    if (cellType == 2) {
      updateScore();
    } else if (cellType == 3) {
      player.powerCount = 100;
      player.powerUp = true;
    }
    myBoard[player.pos].innerHTML = "";
    cellType = 0;
  }

  return cellType;
};

const resetGame = () => {
  player.pause = true;
  window.cancelAnimationFrame(player.play);
  game.active = false;
  setTimeout(StartPos, 3000);
};
const winning = function () {
  sfx.win.play();
  player.winner = true;
  pauseGame("Great! Continue");
  game.lives.innerHTML = " 🏆😍 Congratulation !!!";
  game.ghostsNumber++;
  if (game.ghostsNumber > 6) game.ghostsNumber = 6;
  game.size += 5;
  if (game.size >= 50) game.size = 40;
};
///// ghosts and player logic
const displayGhosts = () => {
  ghosts.forEach((ghost) => {
    if (!player.powerUp) ghost.style.backgroundColor = ghost.defaultColor;
    else {
      if (player.powerCount % 2) ghost.style.backgroundColor = "teal";
      else ghost.style.backgroundColor = "white";
    }
    myBoard[ghost.pos].append(ghost);
    ghost.counter--;

    let oldPos = ghost.pos;
    if (ghost.counter <= 0) changeDir(ghost);
    else {
      updateGhostPos(ghost, oldPos);
      if (player.pos == ghost.pos) {
        if (player.powerUp) eatGhosts(ghost);
        else {
          sfx.killed.play();
          updateScore(true);
          if (player.lives > 0) resetGame();
          else GameOver();
        }
      }
    }
    // if nxt pos points to a wall don't update
    if (myBoard[ghost.pos].cellType == 1) {
      ghost.pos = oldPos;
      changeDir(ghost);
    }
    myBoard[ghost.pos].append(ghost);
  });
};
const eatGhosts = function (ghost) {
  sfx.eatGhost.play();
  ghost.wait = 50;
  toggleMouth();
  const tempVal = player.powerCount / 10;

  if (tempVal > 0) player.score += tempVal * 10;
  else player.score += 5;
  updateScoreOnScreen();
  ghost.pos = game.rePosGhost;
};
const pauseGame = (mesgBtn) => {
  window.cancelAnimationFrame(player.play);
  game.active = false;
  player.pause = true;
  startGame.style.display = "block";
  startGame.innerHTML = mesgBtn;
};
const updateGhostPos = (ghost, oldPos) => {
  switch (ghost.dx) {
    case 0: // up
      ghost.pos -= game.size;
      break;
    case 1: // down
      ghost.pos += game.size;
      break;
    case 2: // left
      ghost.pos--;
      break;
    case 3: // right
      ghost.pos++;
      break;
  }
  if (ghost.wait > 0) {
    ghost.wait--;
    ghost.pos = putPlayer(game.rePosGhost);
  }
};

const FindDir = (obj) => {
  let XY = [Math.ceil(obj.pos % game.size), Math.floor(obj.pos / game.size)];
  return XY;
};
function changeDir(gohst_L) {
  const GDir = FindDir(gohst_L);
  const PDir = FindDir(player);
  const randomDir = Math.floor(Math.random() * 3); // 0 H 1 V
  if (randomDir < 2) gohst_L.dx = GDir[0] < PDir[0] ? 3 : 2;
  else gohst_L.dx = GDir[1] < PDir[1] ? 1 : 0;

  gohst_L.counter = Math.random() * 10 + 2;
}
function updatePlayerPos() {
  if (controls.ArrowLeft) {
    player.pos--;
    game.pacManEye.style.left = "50%";
    game.pacManMouth.style.right = "65%";
  } else if (controls.ArrowRight) {
    player.pos++;
    game.pacManEye.style.left = "25%";
    game.pacManMouth.style.right = 0;
  } else if (controls.ArrowDown) {
    player.pos += game.size;
    //game.pacMan.style.setProperty("transform", "rotate(89deg)");
  } else if (controls.ArrowUp) player.pos -= game.size;
}

const toggleMouth = () => {
  game.pacManMouth.style.height = "35%";
  setTimeout(() => {
    game.pacManMouth.style.height = "10%";
  }, 100);
};
