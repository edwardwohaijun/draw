//exports.randomStr = function f(){ // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  //return (Math.random() + 1).toString(36).substring(7);
//};
let crypto = require("crypto");

exports.randomNumber = function f(min, max){
  min = min || 0;
  max = max || 600;
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
exports.randomString = function f(len){
  return crypto.randomBytes(Math.ceil(len/2)).toString('hex');
};
