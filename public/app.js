const {
  setMyPoint,
  popRandCircles, popRandClusters, popRandField,
  popRandLines, popRandRotCircles, popRandTravelers,
  randNum
} = require('./pointGenerators');
const { travelersPresent, getTravelerIndices } = require('./points');
const { definePath, animation } = require('./d3');
const { setTravelerHues } = require('./canvas');


setMyPoint();
popRandField(randNum(0, 5.5, 'int'));
popRandClusters(randNum(0, 3.5, 'int'))
// popRandClusters(2)
// popRandCircles(5);
popRandRotCircles(randNum(0, 3.5, 'int'));
// popRandRotCircles(1);
popRandTravelers(randNum(1, 2.2, 'int'), 'bouncy-edges');
popRandLines(randNum(0, 3.5, 'int'));


if(travelersPresent()) {
  setTravelerHues(getTravelerIndices());
}


definePath();
animation.setTimer();





