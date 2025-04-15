let grid, elevationMap;
let cols, rows;
let cellSize = 5;
let currentColor;
let colors;
let mode = 'draw';
let brushSlider;

function setup() {
  createCanvas(500, 500).parent(document.body);
  cols = width / cellSize;
  rows = height / cellSize;
  grid = createEmptyGrid(cols, rows);

  colors = {
    water: [0, 0, 255],
    grass: [34, 139, 34],
    hill: [139, 69, 19],
    mountain: [100, 100, 100]
  };

  currentColor = colors.grass;
  brushSlider = select('#brushSlider');
}

function draw() {
  background(255);
  if (mode === 'draw') {
    drawGrid();
  } else if (mode === 'heightmap') {
    drawHeightmap();
  }
}

function createEmptyGrid(cols, rows) {
  return Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => [255, 255, 255])
  );
}

function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      fill(grid[i][j]);
      stroke(200);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function drawHeightmap() {
  if (!elevationMap) generateElevationMap();

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const brightness = elevationMap[i][j] * 255;
      fill(brightness);
      noStroke();
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function mouseDragged() {
  if (mode === 'draw') drawBrush();
}

function drawBrush(x = mouseX, y = mouseY) {
  const col = floor(x / cellSize);
  const row = floor(y / cellSize);
  const radius = int(brushSlider.value());

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      let dist = sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const i = col + dx;
        const j = row + dy;
        if (i >= 0 && i < cols && j >= 0 && j < rows) {
          grid[i][j] = currentColor;
        }
      }
    }
  }
}

function setBrush(type) {
  currentColor = colors[type];
}

function setMode(m) {
  mode = m;
  if (mode === 'heightmap') elevationMap = null;
}

function blendTerrain() {
  let newGrid = JSON.parse(JSON.stringify(grid));
  for (let step = 0; step < 3; step++) {
    for (let i = 1; i < cols - 1; i++) {
      for (let j = 1; j < rows - 1; j++) {
        if (colorMatch(grid[i][j], [255, 255, 255])) {
          let neighbors = {};
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              let c = grid[i + dx][j + dy];
              let key = c.toString();
              neighbors[key] = (neighbors[key] || 0) + 1;
            }
          }

          let max = 0, selected = [255, 255, 255];
          for (let key in neighbors) {
            if (neighbors[key] > max && key !== '255,255,255') {
              max = neighbors[key];
              selected = key.split(',').map(Number);
            }
          }

          newGrid[i][j] = selected;
        }
      }
    }
    grid = JSON.parse(JSON.stringify(newGrid));
  }
}

function generateElevationMap() {
  elevationMap = [];
  noiseDetail(4, 0.5);
  for (let i = 0; i < cols; i++) {
    elevationMap[i] = [];
    for (let j = 0; j < rows; j++) {
      const base = getBaseHeight(grid[i][j]);
      const noiseVal = noise(i * 0.1, j * 0.1) * getNoiseStrength(grid[i][j]);
      elevationMap[i][j] = constrain(base + noiseVal, 0, 1);
    }
  }
  smoothElevationMap(2);
}

function smoothElevationMap(iterations = 1) {
  for (let n = 0; n < iterations; n++) {
    let temp = JSON.parse(JSON.stringify(elevationMap));
    for (let i = 1; i < cols - 1; i++) {
      for (let j = 1; j < rows - 1; j++) {
        let sum = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            sum += elevationMap[i + dx][j + dy];
          }
        }
        temp[i][j] = sum / 9;
      }
    }
    elevationMap = temp;
  }
}

function getBaseHeight(c) {
  if (colorMatch(c, colors.water)) return 0.1;
  if (colorMatch(c, colors.grass)) return 0.5;
  if (colorMatch(c, colors.hill)) return 0.7;
  if (colorMatch(c, colors.mountain)) return 0.9;
  return 0.5;
}

function getNoiseStrength(c) {
  if (colorMatch(c, colors.water)) return 0.02;
  if (colorMatch(c, colors.grass)) return 0.05;
  if (colorMatch(c, colors.hill)) return 0.1;
  if (colorMatch(c, colors.mountain)) return 0.15;
  return 0.05;
}

function colorMatch(c1, c2) {
  return dist(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2]) < 20;
}

// 🔥 NEW: Save heightmap as Base64 and pass to 3D
function viewIn3D() {
  generateElevationMap();

  let img = createImage(cols, rows);
  img.loadPixels();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let val = elevationMap[i][j] * 255;
      img.set(i, j, color(val));
    }
  }
  img.updatePixels();

  // Draw on a temp canvas to get Base64
  let gfx = createGraphics(cols, rows);
  gfx.image(img, 0, 0);
  let dataURL = gfx.canvas.toDataURL();

  // Save to localStorage
  localStorage.setItem('terrain-heightmap', dataURL);

  // Open viewer
  window.open('/terrain.html', '_blank');
}
