const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PLAYER_X = 30;
const COMPUTER_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 6;
const COMPUTER_SPEED = 4;
const BALL_SPEED = 5;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let computerY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0;
let computerScore = 0;

// Mouse & keyboard control
let moveUp = false, moveDown = false;
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle position
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});
window.addEventListener('keydown', e => {
  if (e.key === "ArrowUp") moveUp = true;
  if (e.key === "ArrowDown") moveDown = true;
});
window.addEventListener('keyup', e => {
  if (e.key === "ArrowUp") moveUp = false;
  if (e.key === "ArrowDown") moveDown = false;
});

// Drawing functions
function drawRect(x, y, w, h, color = "#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawBall(x, y, size, color = "#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}
function drawNet() {
  ctx.fillStyle = "#888";
  for (let i = 0; i < canvas.height; i += 24) {
    ctx.fillRect(canvas.width / 2 - 2, i, 4, 14);
  }
}
function updateScore() {
  document.getElementById('player-score').textContent = playerScore;
  document.getElementById('computer-score').textContent = computerScore;
}

// Game logic
function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}
function update() {
  // Keyboard control (additive with mouse)
  if (moveUp) {
    playerY -= PADDLE_SPEED;
    playerY = Math.max(0, playerY);
  }
  if (moveDown) {
    playerY += PADDLE_SPEED;
    playerY = Math.min(canvas.height - PADDLE_HEIGHT, playerY);
  }

  // Computer paddle AI
  let target = ballY - (PADDLE_HEIGHT / 2 - BALL_SIZE / 2);
  if (computerY + PADDLE_HEIGHT / 2 < target)
    computerY += COMPUTER_SPEED;
  else if (computerY + PADDLE_HEIGHT / 2 > target)
    computerY -= COMPUTER_SPEED;
  computerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, computerY));

  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom
  if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
    ballVelY = -ballVelY;
    ballY = Math.max(0, Math.min(canvas.height - BALL_SIZE, ballY));
  }

  // Ball collision with paddles
  // Left paddle (player)
  if (ballX <= PLAYER_X + PADDLE_WIDTH &&
      ballY + BALL_SIZE > playerY && ballY < playerY + PADDLE_HEIGHT &&
      ballX > PLAYER_X - BALL_SIZE) {
    ballVelX = Math.abs(ballVelX);
    // Add spin based on where the ball hit the paddle
    let hitPoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
    ballVelY = hitPoint * 0.25;
  }
  // Right paddle (computer)
  if (ballX + BALL_SIZE >= COMPUTER_X &&
      ballY + BALL_SIZE > computerY && ballY < computerY + PADDLE_HEIGHT &&
      ballX < COMPUTER_X + PADDLE_WIDTH + BALL_SIZE) {
    ballVelX = -Math.abs(ballVelX);
    // Add spin
    let hitPoint = (ballY + BALL_SIZE / 2) - (computerY + PADDLE_HEIGHT / 2);
    ballVelY = hitPoint * 0.25;
  }

  // Score
  if (ballX < 0) {
    computerScore++;
    updateScore();
    resetBall();
  } else if (ballX > canvas.width) {
    playerScore++;
    updateScore();
    resetBall();
  }
}

function render() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Net
  drawNet();

  // Paddles
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0ff");
  drawRect(COMPUTER_X, computerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f00");

  // Ball
  drawBall(ballX, ballY, BALL_SIZE, "#fff");
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Start game
updateScore();
gameLoop();
