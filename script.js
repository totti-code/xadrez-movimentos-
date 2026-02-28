const boardEl = document.getElementById("board");
const pieceEl = document.getElementById("piece");
const coordsEl = document.getElementById("coords");
const clearEl = document.getElementById("clear");
const statusEl = document.getElementById("status");
const rulesEl = document.getElementById("rules");

let start = null; // {r,c}
let squares = []; // DOM squares

const RULES = {
  king: [
    "Move 1 casa em qualquer direção (horizontal, vertical e diagonal)."
  ],
  queen: [
    "Combina torre + bispo: move em linhas retas e diagonais, quantas casas quiser."
  ],
  rook: [
    "Move em linha reta (horizontal/vertical), quantas casas quiser."
  ],
  bishop: [
    "Move em diagonal, quantas casas quiser."
  ],
  knight: [
    "Move em 'L': 2 casas em uma direção + 1 perpendicular. Ele pula peças."
  ],
  pawn_w: [
    "Move 1 casa para cima (em direção ao rank 8).",
    "Do início (2ª fileira), pode andar 2 casas.",
    "Captura 1 casa na diagonal para cima."
  ],
  pawn_b: [
    "Move 1 casa para baixo (em direção ao rank 1).",
    "Do início (7ª fileira), pode andar 2 casas.",
    "Captura 1 casa na diagonal para baixo."
  ],
};

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function toCoord(r, c) {
  const file = "abcdefgh"[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

function setRules(piece) {
  rulesEl.innerHTML = "";
  RULES[piece].forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    rulesEl.appendChild(li);
  });
}

function clearMarks() {
  squares.forEach(sq => sq.classList.remove("move", "start"));
}

function markMoves(moves) {
  moves.forEach(({r,c}) => {
    const idx = r * 8 + c;
    squares[idx].classList.add("move");
  });
}

function getLineMoves(r, c, deltas) {
  // para torre, bispo, rainha (vai até borda)
  const out = [];
  for (const [dr, dc] of deltas) {
    let rr = r + dr;
    let cc = c + dc;
    while (inBounds(rr, cc)) {
      out.push({ r: rr, c: cc });
      rr += dr; cc += dc;
    }
  }
  return out;
}

function getMoves(piece, r, c) {
  switch (piece) {
    case "king": {
      const deltas = [
        [-1,-1], [-1,0], [-1,1],
        [ 0,-1],         [ 0,1],
        [ 1,-1], [ 1,0], [ 1,1],
      ];
      return deltas
        .map(([dr,dc]) => ({ r: r+dr, c: c+dc }))
        .filter(p => inBounds(p.r, p.c));
    }
    case "rook":
      return getLineMoves(r, c, [[-1,0],[1,0],[0,-1],[0,1]]);
    case "bishop":
      return getLineMoves(r, c, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "queen":
      return getLineMoves(r, c, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "knight": {
      const deltas = [
        [-2,-1], [-2, 1],
        [-1,-2], [-1, 2],
        [ 1,-2], [ 1, 2],
        [ 2,-1], [ 2, 1],
      ];
      return deltas
        .map(([dr,dc]) => ({ r: r+dr, c: c+dc }))
        .filter(p => inBounds(p.r, p.c));
    }
    case "pawn_w": {
      const out = [];
      // 1 pra cima (r-1)
      if (inBounds(r-1, c)) out.push({ r: r-1, c });
      // 2 do início (r==6 -> rank 2)
      if (r === 6 && inBounds(r-2, c)) out.push({ r: r-2, c });
      // capturas (diagonal)
      if (inBounds(r-1, c-1)) out.push({ r: r-1, c: c-1 });
      if (inBounds(r-1, c+1)) out.push({ r: r-1, c: c+1 });
      return out;
    }
    case "pawn_b": {
      const out = [];
      // 1 pra baixo (r+1)
      if (inBounds(r+1, c)) out.push({ r: r+1, c });
      // 2 do início (r==1 -> rank 7)
      if (r === 1 && inBounds(r+2, c)) out.push({ r: r+2, c });
      // capturas (diagonal)
      if (inBounds(r+1, c-1)) out.push({ r: r+1, c: c-1 });
      if (inBounds(r+1, c+1)) out.push({ r: r+1, c: c+1 });
      return out;
    }
    default:
      return [];
  }
}

function updateCoordsVisibility() {
  const show = coordsEl.checked;
  squares.forEach(sq => {
    const lab = sq.querySelector(".coord");
    if (lab) lab.style.display = show ? "block" : "none";
  });
}

function buildBoard() {
  boardEl.innerHTML = "";
  squares = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
      sq.dataset.r = r;
      sq.dataset.c = c;

      const coord = document.createElement("div");
      coord.className = "coord";
      coord.textContent = toCoord(r, c);
      sq.appendChild(coord);

      sq.addEventListener("click", () => {
        const piece = pieceEl.value;
        start = { r, c };

        clearMarks();
        sq.classList.add("start");

        const moves = getMoves(piece, r, c);
        markMoves(moves);

        statusEl.textContent = `Peça: ${pieceEl.options[pieceEl.selectedIndex].text} | Início: ${toCoord(r,c)} | Movimentos marcados: ${moves.length}`;
        updateCoordsVisibility();
      });

      boardEl.appendChild(sq);
      squares.push(sq);
    }
  }

  updateCoordsVisibility();
}

pieceEl.addEventListener("change", () => {
  setRules(pieceEl.value);
  clearMarks();
  start = null;
  statusEl.textContent = "Selecione uma peça e clique no tabuleiro.";
});

coordsEl.addEventListener("change", updateCoordsVisibility);

clearEl.addEventListener("click", () => {
  start = null;
  clearMarks();
  statusEl.textContent = "Selecione uma peça e clique no tabuleiro.";
});

setRules(pieceEl.value);
buildBoard();
