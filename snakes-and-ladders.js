const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

// Sound effects
const diceRollSound = document.getElementById('diceRollSound');
const snakeSound = document.getElementById('snakeSound');
const ladderSound = document.getElementById('ladderSound');
const winSound = document.getElementById('winSound');

const BOARD_PIXELS = 600;
const boardSize = 10;
const tileSize = BOARD_PIXELS / boardSize;
const playerColors = ["#ff00ff", "#00cfff"];
const playerNames = ["Player 1", "Player 2"];
const playerImages = [
  loadImage("images/player1.png"),
  loadImage("images/player2.png")
];

let currentPlayer = 0;
let playerPositions = [0, 0];
let isAnimating = false;
let animationToken = 0;
let animatedTokenPositions = [null, null];

const snakes = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19,
  64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};

const ladders = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84,
  36: 44, 51: 67, 71: 91, 80: 100
};

// Optional custom art: if absent, a polished canvas-drawn sprite is used.
const snakeSprite = loadImage("images/snake.png");
const ladderSprite = loadImage("images/ladder.png");

function playSound(sound) {
    if (!sound) return;

    sound.currentTime = 0;

    const playback = sound.play();

    if (playback) {
        playback.catch(error => {
            console.warn('Sound playback failed:', error);
        });
    }
}

function stopSound(sound) {
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
}

function loadImage(src) {
  const img = new Image();
  img.src = src;
  img.loaded = false;
  img.onload = () => { img.loaded = true; drawBoard(); };
  img.onerror = () => { img.loaded = false; };
  return img;
}

function getCoords(pos) {
  const rowFromBottom = Math.floor((pos - 1) / 10);
  let col = (pos - 1) % 10;
  if (rowFromBottom % 2 === 1) col = 9 - col;
  return { x: col * tileSize, y: (9 - rowFromBottom) * tileSize };
}

function tileCenter(pos) {
  const p = getCoords(pos);
  return { x: p.x + tileSize / 2, y: p.y + tileSize / 2 };
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Polished alternating tiles with stable colors and subtle inner highlights.
  for (let pos = 1; pos <= 100; pos++) {
    const { x, y } = getCoords(pos);
    const row = Math.floor((pos - 1) / 10);
    const col = (pos - 1) % 10;
    let fill = (row + col) % 2 === 0 ? "#151b35" : "#202747";
    if (pos === 1) fill = "#123d35";
    if (pos === 100) fill = "#4a3b12";

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.strokeStyle = pos === 1 ? "#39ff14" : pos === 100 ? "#ffca3a" : "#00ffea66";
    ctx.lineWidth = (pos === 1 || pos === 100) ? 2.5 : 1;
    ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

    // Soft tile highlight
    ctx.fillStyle = "#ffffff07";
    ctx.fillRect(x + 4, y + 4, tileSize - 8, 2);

    ctx.fillStyle = pos === 1 ? "#9dffad" : pos === 100 ? "#ffe69a" : "#b7c9e8";
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(pos), x + 5, y + 5);

    if (pos === 1) drawTileLabel(x, y, "START", "#39ff14");
    if (pos === 100) drawTileLabel(x, y, "FINISH", "#ffca3a");
  }

  drawSnakesAndLadders();
  drawPlayers();
}

function drawTileLabel(x, y, label, color) {
  ctx.save();
  ctx.font = "bold 8px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.fillText(label, x + tileSize / 2, y + tileSize - 10);
  ctx.restore();
}

function drawSnakesAndLadders() {
  for (const [start, end] of Object.entries(snakes)) {
    drawSnake(Number(start), Number(end));
  }
  for (const [start, end] of Object.entries(ladders)) {
    drawLadder(Number(start), Number(end));
  }
}

