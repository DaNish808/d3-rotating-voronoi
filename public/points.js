const points = [];
function addPoint(pt) {
  return points.push(pt);
}
function getPoints() {
  return points;
} 

let userPointIndex = -1;
function setUserPointIndex(i) {
  userPointIndex = i;
  console.log('userPointIndex:', userPointIndex)
}
function getUserPointIndex() {
  return userPointIndex;
}
function checkUserHasPoint() {
  return userPointIndex !== -1;
}

let travelerPointIndices = [];
function addTravelerIndex(i) {
  travelerPointIndices.push(i);
}
function getTravelerIndices() {
  return travelerPointIndices;
}
function travelersPresent() {
  return travelerPointIndices.length > 0;
}



module.exports = {
  addPoint, getPoints,
  setUserPointIndex, getUserPointIndex, checkUserHasPoint,
  addTravelerIndex, getTravelerIndices, travelersPresent
}