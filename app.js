const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" },
  audio: false
}).then(stream => {
  video.srcObject = stream;
});

let score = 501;
let round = 1;
let dartsThrown = 0;

const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");

function updateUI() {
  scoreEl.textContent = score;
  roundEl.textContent = round;
}

const boardCenter = { x: 0.5, y: 0.5 }; // arány
const boardRadius = 0.45;

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

  const hit = calculateScore(x, y);

  if (score - hit < 0) {
    alert("Bust!");
    nextRound();
    return;
  }

  score -= hit;
  dartsThrown++;

  if (score === 0) {
    alert("Kiszálltál! 🎯");
    resetGame();
    return;
  }

  if (dartsThrown === 3) nextRound();
  updateUI();
});

function nextRound() {
  dartsThrown = 0;
  round++;
  updateUI();
}

function resetGame() {
  score = 501;
  round = 1;
  dartsThrown = 0;
  updateUI();
}

document.getElementById("reset").onclick = resetGame;
