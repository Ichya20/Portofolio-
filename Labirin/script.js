// DOM Elements
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const chartCanvas = document.getElementById('chart-canvas');
const chartCtx = chartCanvas.getContext('2d');

const inputLebar = document.getElementById('input-lebar');
const inputTinggi = document.getElementById('input-tinggi');
const inputKecepatan = document.getElementById('input-kecepatan');
const labelKecepatan = document.getElementById('label-kecepatan');

const btnBuat = document.getElementById('btn-buat');
const btnRekursif = document.getElementById('btn-rekursif');
const btnIteratif = document.getElementById('btn-iteratif');
const btnBersihkan = document.getElementById('btn-bersihkan');

const kontenAnalisis = document.getElementById('konten-analisis');

// Global State
let grid = [];
let lebar = 15;
let tinggi = 15;
let cellSize = 0;
let startNode = null;
let endNode = null;
let animationSpeed = 50;
let isRunning = false;

// Results storage
const results = {
    rekursif: null,
    iteratif: null
};

// Cell class
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
        this.inPath = false;
    }
}

// Initialize
function init() {
    setupCanvas();
    buatLabirin();
}

function setupCanvas() {
    const canvasContainer = canvas.parentElement;
    const size = canvasContainer.clientWidth - 20;
    canvas.width = size;
    canvas.height = size;
    
    chartCanvas.width = chartCanvas.parentElement.clientWidth;
    chartCanvas.height = 200;
}

// Event Listeners
inputKecepatan.addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value);
    labelKecepatan.textContent = animationSpeed;
});

inputLebar.addEventListener('change', (e) => {
    lebar = parseInt(e.target.value);
});

inputTinggi.addEventListener('change', (e) => {
    tinggi = parseInt(e.target.value);
});

btnBuat.addEventListener('click', () => {
    if (!isRunning) {
        resetResults();
        buatLabirin();
    }
});

btnRekursif.addEventListener('click', () => {
    if (!isRunning) {
        selesaikan('rekursif');
    }
});

btnIteratif.addEventListener('click', () => {
    if (!isRunning) {
        selesaikan('iteratif');
    }
});

btnBersihkan.addEventListener('click', () => {
    if (!isRunning) {
        bersihkanJalur();
    }
});

window.addEventListener('resize', () => {
    setupCanvas();
    gambarLabirin();
    if (results.rekursif || results.iteratif) {
        gambarGrafik();
    }
});

// Maze Generation using Randomized DFS
function buatLabirin() {
    // Initialize grid
    grid = [];
    for (let y = 0; y < tinggi; y++) {
        grid[y] = [];
        for (let x = 0; x < lebar; x++) {
            grid[y][x] = new Cell(x, y);
        }
    }
    
    // Start from random cell
    const startX = Math.floor(Math.random() * lebar);
    const startY = Math.floor(Math.random() * tinggi);
    const stack = [];
    let current = grid[startY][startX];
    current.visited = true;
    stack.push(current);
    
    // DFS carving algorithm
    while (stack.length > 0) {
        current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current);
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, next);
            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }
    
    // Reset visited for solving
    for (let y = 0; y < tinggi; y++) {
        for (let x = 0; x < lebar; x++) {
            grid[y][x].visited = false;
            grid[y][x].inPath = false;
        }
    }
    
    // Set start and end nodes
    startNode = grid[0][0];
    endNode = grid[tinggi - 1][lebar - 1];
    
    gambarLabirin();
}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;
    
    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // top
    if (x < lebar - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // right
    if (y < tinggi - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // bottom
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // left
    
    return neighbors;
}

function removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) {
        current.walls.right = false;
        next.walls.left = false;
    } else if (dx === -1) {
        current.walls.left = false;
        next.walls.right = false;
    } else if (dy === 1) {
        current.walls.bottom = false;
        next.walls.top = false;
    } else if (dy === -1) {
        current.walls.top = false;
        next.walls.bottom = false;
    }
}

