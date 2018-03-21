
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

// circle(0, 0, 130, 96, -.001);
// circle(0, 0, 32, 96, -0.001);
// circle(0, 0, 75, 5, -.05);
// circle(0, 0, 15, 3, .05);
// circle(0, 0, 0, 1, -.02);

// circle(300, -120, 80, 7, -.02);
// circle(321, -120, 0, 1, -.02);

// circle(280, +120, 40, 8, .02);
// circle(280, +120, 20, 8, -.02);
// circle(280, +120, 0, 1, .02);

popRandField(50);


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

d3.timer(function() {
var voronoi = d3.geom.voronoi(points).map(function(cell) { return bounds.clip(cell); });
path.attr("d", function(point, i) { return line(resample(voronoi[i])); });
});


function resample(points) {
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


/** POINT GENERATORS **/

function popRandField(n) {
  for(let i = 0; i < n; i++) points.push(randCoords());
} 
function randCoords() {
  return [randX(), randY()];
}
function randX() {
  return genRandom(-(width / 2), width / 2);
}
function randY() {
  return genRandom(-(height / 2), height / 2);
}
function genRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function circle(cx, cy, r, n, δθ) {
  d3.range(1e-6, 2 * Math.PI, 2 * Math.PI / n).map(function(θ, i) {
  var point = [cx + Math.cos(θ) * r, cy + Math.sin(θ) * r];
  d3.timer(function(elapsed) {
    var angle = θ + δθ * elapsed / 60;
    point[0] = cx + Math.cos(angle) * r;
    point[1] = cy + Math.sin(angle) * r;
  }, 0, start);
  points.push(point);
  return point;
  });
}
