const svgpath = require('svgpath');
const { width, height } = require('./constants');
const { 
  checkUserHasPoint, getUserPointIndex,
  travelersPresent, getTravelerIndices
} = require('./points'); 

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#fff';
ctx.lineWidth = 1;
ctx.fillStyle = '#fff'

let userHue = 0;

const travelerHues = new Map();
function setTravelerHues(indices) {
  for(let i = 0; i < indices.length; i++) {
    travelerHues.set(indices[i], Math.random() * 360);
  }
}

function draw(paths) {
  // const hueDiff = 0.01
  const hueDiff = 0.05
  if(checkUserHasPoint()) {
    ctx.strokeStyle = `hsla(${userHue += hueDiff}, 100%, 50%, 0.2)`;
    drawFromSVG(pullData(paths, getUserPointIndex()));
  }
  if(travelersPresent()) {
    getTravelerIndices().forEach(index => {
      const hue = travelerHues.get(index);
      travelerHues.set(index, hue + hueDiff);
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
      drawFromSVG(pullData(paths, index));
    })
  }
  // fade();
}

function pullData(paths, index) {
  return paths[0][index].getAttribute('d');
}

function drawFromSVG(pathData) {
  const translatedData = svgpath(pathData)
    .translate(width / 2, height / 2);
  const p = new Path2D(translatedData);
  ctx.stroke(p);
}

function fade() {
  ctx.beginPath();
  ctx.rect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
  ctx.fill();
}

module.exports = {
  setTravelerHues,
  draw
};