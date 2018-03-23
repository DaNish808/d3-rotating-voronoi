const svgpath = require('svgpath');
const ctx = require('./canvas');
const {
  width, height, start,
  mouse, bound, moveRestrictions,
  loopBuffers, bounceBuffers,
  addPoint, getPoints
} = require('./constants');



const bounds = d3.geom.polygon([
  [-width / 2, -height / 2],
  [-width / 2, +height / 2],
  [+width / 2, +height / 2],
  [+width / 2, -height / 2]
]);



const line = d3.svg.line()
  .interpolate("basis-closed");

const svg = d3.select("body").append("svg")
  .attr("id", "voronoi-svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

let path = null;

function definePath() {
  path = svg
    .selectAll("path")
    .data(getPoints())
    .enter().append("path");
  console.log('path defined:', path)
}



function modPoints(newPt) {
  if(newPt) addPoint(newPt);

  const elG = document.getElementById('voronoi-svg').children[0];
  while (elG.firstChild) {
    elG.removeChild(elG.firstChild);
  }

  definePath();
  animation.resetTimer();
}
  


let testBool = 1;
const animation = {
  timerCondition: false, // timer continues until cb returns true
  setTimer: () => {
    d3.timer(() => {
      var voronoi = d3.geom.voronoi(getPoints()).map(function (cell) { return bounds.clip(cell); });
    
      // cb cycles through each point in path
      path.attr("d", function (_, i) { return line(resample(voronoi[i])); });
      if(testBool) {
        testBool--;
        const pathData = path[0][0].getAttribute('d');
        const translatedData = svgpath(pathData)
          .translate(width / 2, height / 2);
        const p = new Path2D(translatedData);
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

module.exports = {
  animation, 
  definePath,
  modPoints
}