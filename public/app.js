
var width = 960,
  height = 500;

var start = Date.now(),
  points = [];

var bounds = d3.geom.polygon([
  [-width / 2, -height / 2],
  [-width / 2, +height / 2],
  [+width / 2, +height / 2],
  [+width / 2, -height / 2]
]);


popRandField(30);
// popRandCircles(3);
// popRandRotCircles(3)
genTraveler(0, 0, 0, 0)


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
  path.attr("d", function (point, i) { return line(resample(voronoi[i])); });
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

function genTraveler(xi, yi, vi, di) {
  var point = [xi, yi];
  let v = vi,
      d = di;
  d3.timer(function (elapsed) {
    v = v + genRandom(-1, 1);
    d = d + genRandom(-1, 1);
    point[0] += Math.cos(d) * v;
    point[1] += yi + Math.sin(d) * v;
  }, 0, start);
  points.push(point);
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


function randX() {
  return genRandom(-(width / 2), width / 2);
}
function randY() {
  return genRandom(-(height / 2), height / 2);
}
function genRandom(min, max, int = false) {
  let randNum = Math.random() * (max - min) + min;
  if (int) randNum = parseInt(randNum);
  return randNum;
}
