const svgpath = require('svgpath');
const { width, height } = require('./constants');
const { 
  checkUserHasPoint, getUserPointIndex,
  travelersPresent, getTravelerIndices
} = require('./points'); 

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#fff';
ctx.lineWidth = 2;
ctx.fillStyle = '#fff'

let userHue = 0;

const travelerHues = new Map();
function setTravelerHues(indices) {
  for(let i = 0; i < indices.length; i++) {
    travelerHues.set(indices[i], Math.random() * 360);
  }
}

function draw(paths) {
  const hueDiff = 0.2
  if(checkUserHasPoint()) {
    ctx.strokeStyle = `hsla(${userHue += hueDiff}, 100%, 50%, 0.3)`;
    drawFromSVG(pullData(paths, getUserPointIndex()));
  }
  if(travelersPresent()) {
    getTravelerIndices().forEach(index => {
      const hue = travelerHues.get(index);
      travelerHues.set(index, hue + hueDiff);
      console.log(travelerHues)
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
      drawFromSVG(pullData(paths, index));
    })
  }
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


module.exports = {
  setTravelerHues,
  draw
};