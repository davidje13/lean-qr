const colourTestCanvas = document.createElement('canvas');
colourTestCanvas.width = colourTestCanvas.height = 1;
const ctx = colourTestCanvas.getContext('2d');
const KNOWN_COLOURS = new Map();

export const parseCol = (col) => {
  let c = KNOWN_COLOURS.get(col);
  if (!c) {
    ctx.fillStyle = col;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    KNOWN_COLOURS.set(col, (c = [...ctx.getImageData(0, 0, 1, 1).data]));
  }
  return c;
};
