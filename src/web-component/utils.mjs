const colourTestCanvas = document.createElement('canvas');
colourTestCanvas.width = 1;
colourTestCanvas.height = 1;
const KNOWN_COLOURS = new Map();

export const parseCol = (col) => {
  let c = KNOWN_COLOURS.get(col);
  if (!c) {
    const ctx = colourTestCanvas.getContext('2d');
    ctx.fillStyle = col;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    c = [...ctx.getImageData(0, 0, 1, 1).data];
    KNOWN_COLOURS.set(col, c);
  }
  return c;
};

export const listen = (o, es, f) => {
  es.forEach((e) => o.addEventListener(e, f, { passive: true }));
  return () => es.forEach((e) => o.removeEventListener(e, f));
};