// Draw maze
function gambarLabirin() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cellSize = canvas.width / Math.max(lebar, tinggi);
    
    // Draw cells
    for (let y = 0; y < tinggi; y++) {
        for (let x = 0; x < lebar; x++) {
            const cell = grid[y][x];
            const px = x * cellSize;
            const py = y * cellSize;
            
            // Draw walls
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            if (cell.walls.top) {
                ctx.moveTo(px, py);
                ctx.lineTo(px + cellSize, py);
            }
            if (cell.walls.right) {
                ctx.moveTo(px + cellSize, py);
                ctx.lineTo(px + cellSize, py + cellSize);
            }
            if (cell.walls.bottom) {
                ctx.moveTo(px, py + cellSize);
                ctx.lineTo(px + cellSize, py + cellSize);
            }
            if (cell.walls.left) {
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + cellSize);
            }
            
            ctx.stroke();
        }
    }
    
    // Draw start node (green)
    if (startNode) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(startNode.x * cellSize + 2, startNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
    
    // Draw end node (red)
    if (endNode) {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(endNode.x * cellSize + 2, endNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
}

// Main solving function
async function selesaikan(metode) {
    isRunning = true;
    disableButtons();
    
    // Reset grid
    for (let y = 0; y < tinggi; y++) {
        for (let x = 0; x < lebar; x++) {
            grid[y][x].visited = false;
            grid[y][x].inPath = false;
        }
    }
    
    gambarLabirin();
    
    const startTime = performance.now();
    let path = [];
    let cellsVisited = 0;
    
    if (metode === 'rekursif') {
        const result = await dfsRekursif(startNode, []);
        path = result.path;
        cellsVisited = result.visited;
    } else {
        const result = await dfsIteratif();
        path = result.path;
        cellsVisited = result.visited;
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    
    // Draw solution path
    if (path.length > 0) {
        gambarJalur(path);
    }
    
    // Store results
    results[metode] = {
        time: parseFloat(executionTime),
        visited: cellsVisited,
        pathLength: path.length
    };
    
    tampilkanAnalisis();
    
    isRunning = false;
    enableButtons();
}

// DFS Recursive
async function dfsRekursif(cell, path) {
    cell.visited = true;
    path.push(cell);
    
    // Animate
    const delay = Math.max(1, 100 - animationSpeed);
    await sleep(delay);
    
    ctx.fillStyle = 'rgba(96, 165, 250, 0.5)'; // Blue for recursive
    ctx.fillRect(cell.x * cellSize + 2, cell.y * cellSize + 2, cellSize - 4, cellSize - 4);
    
    // Redraw start and end
    if (cell === startNode) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(startNode.x * cellSize + 2, startNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
    if (cell === endNode) {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(endNode.x * cellSize + 2, endNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
    
    if (cell === endNode) {
        return { path: [...path], visited: countVisited() };
    }
    
    const neighbors = getValidNeighbors(cell);
    
    for (const neighbor of neighbors) {
        if (!neighbor.visited) {
            const result = await dfsRekursif(neighbor, path);
            if (result) return result;
        }
    }
    
    path.pop();
    return null;
}

// DFS Iterative
async function dfsIteratif() {
    const stack = [{ cell: startNode, path: [startNode] }];
    startNode.visited = true;
    
    while (stack.length > 0) {
        const { cell, path } = stack.pop();
        
        // Animate
        const delay = Math.max(1, 100 - animationSpeed);
        await sleep(delay);
        
        ctx.fillStyle = 'rgba(192, 132, 252, 0.5)'; // Purple for iterative
        ctx.fillRect(cell.x * cellSize + 2, cell.y * cellSize + 2, cellSize - 4, cellSize - 4);
        
        // Redraw start and end
        if (cell === startNode) {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(startNode.x * cellSize + 2, startNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
        }
        if (cell === endNode) {
            ctx.fillStyle = '#f87171';
            ctx.fillRect(endNode.x * cellSize + 2, endNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
        }
        
        if (cell === endNode) {
            return { path: path, visited: countVisited() };
        }
        
        const neighbors = getValidNeighbors(cell);
        
        for (const neighbor of neighbors) {
            if (!neighbor.visited) {
                neighbor.visited = true;
                stack.push({ cell: neighbor, path: [...path, neighbor] });
            }
        }
    }
    
    return { path: [], visited: countVisited() };
}

function getValidNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;
    
    if (!cell.walls.top && y > 0) neighbors.push(grid[y - 1][x]);
    if (!cell.walls.right && x < lebar - 1) neighbors.push(grid[y][x + 1]);
    if (!cell.walls.bottom && y < tinggi - 1) neighbors.push(grid[y + 1][x]);
    if (!cell.walls.left && x > 0) neighbors.push(grid[y][x - 1]);
    
    return neighbors;
}

function countVisited() {
    let count = 0;
    for (let y = 0; y < tinggi; y++) {
        for (let x = 0; x < lebar; x++) {
            if (grid[y][x].visited) count++;
        }
    }
    return count;
}

// Draw solution path
function gambarJalur(path) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'; // Yellow
    
    for (const cell of path) {
        if (cell !== startNode && cell !== endNode) {
            ctx.fillRect(cell.x * cellSize + 4, cell.y * cellSize + 4, cellSize - 8, cellSize - 8);
        }
    }
    
    // Redraw start and end on top
    if (startNode) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(startNode.x * cellSize + 2, startNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
    if (endNode) {
        ctx.fillStyle = '#f87171';
        ctx.fillRect(endNode.x * cellSize + 2, endNode.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
}

// Display analysis
function tampilkanAnalisis() {
    if (!results.rekursif && !results.iteratif) {
        kontenAnalisis.innerHTML = '<p class="placeholder">Jalankan algoritma untuk melihat hasil analisis...</p>';
        return;
    }
    
    let html = '<div class="metrics">';
    
    // Execution time
    if (results.rekursif || results.iteratif) {
        html += '<div class="metric-card">';
        html += '<h3>⏱️ Waktu Eksekusi</h3>';
        html += '<div class="metric-values">';
        
        if (results.rekursif) {
            html += '<div class="metric-value rekursif">';
            html += '<span class="label">Rekursif</span>';
            html += `<span class="value">${results.rekursif.time} ms</span>`;
            html += '</div>';
        }
        
        if (results.iteratif) {
            html += '<div class="metric-value iteratif">';
            html += '<span class="label">Iteratif</span>';
            html += `<span class="value">${results.iteratif.time} ms</span>`;
            html += '</div>';
        }
        
        html += '</div></div>';
    }
    
    // Cells visited
    if (results.rekursif || results.iteratif) {
        html += '<div class="metric-card">';
        html += '<h3>🔍 Sel Terkunjungi</h3>';
        html += '<div class="metric-values">';
        
        if (results.rekursif) {
            html += '<div class="metric-value rekursif">';
            html += '<span class="label">Rekursif</span>';
            html += `<span class="value">${results.rekursif.visited} sel</span>`;
            html += '</div>';
        }
        
        if (results.iteratif) {
            html += '<div class="metric-value iteratif">';
            html += '<span class="label">Iteratif</span>';
            html += `<span class="value">${results.iteratif.visited} sel</span>`;
            html += '</div>';
        }
        
        html += '</div></div>';
    }
    
    // Path length
    if (results.rekursif || results.iteratif) {
        html += '<div class="metric-card">';
        html += '<h3>📏 Panjang Jalur Solusi</h3>';
        html += '<div class="metric-values">';
        
        if (results.rekursif) {
            html += '<div class="metric-value rekursif">';
            html += '<span class="label">Rekursif</span>';
            html += `<span class="value">${results.rekursif.pathLength} sel</span>`;
            html += '</div>';
        }
        
        if (results.iteratif) {
            html += '<div class="metric-value iteratif">';
            html += '<span class="label">Iteratif</span>';
            html += `<span class="value">${results.iteratif.pathLength} sel</span>`;
            html += '</div>';
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    
    kontenAnalisis.innerHTML = html;
    
    // Draw chart
    if (results.rekursif && results.iteratif) {
        gambarGrafik();
    }
}

// Draw comparison bar chart
function gambarGrafik() {
    if (!results.rekursif || !results.iteratif) return;
    
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    const padding = 40;
    const chartWidth = chartCanvas.width - padding * 2;
    const chartHeight = chartCanvas.height - padding * 2;
    
    const maxTime = Math.max(results.rekursif.time, results.iteratif.time);
    const barWidth = chartWidth / 3;
    const spacing = barWidth / 2;
    
    // Title
    chartCtx.fillStyle = '#f0f0f0';
    chartCtx.font = 'bold 14px Poppins';
    chartCtx.textAlign = 'center';
    chartCtx.fillText('Perbandingan Waktu Eksekusi (ms)', chartCanvas.width / 2, 20);
    
    // Recursive bar
    const rekursifHeight = (results.rekursif.time / maxTime) * chartHeight;
    chartCtx.fillStyle = '#60a5fa';
    chartCtx.fillRect(padding + spacing, padding + chartHeight - rekursifHeight, barWidth, rekursifHeight);
    
    // Recursive label
    chartCtx.fillStyle = '#f0f0f0';
    chartCtx.font = '12px Poppins';
    chartCtx.fillText('Rekursif', padding + spacing + barWidth / 2, chartCanvas.height - 10);
    chartCtx.fillText(results.rekursif.time.toFixed(2), padding + spacing + barWidth / 2, padding + chartHeight - rekursifHeight - 5);
    
    // Iterative bar
    const iteratifHeight = (results.iteratif.time / maxTime) * chartHeight;
    chartCtx.fillStyle = '#c084fc';
    chartCtx.fillRect(padding + spacing * 2 + barWidth, padding + chartHeight - iteratifHeight, barWidth, iteratifHeight);
    
    // Iterative label
    chartCtx.fillStyle = '#f0f0f0';
    chartCtx.fillText('Iteratif', padding + spacing * 2 + barWidth + barWidth / 2, chartCanvas.height - 10);
    chartCtx.fillText(results.iteratif.time.toFixed(2), padding + spacing * 2 + barWidth + barWidth / 2, padding + chartHeight - iteratifHeight - 5);
}

// Clear path
function bersihkanJalur() {
    for (let y = 0; y < tinggi; y++) {
        for (let x = 0; x < lebar; x++) {
            grid[y][x].visited = false;
            grid[y][x].inPath = false;
        }
    }
    gambarLabirin();
}

// Reset results
function resetResults() {
    results.rekursif = null;
    results.iteratif = null;
    kontenAnalisis.innerHTML = '<p class="placeholder">Jalankan algoritma untuk melihat hasil analisis...</p>';
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
}

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function disableButtons() {
    btnBuat.disabled = true;
    btnRekursif.disabled = true;
    btnIteratif.disabled = true;
    btnBersihkan.disabled = true;
}

function enableButtons() {
    btnBuat.disabled = false;
    btnRekursif.disabled = false;
    btnIteratif.disabled = false;
    btnBersihkan.disabled = false;
}

// Initialize on load
init();