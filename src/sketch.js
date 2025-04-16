let grid, elevationMap;
let cols, rows;
let cellSize = 6.5;
let currentColor;
let colors;
let mode = 'draw';
let brushSlider, noiseSlider, smoothSlider;

function setup() {
  createCanvas(650, 650).parent('canvas-holder');
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

  createP("Brush Size").parent('ui-panel');
  brushSlider = createSlider(1, 10, 2, 1).parent('ui-panel');

  createP("Noise Scale").parent('ui-panel');
  noiseSlider = createSlider(0.01, 0.2, 0.1, 0.01).parent('ui-panel');

  createP("Smoothing Passes").parent('ui-panel');
  smoothSlider = createSlider(0, 5, 2, 1).parent('ui-panel');

  createButton("Water").parent('ui-panel').mousePressed(() => setBrush('water'));
  createButton("Grass").parent('ui-panel').mousePressed(() => setBrush('grass'));
  createButton("Hill").parent('ui-panel').mousePressed(() => setBrush('hill'));
  createButton("Mountain").parent('ui-panel').mousePressed(() => setBrush('mountain'));
  createButton("Draw Mode").parent('ui-panel').mousePressed(() => setMode('draw'));
  createButton("Heightmap Mode").parent('ui-panel').mousePressed(() => setMode('heightmap'));
  createButton("Blend Terrain").parent('ui-panel').mousePressed(blendTerrain);
  createButton("View in 3D").parent('ui-panel').mousePressed(viewIn3D);
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
      stroke(100);
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
          let neighbors = [];
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              let ni = i + dx;
              let nj = j + dy;
              if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
                if (!colorMatch(grid[ni][nj], [255, 255, 255])) {
                  neighbors.push(grid[ni][nj]);
                }
              }
            }
          }
          if (neighbors.length > 0) {
            newGrid[i][j] = neighbors[Math.floor(Math.random() * neighbors.length)];
          }
        }
      }
    }
    grid = JSON.parse(JSON.stringify(newGrid));
  }
}

function generateElevationMap() {
  elevationMap = [];
  noiseDetail(8, 0.4);
  const scale = noiseSlider.value();

  for (let i = 0; i < cols; i++) {
    elevationMap[i] = [];
    for (let j = 0; j < rows; j++) {
      const base = getBaseHeight(grid[i][j]);
      const noiseVal = noise(i * scale, j * scale) * getNoiseStrength(grid[i][j]);
      elevationMap[i][j] = constrain(base + noiseVal, 0, 1);
    }
  }
  smoothElevationMap(smoothSlider.value());
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
  if (colorMatch(c, colors.hill)) return 0.8;
  if (colorMatch(c, colors.mountain)) return 1;
  return 0.5;
}

function getNoiseStrength(c) {
  if (colorMatch(c, colors.water)) return 0.05;
  if (colorMatch(c, colors.grass)) return 0.4;
  if (colorMatch(c, colors.hill)) return 0.7;
  if (colorMatch(c, colors.mountain)) return 0.9;
  return 0.05;
}

function colorMatch(c1, c2) {
  return dist(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2]) < 20;
}

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
  let gfx = createGraphics(cols, rows);
  gfx.image(img, 0, 0);
  let dataURL = gfx.canvas.toDataURL();
  localStorage.setItem('terrain-heightmap', dataURL);
  window.open('/terrain.html', '_blank');
}
