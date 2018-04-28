let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let sysConfig = require('../config/systemConfig')();
let mongoURL = sysConfig.mongoDB.url;

mongoose.connect(mongoURL, {config: {autoIndex: false}}, function(err){
  if(err){
    console.log('err connecting mongoDB: ', err)
  } else {
    console.log('Connected to mongodb!')
  }
});

let ShapeSchema = mongoose.Schema({
  versionKey: false,
  id: String,
  canvasID: String, // I need to know which canvas does this document(shape) belong to. todo: Make an index on this field in mongoDB. This is also the roomID
  customClassName: String, // custom shapes have too many data and arbitrary level of nesting shape, not possible to save them in mongo. With customClassName, I can grab the data from external module
  type: String,

  width: Number,
  height: Number,
  x: Number,
  y: Number,
  cx: Number,
  cy: Number,
  r: Number,

  textContent: String, // for text element, this is its content
  attachedTo: String, // text element can only attach to another concrete shape.

  fill: String,
  'fill-opacity': Number,
  stroke: String,
  'stroke-opacity': Number,
  'stroke-width': Number,
  'stroke-dasharray': String,
  transform: String,
  d: String,
  points: String,

  dataBboxX: Number,
  dataBboxY: Number,
  dataBboxW: Number,
  dataBboxH: Number,
  dataCX: Number, // this is optional, can be calculated in runtime
  dataCY: Number,
  shape1: String, // specific for polylines
  shape2: String, // ditto
});

let ChatSchema = mongoose.Schema({
  versionKey: false,
  msgID: String,
  canvasID: String,
  fromNickname: String,
  fromID: String,
  content: String,
  sentAt: {type: Date, default: Date.now}

});

exports.canvasShape = mongoose.model('canvasShape', ShapeSchema); // model's first arg "canvasShape" is the collection name...
//... but in mongo, you need to access it by the collection name: canvasshapes, all low cases and pluralized

exports.canvasChat = mongoose.model('canvasChat', ChatSchema);
