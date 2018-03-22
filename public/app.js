
var width = 960,
  height = 500;

var start = Date.now(),
  points = [];

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


// popRandField(5);
// popRandClusters(genRandom(1, 4, 'int'))
// popRandClusters(2)
// popRandCircles(1);
popRandRotCircles(genRandom(1, 4, 'int'));
// popRandRotCircles(1);
// popRandTravelers(1, 'bouncy-edges');
popRandLines(genRandom(1, 20, 'int'));


var line = d3.svg.line()
  .interpolate("basis-closed");

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

var path = svg.selectAll("path")
  .data(points)
  .enter().append("path");

d3.timer(function () {
  var voronoi = d3.geom.voronoi(points).map(function (cell) { return bounds.clip(cell); });
  path.attr("d", function (point, i) { return line(resample(voronoi[i])); })
  .attr('fill', 'blue');
});


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
  for(n; n > 0; n--) pointCluster(randX(), randY(), genRandom(10, 200, 'int'), genRandom(2, 30, 'int'))
}
function pointCluster(cx, cy, r, n) {
  const randDiff = () => genRandom(-1, 1) * Math.random() * r;
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
  genLine(randX(), randY(), randX(), randY(), genRandom(3, 31, 'int'));
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
  genCircle(randX(), randY(), genRandom(3, 250, 'int'), genRandom(3, 50, 'int'))
}
function genCircle(cx, cy, r, n) {
  d3.range(1e-6, 2 * Math.PI, 2 * Math.PI / n).map(function (θ, i) {
    var point = [cx + Math.cos(θ) * r, cy + Math.sin(θ) * r];
    points.push(point);
  });
}


function popRandRotCircles(n) {
  for (let i = 0; i < n; i++) genRandRotCircle();
}
function genRandRotCircle() {
  genRotCircle(randX(), randY(), genRandom(3, 250, 'int'), genRandom(3, 50, 'int'), genRandom(-0.05, 0.05))
}
function genRotCircle(cx, cy, r, n, δθ) {
  d3.range(1e-6, 2 * Math.PI, 2 * Math.PI / n)
    .forEach(function (θ, i) {
      var point = [cx + Math.cos(θ) * r, cy + Math.sin(θ) * r];
      d3.timer(function (elapsed) {
        var angle = θ + δθ * elapsed / 60;
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
  const movement = type || moveRestrictions[genRandom(0, moveRestrictions.length, 'int')];
  genTraveler(randX(), randY(), genRandom(0.001, 5), genRandom(1, 360, 'int'), movement);
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
        d += genRandom(-wiggliness, wiggliness); 

        if(newX < bounceBuffers.left   || newX > bounceBuffers.right ||
           newY < bounceBuffers.bottom || newY > bounceBuffers.top) {
            d += Math.PI;
        }

        break;     
      
      case 'loop-around':
        modVelInRange(1, 1e-3, 5);
        d += genRandom(-wiggliness, wiggliness);

        if(newX < loopBuffers.left) newX = loopBuffers.right + loopBuffers.left - newX
        else if(newX > loopBuffers.right) newX = loopBuffers.left + newX - loopBuffers.right;

        if(newY < loopBuffers.bottom) newY = loopBuffers.top + loopBuffers.bottom - newY
        else if(newY > loopBuffers.top) newY = loopBuffers.bottom + newY - loopBuffers.top;
        break;

      default: // boundless
        modVelInRange(1, 1e-3, 5);
        d += genRandom(-wiggliness, wiggliness);
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
      v += genRandom(-mod, mod);
    } while(v > max || v < min);
  }
}


function randX() {
  return genRandom(bound.left, bound.right);
}
function randY() {
  return genRandom(bound.bottom, bound.top);
}
function genRandom(min, max, int = false) {
  let randNum = Math.random() * (max - min) + min;
  if (int) randNum = parseInt(randNum);
  return randNum;
}