function drawSnake(start, end) {
  const a = tileCenter(start);
  const b = tileCenter(end);

  if (snakeSprite.loaded) {
    ctx.save();
    ctx.globalAlpha = 0.88;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.drawImage(snakeSprite, -tileSize * 0.9, -tileSize * 0.25, tileSize * 1.8, tileSize * 0.5);
    ctx.restore();
    return;
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const nx = length ? -dy / length : 0;
  const ny = length ? dx / length : 0;
  const bend = ((start * 13) % 2 === 0 ? 1 : -1) * Math.min(35, length * 0.18);
  const c1 = { x: a.x + dx * 0.33 + nx * bend, y: a.y + dy * 0.33 + ny * bend };
  const c2 = { x: a.x + dx * 0.67 - nx * bend, y: a.y + dy * 0.67 - ny * bend };

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "#b65cff";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#6e2aa8";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#c879ff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
  ctx.stroke();

  for (let t = 0.2; t < 0.9; t += 0.18) {
    const p = cubicPoint(a, c1, c2, b, t);
    ctx.fillStyle = "#f0c8ff";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2.3, 4, Math.atan2(dy, dx), 0, Math.PI * 2);
    ctx.fill();
  }

  const head = a;
  const headAngle = Math.atan2(c1.y - a.y, c1.x - a.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(headAngle);
  ctx.fillStyle = "#e2a7ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#16112b";
  ctx.beginPath();
  ctx.arc(3, -3, 1.8, 0, Math.PI * 2);
  ctx.arc(3, 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
  };
}

function drawLadder(start, end) {
  const a = tileCenter(start);
  const b = tileCenter(end);

  if (ladderSprite.loaded) {
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.drawImage(ladderSprite, -tileSize * 0.8, -tileSize * 0.22, tileSize * 1.6, tileSize * 0.44);
    ctx.restore();
    return;
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const offset = 8;

  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = "#ff9f1c";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#8d4c0b";
  ctx.lineWidth = 7;
  for (const sign of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(a.x + nx * offset * sign, a.y + ny * offset * sign);
    ctx.lineTo(b.x + nx * offset * sign, b.y + ny * offset * sign);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffbd59";
  ctx.lineWidth = 3.5;
  for (const sign of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(a.x + nx * offset * sign, a.y + ny * offset * sign);
    ctx.lineTo(b.x + nx * offset * sign, b.y + ny * offset * sign);
    ctx.stroke();
  }

  const rungCount = Math.max(3, Math.floor(length / 22));
  for (let i = 1; i < rungCount; i++) {
    const t = i / rungCount;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    ctx.strokeStyle = "#ffe0a6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + nx * offset, y + ny * offset);
    ctx.lineTo(x - nx * offset, y - ny * offset);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayers() {
  playerPositions.forEach((pos, index) => {
    const center = animatedTokenPositions[index] || tileCenter(pos);
    const sameTile = playerPositions[0] === playerPositions[1];
    const x = center.x + (sameTile ? (index === 0 ? -10 : 10) : (index === 0 ? -7 : 7));
    const y = center.y + (sameTile ? -2 : 2);
    const img = playerImages[index];

    ctx.save();
    ctx.shadowColor = playerColors[index];
    ctx.shadowBlur = 12;

    if (img.loaded) {
      ctx.drawImage(img, x - 13, y - 17, 26, 34);
    } else {
      ctx.fillStyle = "#080d1c";
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = playerColors[index];
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = playerColors[index];
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function updatePositionText() {
  const p1 = document.getElementById("playerOnePosition");
  const p2 = document.getElementById("playerTwoPosition");
  if (p1) p1.textContent = `Tile ${playerPositions[0]}`;
  if (p2) p2.textContent = `Tile ${playerPositions[1]}`;
}

function setMessage(message) {
  const el = document.getElementById("gameMessage");
  if (el) el.textContent = message;
}


function rollDice() {
  if (isAnimating) return;

  isAnimating = true;
  document.getElementById("rollButton").disabled = true;

  const diceImg = document.getElementById("diceImage");

  // Start the neon rolling animation
  diceImg.classList.remove("dice-result");
  diceImg.classList.add("dice-rolling");

  const diceFaces = [1, 2, 3, 4, 5, 6].map(
    n => `images/dice${n}.png`
  );

  let ticks = 0;

  playSound(diceRollSound);

  const rollInterval = setInterval(() => {
    const face = Math.floor(Math.random() * 6);
    diceImg.src = diceFaces[face];

    ticks++;

    if (ticks >= 10) {
      clearInterval(rollInterval);
      stopSound(diceRollSound);
    }
  }, 100);

  setTimeout(() => {
    clearInterval(rollInterval);
    stopSound(diceRollSound);

    // Calculate and display the final result
    const roll = Math.floor(Math.random() * 6) + 1;
    diceImg.src = diceFaces[roll - 1];

    // Stop shaking and trigger the result animation
    diceImg.classList.remove("dice-rolling");
    diceImg.classList.remove("dice-result");

    // Restart the animation cleanly
    void diceImg.offsetWidth;
    diceImg.classList.add("dice-result");

    // Remove the glow after the reveal finishes
    setTimeout(() => {
      diceImg.classList.remove("dice-result");
    }, 400);

    document.getElementById("diceValue").textContent =
    `${playerNames[currentPlayer]} rolled a ${roll}.`;

    // Continue the existing game
    movePlayer(roll);
  }, 1050);
}



function movePlayer(steps) {
  const start = playerPositions[currentPlayer];
  const target = Math.min(100, start + steps);
  const stepsToMove = target - start;

  const token = ++animationToken;
  let step = 0;

  function advance() {
    if (token !== animationToken) return;

    if (step >= stepsToMove) {
      resolveSnakeOrLadder(token);
      return;
    }

    const from = playerPositions[currentPlayer];
    const to = from + 1;

    animateTokenToTile(from, to, token, 250, true, () => {
      step++;
      advance();
      });
  }

  advance();
}



function animateTokenToTile(fromPos, toPos, token, duration, hop, onComplete) {
  const player = currentPlayer;
  const start = tileCenter(fromPos);
  const end = tileCenter(toPos);
  const startTime = performance.now();

  function frame(now) {
    if (token !== animationToken) return;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const hopHeight = hop ? Math.sin(progress * Math.PI) * 14 : 0;
    animatedTokenPositions[player] = {
      x: start.x + (end.x - start.x) * eased,
      y: start.y + (end.y - start.y) * eased - hopHeight
    };

    drawBoard();

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      animatedTokenPositions[player] = null;
      playerPositions[player] = toPos;
      updatePositionText();
      drawBoard();
      onComplete();
    }
  }

  requestAnimationFrame(frame);
}



function resolveSnakeOrLadder(token) {
  if (token !== animationToken) return;

  const landed = playerPositions[currentPlayer];

  if (snakes[landed]) {
    const destination = snakes[landed];

    setMessage(`🐍 ${playerNames[currentPlayer]} landed on a snake!`);
    playSound(snakeSound);

    setTimeout(() => {
      if (token !== animationToken) return;
      animateJump(landed, destination, token, 100);
    }, 700);

  } else if (ladders[landed]) {
    const destination = ladders[landed];

    setMessage(`🪜 ${playerNames[currentPlayer]} found a ladder!`);
    playSound(ladderSound);

    setTimeout(() => {
      if (token !== animationToken) return;
      animateJump(landed, destination, token, 80);
    }, 700);

  } else if (landed === 100) {
    setMessage(`🏆 ${playerNames[currentPlayer]} wins!`);
    playSound(winSound);
    drawBoard();

    isAnimating = false;
    document.getElementById("rollButton").disabled = false;

    setTimeout(() => {
      alert(`🎉 ${playerNames[currentPlayer]} wins!`);
      resetGame();
    }, 1000);

    return;
  } else {
    setMessage(`${playerNames[currentPlayer]} is on tile ${landed}.`);
    finishTurn();
  }
}

function animateJump(from, to, token, delay) {
  const direction = to > from ? 1 : -1;
  function step() {
    if (token !== animationToken) return;
    const current = playerPositions[currentPlayer];
    if (current === to) {
      drawBoard();

      if (to === 100) {
        setMessage(`🏆 ${playerNames[currentPlayer]} wins!`);
        playSound(winSound);

        isAnimating = false;
        document.getElementById("rollButton").disabled = false;

        setTimeout(() => {
          alert(`🎉 ${playerNames[currentPlayer]} wins!`);
          resetGame();
        }, 1000);
      } else {
        finishTurn();
      }
      return;
    }
    const next = current + direction;
    animateTokenToTile(current, next, token, delay, false, step);
  }
  step();
}


function finishTurn() {
  currentPlayer = (currentPlayer + 1) % playerPositions.length;
  document.getElementById("currentPlayerDisplay").textContent =
    `Current Player: ${playerNames[currentPlayer]} ${currentPlayer === 0 ? "🟣" : "🔵"}`;
  isAnimating = false;
  document.getElementById("rollButton").disabled = false;
}

function resetGame() {
  playerPositions = [0, 0];
  animatedTokenPositions = [null, null];
  currentPlayer = 0;
  isAnimating = false;
  document.getElementById("rollButton").disabled = false;
  document.getElementById("currentPlayerDisplay").textContent = "Current Player: Player 1 🟣";
  document.getElementById("diceValue").textContent = "Roll the dice to begin!";
  document.getElementById("diceImage").src = "images/dice1.png";
  setMessage("Climb ladders, avoid snakes, and reach 100!");
  updatePositionText();
  drawBoard();
}

drawBoard();
updatePositionText();
