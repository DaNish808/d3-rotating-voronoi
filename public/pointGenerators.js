const {
  width, height, start,
  mouse, bound, moveRestrictions,
  loopBuffers, bounceBuffers,
} = require('./constants');
const { 
  addPoint, checkUserHasPoint,
  addTravelerIndex,
} = require('./points'); 
const { modPoints } = require('./d3');




function popRandField(n) {
  for (let i = 0; i < n; i++) addPoint(randPoint());
}
function randPoint() {
  return [randX(), randY()];
}



function popRandClusters(n) {
  for(n; n > 0; n--) pointCluster(randX(), randY(), randNum(10, 200, 'int'), randNum(2, 30, 'int'))
}
function pointCluster(cx, cy, r, n) {
  const randDiff = () => randNum(-1, 1) * Math.random() * r;
  for(let i = 0; i < n; i++) {
    let dx = randDiff();
    let dy = randDiff();
    addPoint([cx + dx, cy + dy]);
  }
}



function popRandLines(n) {
  for(n; n > 0; n--) genRandLine();
}
function genRandLine() {
  genLine(randX(), randY(), randX(), randY(), randNum(3, 31, 'int'));
}
function genLine(aX, aY, bX, bY, n) {
  const calcStepDiff = (a, b) => (a - b) / (n - 1);
  const dX = calcStepDiff(aX, bX);
  const dY = calcStepDiff(aY, bY);
  let x = aX, y = aY;
  for(let i = 0; i < n; i++) {
    x += dX;
    y += dY;
    addPoint([x, y])
  }
}



function popRandCircles(n) {
  for (let i = 0; i < n; i++) genRandCircle();
}
function genRandCircle() {
  genCircle(randX(), randY(), randNum(3, 250, 'int'), randNum(3, 50, 'int'))
}
function genCircle(cx, cy, r, n) {
  d3.range(1e-6, 2 * Math.PI, 2 * Math.PI / n).map(function (theta, i) {
    var point = [cx + Math.cos(theta) * r, cy + Math.sin(theta) * r];
    addPoint(point);
  });
}



function popRandRotCircles(n) {
  for (let i = 0; i < n; i++) genRandRotCircle();
}
function genRandRotCircle() {
  genRotCircle(randX(), randY(), randNum(3, 250, 'int'), randNum(3, 50, 'int'), randNum(-0.05, 0.05))
}
function genRotCircle(cx, cy, r, n, dTheta) {
  d3.range(1e-6, 2 * Math.PI, 2 * Math.PI / n)
    .forEach(function (theta, i) {
      var point = [cx + Math.cos(theta) * r, cy + Math.sin(theta) * r];
      d3.timer(function (elapsed) {
        var angle = theta + dTheta * elapsed / 60;
        point[0] = cx + Math.cos(angle) * r;
        point[1] = cy + Math.sin(angle) * r;
      }, 0, start);
      addPoint(point);
    });
}



function popRandTravelers(n, type) {
  for (let i = 0; i < n; i++) genRandTraveler(type);
}
function genRandTraveler(type) {
  const movement = type || moveRestrictions[randNum(0, moveRestrictions.length, 'int')];
  genTraveler(randX(), randY(), randNum(0.001, 5), randNum(1, 360, 'int'), movement);
}
function genTraveler(xi, yi, vi, di, restriction, wiggliness = 0.5) {
  var point = [xi, yi];
  let v = vi,
      d = di;

  d3.timer(function (elapsed) {
    let newY = point[1] + Math.sin(d) * v;
    let newX = point[0] + Math.cos(d) * v;

    switch(restriction) {
      case 'bouncy-edges':
        modVelInRange(1, 1e-3, 5);
        d += randNum(-wiggliness, wiggliness); 

        if(newX < bounceBuffers.left   || newX > bounceBuffers.right ||
           newY < bounceBuffers.bottom || newY > bounceBuffers.top) {
            d += Math.PI;
        }

        break;     
      
      case 'loop-around':
        modVelInRange(1, 1e-3, 5);
        d += randNum(-wiggliness, wiggliness);

        if(newX < loopBuffers.left) newX = loopBuffers.right + loopBuffers.left - newX
        else if(newX > loopBuffers.right) newX = loopBuffers.left + newX - loopBuffers.right;

        if(newY < loopBuffers.bottom) newY = loopBuffers.top + loopBuffers.bottom - newY
        else if(newY > loopBuffers.top) newY = loopBuffers.bottom + newY - loopBuffers.top;
        break;

      default: // boundless
        modVelInRange(1, 1e-3, 5);
        d += randNum(-wiggliness, wiggliness);
        newX = point[0] + Math.cos(d) * v;
        newY = point[1] + Math.sin(d) * v;
      }
    point[0] = newX + Math.cos(d) * v;
    point[1] = newY + Math.sin(d) * v;
  }, 0, start);

  addTravelerIndex(addPoint(point) - 1);

  function modVelInRange(mod, min, max) {
    let i = 0;
    do{
      v += randNum(-mod, mod);
    } while(v > max || v < min);
  }
}




function setMyPoint() {
  const elBody = document.getElementById('body');
  let clientPoint = null;

  function createClientPointHandler(e) {
    if(checkUserHasPoint() === false) {
      clientPoint = [translateX(e.layerX), translateY(e.layerY)];
      modPoints(clientPoint, true);
    }
    elBody.addEventListener('mousemove', e => {
      clientPoint[0] = translateX(e.layerX);
      clientPoint[1] = translateY(e.layerY);
    })
    elBody.removeEventListener('dblclick', createClientPointHandler);
  }

  elBody.addEventListener('dblclick', createClientPointHandler);
}




// resets animation at each top-level mod of points array
function translateX(x) {
  return x - width / 2;
}
function translateY(y) {
  return y - height / 2;
}



function randX() {
  return randNum(bound.left, bound.right);
}
function randY() {
  return randNum(bound.bottom, bound.top);
}
function randNum(min, max, int = false) {
  let randNum = Math.random() * (max - min) + min;
  if (int) randNum = parseInt(randNum);
  return randNum;
}



module.exports = {
  modPoints,
  setMyPoint,
  popRandCircles,
  popRandClusters,
  popRandField,
  popRandLines,
  popRandRotCircles,
  popRandTravelers,
  randNum
}