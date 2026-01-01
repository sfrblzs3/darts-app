document.addEventListener("DOMContentLoaded", () => {
  // Ide kerül minden gombhoz kötött kód
  document.getElementById("reset").onclick = resetGame;
  document.getElementById("calibrate").onclick = () => {
    calibrationStep = 1;
    alert("Koppints a tábla KÖZEPÉRE");
  };
  document.getElementById("undo").onclick = () => {
    if (throwHistory.length === 0) return;

    const last = throwHistory.pop();
    players[currentPlayer].score += last;
    dartsThrown--;

    if (dartsThrown < 0) {
      dartsThrown = 2;
      currentPlayer = (currentPlayer + players.length - 1) % players.length;
    }

    renderScoreboard();
  };
});

let players = [
  { name: "Player 1", score: 501 },
  { name: "Player 2", score: 501 }
];

let currentPlayer = 0;
let dartsThrown = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
let throwHistory = [];

function saveThrow(value) {
  throwHistory.push(value);
}


navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" },
  audio: false
}).then(stream => {
  video.srcObject = stream;
});

let score = 501;
let round = 1;

const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");

function updateUI() {
  scoreEl.textContent = score;
  roundEl.textContent = round;
}

let boardCenter = { x: 0.5, y: 0.5 };
let boardRadius = 0.45;


const sectors = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
  3, 19, 7, 16, 8, 11, 14, 9, 12, 5
];

function calculateScore(x, y) {
  const dx = x - boardCenter.x;
  const dy = boardCenter.y - y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > boardRadius) return 0;

  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360 + 9) % 360;
  const sectorIndex = Math.floor(angle / 18);
  const base = sectors[sectorIndex];

  if (distance < 0.05) return 50;
  if (distance < 0.1) return 25;
  if (distance > 0.4 && distance < 0.45) return base * 2;
  if (distance > 0.25 && distance < 0.3) return base * 3;

  return base;
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  // 🔧 Kalibrálás
  if (calibrationStep === 1) {
    boardCenter.x = x;
    boardCenter.y = y;
    calibrationStep = 2;
    alert("Most koppints a tábla SZÉLÉRE");
    return;
  }

  if (calibrationStep === 2) {
    const dx = x - boardCenter.x;
    const dy = y - boardCenter.y;
    boardRadius = Math.sqrt(dx * dx + dy * dy);
    calibrationStep = 0;
    alert("Kalibrálás kész ✅");
    return;
  }

  // 🎯 Normál dobás
  const hit = calculateScore(x, y);

  if (score - hit < 0) {
    alert("Bust!");
    nextRound();
    return;
  }

  const player = players[currentPlayer];

if (player.score - hit < 0) {
  alert("Bust!");
  nextPlayer();
  return;
}

player.score -= hit;
dartsThrown++;

  dartsThrown++;
  saveThrow(hit);

  if (score === 0) {
    alert("Kiszálltál! 🎯");
    resetGame();
    return;
  }

  if (dartsThrown === 3) nextRound();
  updateUI();
});


document.getElementById("reset").onclick = resetGame;

let calibrationStep = 0;

document.getElementById("calibrate").onclick = () => {
  calibrationStep = 1;
  alert("Koppints a tábla KÖZEPÉRE");
};

'ide kellhet az első sorba rakott cucc'

document.getElementById("undo").onclick = () => {
  if (throwHistory.length === 0) return;

  const last = throwHistory.pop();
  score += last;
  dartsThrown--;

  if (dartsThrown < 0) {
    dartsThrown = 2;
    round--;
  }

  updateUI();
};

function renderScoreboard() {
  const board = document.getElementById("scoreboard");
  board.innerHTML = "";

  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "score-card " + (i === currentPlayer ? "active" : "");
    div.innerHTML = `
      <div>${p.name}</div>
      <div class="score-value">${p.score}</div>
    `;
    board.appendChild(div);
  });
}

renderScoreboard();

function nextPlayer() {
  dartsThrown = 0;
  currentPlayer = (currentPlayer + 1) % players.length;
  renderScoreboard();
}

if (dartsThrown === 3) nextPlayer();

let model;

cocoSsd.load().then(m => {
  model = m;
  console.log("AI model betöltve");
});

async function detectDart() {
  if (!model) return;

  const predictions = await model.detect(video);

  predictions.forEach(p => {
    if (p.class === "sports ball" || p.class === "knife") {
      const [x, y, w, h] = p.bbox;
      ctx.strokeStyle = "lime";
      ctx.strokeRect(x, y, w, h);
    }
  });
}
