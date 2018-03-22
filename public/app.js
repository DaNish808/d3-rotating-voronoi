const svgpath = require('svgpath');

var width = 960,
  height = 500;

var start = Date.now(),
  points = [];

let clientHasPoint = false;
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

var bounds = d3.geom.polygon([
  [-width / 2, -height / 2],
  [-width / 2, +height / 2],
  [+width / 2, +height / 2],
  [+width / 2, -height / 2]
]);


setMyPoint();
popRandField(randNum(0, 5.5, 'int'));
popRandClusters(randNum(0, 3.5, 'int'))
// popRandClusters(2)
// popRandCircles(5);
popRandRotCircles(randNum(0, 3.5, 'int'));
// popRandRotCircles(1);
popRandTravelers(randNum(0, 2, 'int'), 'bouncy-edges');
popRandLines(randNum(0, 3.5, 'int'));


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.strokeStyle = '#fff';
ctx.lineWidth = 1;
ctx.fillStyle = '#fff'


var line = d3.svg.line()
  .interpolate("basis-closed");

var svg = d3.select("body").append("svg")
  .attr("id", "voronoi-svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

var path = definePath();

function definePath() {
  return svg
    .selectAll("path")
    .data(points)
    .enter().append("path");
}

const animation = {
  timerCondition: false, // timer continues until cb returns true
  setTimer: () => {
    d3.timer(() => {
      var voronoi = d3.geom.voronoi(points).map(function (cell) { return bounds.clip(cell); });
    
      // cb cycles through each point in path
      path.attr("d", function (_, i) { return line(resample(voronoi[i])); });
      if(testBool) {
        testBool--;
        console.log('voronoi:', voronoi);
        console.log("path:", path);
        console.log("path[0][0].getAttribute('d'):", path[0][0].getAttribute('d'));
        const pathData = path[0][0].getAttribute('d');
        const translatedData = svgpath(pathData)
          .translate(width / 2, height / 2);
        const p = new Path2D(translatedData);
        console.log('Path2d:', p);
        ctx.stroke(p);
      }
      return animation.timerCondition;
    });
  },
  resetTimer: () => {
    this.timerCondition = true;
    setTimeout(() => {
      animation.timerCondition = false;
      animation.setTimer();
    }, 50)
  }
}

let testBool = 1;
animation.setTimer();




function resample(points) {
  if(points.length > 1) {
    var i = -1,
      n = points.length,
      p0 = points[n - 1], x0 = p0[0], y0 = p0[1], p1, x1, y1,
      points2 = [];
    while (++i < n) {
      p1 = points[i], x1 = p1[0], y1 = p1[1];
      points2.push(
        [(x0 * 2 + x1) / 3, (y0 * 2 + y1) / 3],
        [(x0 + x1 * 2) / 3, (y0 + y1 * 2) / 3],
        p1
      );
      p0 = p1, x0 = x1, y0 = y1;
    }
    return points2;
  }
  return points
}


/** POINT GENERATORS **/

function popRandField(n) {
  for (let i = 0; i < n; i++) points.push(randPoint());
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
    points.push([cx + dx, cy + dy]);
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
    points.push([x, y])
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
    points.push(point);
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
      points.push(point);
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

  points.push(point);

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

  elBody.addEventListener('dblclick', createClientPointHandler);
  function createClientPointHandler(e) {
    if(clientHasPoint === false) {
      clientHasPoint = true;
      clientPoint = [translateX(e.layerX), translateY(e.layerY)];
      modPoints(clientPoint);
    }
    elBody.addEventListener('mousemove', e => {
      clientPoint[0] = translateX(e.layerX);
      clientPoint[1] = translateY(e.layerY);
    })
    elBody.removeEventListener('dblclick', createClientPointHandler);
  }
}

// resets animation at each top-level mod of points array
function modPoints(newPt) {
  if(newPt) points.push(newPt);

  const elG = document.getElementById('voronoi-svg').children[0];
  while (elG.firstChild) {
    elG.removeChild(elG.firstChild);
  }

  path = definePath();
  animation.resetTimer();
}
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
