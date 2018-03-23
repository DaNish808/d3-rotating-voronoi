
const width = 960,
  height = 500;

const start = Date.now();

const points = [];
function addPoint(pt) {
  points.push(pt);
}
function getPoints() {
  return points;
} 

const mouse = {
  x: 0,
  y: 0
}

const bound = {
  left: -width / 2,
  right: width / 2,
  top: height / 2,
  bottom: -height / 2,
}
const loopBuffers = bufferBounds(1.25);
const bounceBuffers = bufferBounds(0.98);

function bufferBounds(bufferRatio) {
  const newBounds = { ...bound };
  for(edge in newBounds) newBounds[edge] *= bufferRatio;
  return newBounds
} 

const moveRestrictions = [
  'boundless',
  'loop-around',
  'bouncy-edges'
];

module.exports = {
  width, height, start,
  mouse, bound,
  loopBuffers, bounceBuffers,
  moveRestrictions,
  addPoint, getPoints
}