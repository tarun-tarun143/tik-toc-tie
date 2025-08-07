function handleLogin() {
  const input = document.getElementById('loginInput').value.trim();
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const phoneRegex = /^\d{10}$/;

  if (emailRegex.test(input) || phoneRegex.test(input)) {
    localStorage.setItem("userLogin", input); // Optional: save login
    window.location.href = "game.html";       // Redirect to game
  } else {
    alert("Please enter a valid email or 10-digit phone number.");
   
  }
}


let board = Array(9).fill('');
let currentPlayer = 'X';
let gameMode = null;
let gameActive = true;

const boardEl = document.getElementById('gameBoard');
const statusEl = document.getElementById('status');

// 🔊 Load sound effects
const moveSound = new Audio('move.mp3.wav');
const winSound = new Audio('win.mp3.wav');
const drawSound = new Audio('draw.mp3.wav');

function startGame(mode) {
  gameMode = mode;
  document.getElementById('modePopup').style.display = 'none';
  initBoard();
}


function initBoard() {
  boardEl.innerHTML = '';
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.classList.add("taken");
    cell.dataset.index = i;
    cell.addEventListener('click', handleMove);
    boardEl.appendChild(cell);
  }
}

function handleMove(e) {
  const index = e.target.dataset.index;

  if (!gameActive || board[index] !== '') return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  moveSound.play();

  if (checkWin(currentPlayer)) {
    statusEl.textContent = `Player ${currentPlayer} Wins!`;
launchFireworks();
showRestartPopup("🎉 You Win!");
winSound.play();
    gameActive = false;
    return;
  }


  if (!board.includes('')) {
    statusEl.textContent = `It's a Draw!`;
    drawSound.play();
    gameActive = false;
    return;
  }
  

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  if (gameMode === 'computer' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  let emptyIndices = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  if (emptyIndices.length === 0) return;

  let randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  const cell = boardEl.children[randomIndex];
  cell.click();
}

function checkWin(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === player)
  );
}

function resetGame() {
  initBoard();
}
board.classList.add("fade-out");
setTimeout(() => {
  // reset logic here...
  board.classList.remove("fade-out");
}, 300);

// FIREWORKS EFFECT
function launchFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];

  function createFirework() {
    const colors = ['#ff004f', '#00ffea', '#ffd300', '#4aff00', '#9900ff'];
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const count = 100;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x,
        y,
        radius: 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1
      });
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.01;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
      ctx.fill();

      if (p.alpha <= 0) particles.splice(i, 1);
    });

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  createFirework();
  animate();
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}
