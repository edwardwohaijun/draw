import {MARKER_ARROW_WIDTH, MARKER_ARROW_HEIGHT, SHAPE_LEADING_MARGIN,
  CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN, CONTROL_POINT_HANDLER_WIDTH,
  TEXT_ELE_WIDTH, TEXT_ELE_HEIGHT, FILL, STROKE,
  ROTATE_HANDLER_WIDTH, ROTATE_HANDLER_HEIGHT, ROTATE_HANDLER_MARGIN, ARROW_WIDTH, ARROW_HEIGHT,
} from './constants/constants'
import React, {Component} from 'react';
import Panel from './Panel';
import Chat from './Chat';
import AttributesWindow from './AttributeWindow';
import {fromJS} from 'immutable';
import optimisePath from './utilities/optimisePath';
import updatePaths from './utilities/updatePaths';
import rotatePoint from './utilities/rotatePoint';
import getScaleHandlerPtr from './utilities/getScaleHandlerPtr';
import showHandlers from './utilities/showHandlers';
import updateHandlersPos from './utilities/updateHandlersPos';
import updateTxtPos from './utilities/updateTxtPos';
//import mergeOps from './utilities/mergeOps';
import whichQuadrant from './utilities/whichQuadrant';
import {composeD, decomposeD} from "./utilities/curve";
import {matrixMultiply, pointTransform, randomNumber, randomString} from './utilities/common'
import eventHandlers from './utilities/eventHandlers';
import regularShapes from './components/RegularShapes';
import '../public/stylesheets/style.css';
import createElements from "./utilities/createElements";

import MySocket from './components/common/GetSocket';

let spaceOnly = /^(\s|\n|\r)*$/; // to check whether the input text is empty or spaces only

class Main extends Component {
  constructor(props) {
    super(props);
    this.socket = null;

    this.staticData = {
      dragging: false, // there are too many computing in onmouseup/down, only mousedown followed by mousemove is considered dragging, thus dragging: false won't fire mouseup handler
      action: '', // allowed values are: translate, scale, rotate, draw-line, move-controlPoint, ...

      selected: {
        element: null,
        textEle: null,
      },
      selector: null, // this is the <g> tag enclosing place-holder and handlers, I need to access them frequently during transform, so saved here

      newItem: {
        elementID: '',
        local: true, // shape could be created locally( or remotely), in this case, make it selected.

        textID: '',
        textEle: null, // todo: I forgot why do I need this
      },

      transform: { // todo: all coordinates and matrix should be rounded to integer, floats consume too much space.
        matrix: [1, 0, 0, 1, 0, 0],
        startX: 0, startY: 0,
        diagonalRad: 0, // the radian or just call it width/height ratio, used in calculating deltaX/Y of mouse movement during scaling
        rotateRad: 0, // the rotation rad after transform
        scalingFactor: 1,
        scaleOrigin: [[], [], [], []],
        cx: 0, cy: 0, // center point of current shape after transform
      },

      handlersPos: [ // points coordinates around the shape when clicked as a indicator that the element is selected. 4 scale handlers, 1 rotate handler ...
        [], [], [], [], [] // but for polylines, those points are not allowed to interact in this implt.
      ],
      scaleHandlerIdx: -1,

      bbox: {x: 0, y: 0, w: 0, h: 0}, // x: 0, y: 0, // X/Y coordinates of top left point of selected element, read from element's attribute: dataBboxX/X
      // w: 0, h: 0, // width/height of selected element, read from element's attribute: dataBboxWidth/Height. these 4 values are written as custom attributes for each element during creation.

      curve: {
        CP: [[], [], [], []], // 4 control points coordinates for cubic bezier curve
        CPselected: 0, // there are 4 control points for a curve, I need to know which one is selected when updating the 'd' attribute of <path />. Allowed values are 0, 1, 2, 3.
      },

      drawLine: { // info about the line you are currently drawing
        id: '', // the lineID of the current line that user is drawing
        element: null, // svg polyline element that user is drawing
        points: [], // array of 2 points(value of 'points' attribute after joining). When drawing, there are only 2 points(start/end) for simplicity sake.
        hoveredElement: null, // when the line is still drawing, and you hover mouse on another shape(to draw a line between 2 shapes). This variable is that shape element
      },

      attached: { // key is the shapeID, value is an obj containing all the attached info (text, connected lines)
        // objA-id: {
        //     text: textID, this is the text shape ID, with which you could get text content/color/fontSize/fontFamily/width/etc
        //     lines: [lineA-ID, lineB-ID, ...], this is a Set, not an array,
        // }, objB-id: {text: {...}, lines: []
      }
    };

    this.state = {
      selectedElementID: '',
      objList: fromJS([]),
    };
  }

// https://stackoverflow.com/questions/22671799/svg-focusable-attribute-is-not-working?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  keyUpHandler = evt => { // svg-focusable is not available on safari, thus it won't capture the 'Delete' keyUp evt. I have to use context menu to add 'del' item
    if (this.staticData.action === 'text-editing') return; // todo: blur 时候需要reset action. ?????????????????????

    let eleID = this.state.selectedElementID;
    if (!eleID || ((evt.key !== 'Backspace') && (evt.key !== 'Delete'))) return; // todo: need to test on windows/linux

    let operations = this.removeShape(eleID);
    operations.forEach(o => {
      this.socket.emit(o.event, o.data)
    })
  };

  componentDidMount = () => {
    this.socket = MySocket.getSocket();
    this.socket.on('/canvas/init', canvasData => this.setState({objList: fromJS(canvasData)}));
    eventHandlers(this.socket, this.staticData, this.createShape, this.removeShape); // todo: rename to shapeEvtHandlers
    this.staticData.selector = document.getElementById('selector-layer');

  };

  componentDidUpdate = () => {
    if (this.staticData.drawLine.id){ // user has drawn a line
      let ele = document.getElementById(this.staticData.drawLine.id);
      if (ele){this.staticData.drawLine.element = ele}
    }

    if (this.staticData.newItem.textID){ // user double-click a shape to create an attached text
      this.setFocusOnText(this.staticData.newItem.textID);
      this.staticData.newItem.textID = '';
    }

    if (this.staticData.newItem.elementID && this.staticData.newItem.local){ // user has created a new shape.
      // failed attempt to make the newly created shape selected. Try it in next release
    }
  };

  // too much work behind the removeShape, I just remove the shape and all the associated shapes locally, ...
  // ...then return all the follow-up socket events to be invoked by the caller
  // If I had called all the socket.emit in this function, it'd has caused infinite loop...
  // A removed the shape, calling socket.emit, B received socket evt, call removeShape, A received socket evt, call removeShape again.....
  removeShape = shapeID => { // the attached text also need to be removed, lineData also need to be updated. this function also returns all the socket evts for caller to invoke
    let operations = [];
    let shapeList = this.state.objList;
    let shapeIdx = shapeList.findIndex(s => s.get('id') === shapeID);
    if (shapeIdx === -1) {
      return operations;
    }
    shapeList = shapeList.delete(shapeIdx);
    operations.push({event: '/canvas/delete-shape', data: {id: shapeID}});

    let textID = this.staticData.attached[shapeID].text; // remove associated text
    if (textID) {
      operations.push({event: '/canvas/delete-shape', data: {id: textID}});
      let textIdx = shapeList.findIndex(s => s.get('id') === textID);
      if (textIdx !== -1){
        shapeList = shapeList.delete(textIdx)
      }
    }

    let lines = this.staticData.attached[shapeID].lines; // remove associated lines
    lines.forEach(lineID => {
      let line, lineContainer = document.getElementById(lineID);
      if (lineContainer){
        line = lineContainer.getElementsByClassName('polyline-shape')[0];
        let shape1 = line.getAttribute('data-shape1');
        let shape2 = line.getAttribute('data-shape2');
        if (shape1 === shapeID) {
          operations.push({event: '/canvas/set-attribute', data: {id: lineID, attributeName: 'shape1', value: ''}});
          line.setAttribute('data-shape1', '');
        }
        if (shape2 === shapeID) {
          operations.push({event: '/canvas/set-attribute', data: {id: lineID, attributeName: 'shape2', value: ''}});
          line.setAttribute('data-shape2', '');
        }
      }
    });

    let shapeEle = document.getElementById(shapeID);
    if (!shapeEle) {return operations}

    let textEle = shapeEle.getElementsByClassName('attached-text'); //  we are deleting a text element, check its attached-to attribute
    if (textEle.length > 0){
      let attachedEle = textEle[0].getAttribute('data-attachedto');
      if (attachedEle){
        this.staticData.attached[attachedEle].text = '';
      }
    }

    let polylines = shapeEle.getElementsByClassName('polyline-shape'); // we are deleting a polyline, check its data-shape1/2 attributes
    if (polylines.length > 0){ // it's a line we are deleting
      let shape1 = polylines[0].getAttribute('data-shape1');
      if (shape1){this.staticData.attached[shape1].lines.delete(shapeID)}

      let shape2 = polylines[0].getAttribute('data-shape2');
      if (shape2){this.staticData.attached[shape2].lines.delete(shapeID)}
    }

    let selectedElementID = ''; // shape could be removed locally or remotely by other peer
    if (this.state.selectedElementID !== shapeID){ // Deletion is invoked by network peer, keep the selectedElementID unchanged
      selectedElementID = this.state.selectedElementID
    } else { // if the selected element is the shape to be remove, it's probably removed by current user by pressing DEL key
      this.staticData.selected.element = null;
      this.staticData.selected.textEle = null;
    }

    delete this.staticData.attached[shapeID];
    this.setState({
      objList: shapeList,
      selectedElementID: selectedElementID
    });

    return operations
  };

  createShape = (evt, shape) => {
    if (!evt){ // shape is created by another peer in the network. Exception is: dbl-click a shape to create a text element
      return this.setState({
        objList: this.state.objList.push(fromJS(shape)),
      })
    }

    // shape is created locally by clicking the button on left panel
    let m = [1, 0, 0, 1, randomNumber(0, 800), randomNumber(0, 480)];
    let type = evt.target.id.split('-')[1];
    let id = randomString(12);
    let newShape = regularShapes[type];

    let fill = FILL[ Math.floor( Math.random() * FILL.length )];
    let stroke = STROKE[ Math.floor( Math.random() * STROKE.length)];
    let customProps = {id, fill, stroke, transform: `matrix(${m.join(' ')})`};
    Object.assign(newShape, customProps);

    this.socket.emit('/canvas/new-shape', newShape);
    this.setState({
      objList: this.state.objList.push(fromJS(newShape)),
      // selectedElementID: id, // todo: set this newly created shape as selected if created locally
    })
  };

  cloneShape = () => {
    if (!this.state.selectedElementID) return;

    this.socket.emit('/canvas/clone-shape', this.state.selectedElementID);
    this.ctxMenu.style.display = 'none';
  };

  translate = evt => {
    if (this.staticData.selected.element.getElementsByClassName('polyline-shape').length > 0) return; // polylines are not allowed to be translated by moving handlers in this implt.

    let x = evt.clientX - CANVAS_LEFT_MARGIN, y = evt.clientY - CANVAS_TOP_MARGIN;
    let deltaX = x - this.staticData.transform.startX;
    let deltaY = y - this.staticData.transform.startY;
    this.staticData.transform.startX = x ;
    this.staticData.transform.startY = y;
    this.staticData.transform.matrix[4] += deltaX;
    this.staticData.transform.matrix[5] += deltaY;

    this.staticData.handlersPos = this.staticData.handlersPos.map(p => (
      [p[0] += deltaX, p[1] += deltaY]
    ));
    let placeholder = this.staticData.selector.getElementsByTagName('polygon')[0]; // place-holder is a <polygon >
    placeholder.setAttribute('points', this.staticData.handlersPos.slice(0, 4).join(' ')); // 4 scale handlers, 1 rotate handler, for place-holder polygon, only the first 4 is needed
  };

  scale = evt => {
    let x = evt.clientX - CANVAS_LEFT_MARGIN, y = evt.clientY - CANVAS_TOP_MARGIN;
    let handlersPos = this.staticData.handlersPos;
    let pullPoint = handlersPos[ this.staticData.scaleHandlerIdx ]; // the handler point you are holding and dragging
    let anchorPoint = handlersPos[ (this.staticData.scaleHandlerIdx + 2) % 4 ]; // if handler 3 was clicked, the anchor point is at its diagonal(index 1): the only point whose coordinate doesn't change during scale

    let lineA = Math.sqrt( Math.pow(x - anchorPoint[0], 2) + Math.pow(y - anchorPoint[1], 2) ),
        lineB = Math.sqrt( Math.pow(this.staticData.transform.startX - anchorPoint[0], 2) + Math.pow(this.staticData.transform.startY - anchorPoint[1], 2));
    this.staticData.transform.startX = x;
    this.staticData.transform.startY = y;
    let delta = lineA - lineB;
    let deltaX = delta * Math.abs(Math.cos(this.staticData.transform.diagonalRad));
    let deltaY = delta * Math.abs(Math.sin(this.staticData.transform.diagonalRad));

    switch (whichQuadrant(anchorPoint, pullPoint)){
      case 1:
        pullPoint[0] += deltaX; pullPoint[1] += deltaY;
        break;
      case 2:
        pullPoint[0] -= deltaX; pullPoint[1] += deltaY;
        break;
      case 3:
        pullPoint[0] -= deltaX; pullPoint[1] -= deltaY;
        break;
      case 4:
        pullPoint[0] += deltaX; pullPoint[1] -= deltaY;
        break;
    }

    let points = getScaleHandlerPtr(anchorPoint, pullPoint, this.staticData.transform.rotateRad);
    let pullIdx = this.staticData.scaleHandlerIdx;
    handlersPos[pullIdx] = pullPoint;
    handlersPos[(pullIdx + 3) % 4] = points[0]; // the point before pullPoint in clockwise
    handlersPos[(pullIdx + 1) % 4] = points[1]; // the point after pullPoint in clockwise

    let placeholder = this.staticData.selector.getElementsByTagName('polygon')[0]; // // place-holder is a <polygon >
    placeholder.setAttribute('points', handlersPos.slice(0, 4).join(' '));
  };

  rotate = evt => {
    let x = evt.clientX - CANVAS_LEFT_MARGIN, y = evt.clientY - CANVAS_TOP_MARGIN;
    let r1 = Math.atan2(this.staticData.transform.startY - this.staticData.transform.cy, this.staticData.transform.startX - this.staticData.transform.cx);
    let r2 = Math.atan2(y - this.staticData.transform.cy, x - this.staticData.transform.cx);
    let rotateRadian = r2 - r1;
    this.staticData.transform.startX = x;
    this.staticData.transform.startY = y;

    let origin = [this.staticData.transform.cx, this.staticData.transform.cy];
    this.staticData.handlersPos = this.staticData.handlersPos.map(h => rotatePoint(h, origin, rotateRadian));

    let placeholder = this.staticData.selector.getElementsByTagName('polygon')[0];
    placeholder.setAttribute('points', this.staticData.handlersPos.slice(0, 4).join(' '));

    let rotateHandler = document.getElementById('rotate-handler'); // todo: save this into staticData.
    rotateHandler.setAttribute('x', this.staticData.handlersPos[4][0] - ROTATE_HANDLER_WIDTH/2);
    rotateHandler.setAttribute('y', this.staticData.handlersPos[4][1] - ROTATE_HANDLER_HEIGHT/2);
  };

  moveControlPoint = evt => {
    let x = evt.clientX - CANVAS_LEFT_MARGIN,
        y = evt.clientY - CANVAS_TOP_MARGIN;
    let CP = this.staticData.curve.CP;
    let CPselected = this.staticData.curve.CPselected;

    CP[CPselected][0] += x - this.staticData.transform.startX;
    CP[CPselected][1] += y - this.staticData.transform.startY;
    this.staticData.transform.startX = x;
    this.staticData.transform.startY = y;

    let d = composeD(CP);
    this.staticData.selected.element.getElementsByTagName('path')[0].setAttribute('d', d);
    this.staticData.selected.element.getElementsByTagName('path')[1].setAttribute('d', d); // this is the proxy-line

    let tangent = this.staticData.selector.getElementsByClassName('control-point-tangent');
    if (CPselected === 0 || CPselected === 1){
      tangent[0].setAttribute(`x${CPselected + 1}`, x);
      tangent[0].setAttribute(`y${CPselected + 1}`, y)
    } else {
      tangent[1].setAttribute(`x${CPselected - 1}`, x);
      tangent[1].setAttribute(`y${CPselected - 1}`, y);
    }
    let CPhandler = this.staticData.selector.getElementsByClassName('control-point-handler');
    CPhandler[CPselected].setAttribute('x', x - CONTROL_POINT_HANDLER_WIDTH/2);
    CPhandler[CPselected].setAttribute('y', y - CONTROL_POINT_HANDLER_WIDTH/2);
  };

  drawLine = evt => {
    if (!this.staticData.drawLine.element) return;

    let x = evt.clientX,
        y = evt.clientY;
    this.staticData.drawLine.points[1] = [x - CANVAS_LEFT_MARGIN, y - CANVAS_TOP_MARGIN];
    this.staticData.drawLine.element.getElementsByTagName('polyline')[0].setAttribute('points', this.staticData.drawLine.points.join(' '))
  };

  onMouseMove = evt => {
    if (!this.staticData.action || this.staticData.action === 'text-editing') return;

    this.staticData.dragging = true;
    switch (this.staticData.action){
      case 'translate': this.translate(evt); break;
      case 'rotate': this.rotate(evt); break;
      case 'scale': this.scale(evt); break;
      case 'move-controlPoint': this.moveControlPoint(evt); break;
      case 'draw-line': this.drawLine(evt); break;
      default: console.log('unknown action: ', this.staticData.action)
    }
  };

  onMouseDown = evt => {
    let placeHolder = this.staticData.selector.getElementsByClassName('place-holder')[0];
    if (placeHolder){ placeHolder.setAttribute('visibility', 'visible')}

    if (this.ctxMenu.style.display === 'block') this.ctxMenu.style.display = 'none'; // hide ctx menu

    this.staticData.transform.startX = evt.clientX - CANVAS_LEFT_MARGIN;
    this.staticData.transform.startY = evt.clientY - CANVAS_TOP_MARGIN;

    let target = evt.target;
    let selectedEle = target.closest('.shape-container');

    // the point is: mouseDown/Up handler is too heavy, try to avoid them in case like: users click a shape which is already the selected one...
    // ... why won't I use "shouldComponentUpdate" instead? Because if I can skip the following code, setState doesn't have a chance to run, no need to bother with shouldComponentUpdate.
    if (target.classList.contains('shape') && selectedEle && selectedEle.id === this.state.selectedElementID){
      this.staticData.action = 'translate';
      return
    }

    // todo: there are many duplicate code, like setting rotateRad.
    if (selectedEle) { // click on concrete shape which could be a curve, polyline or a regular shape
      // console.log('selectedEle: ', selectedEle);
      this.staticData.selected.element = selectedEle;
      let m = this.staticData.transform.matrix = selectedEle.getAttribute('transform').slice(7, -1).split(' ').map(parseFloat);
      this.staticData.transform.rotateRad = Math.atan(m[2] / m[0]) ; // https://stackoverflow.com/questions/15546273/svg-matrix-to-rotation-degrees

      // I hate this curve, curse the curve.
      let isCurve = selectedEle.getElementsByClassName('curved-shape').length !== 0; // curves are manipulated by 4 control points, thus no scale/rotate handlers
      let isPolyline = selectedEle.getElementsByClassName('polyline-shape').length !== 0; // polylines are not allowed to manipulate for this implt

      if (isCurve) {
        this.staticData.curve.CP = decomposeD( evt.target.getAttribute('d') );
        let bbox = selectedEle.getBoundingClientRect(); // https://stackoverflow.com/questions/33688549/getbbox-vs-getboundingclientrect-vs-getclientrects
        let [x, y, w, h] = [bbox.left - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN, bbox.width, bbox.height];
        this.staticData.handlersPos = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; // handlersPos are used here to draw the place-holder

      } else if (isPolyline) {
        // when polyline is selected, each turning has a point. This array saves those points's coordinate, using it to show a blue dot.
        this.staticData.handlersPos = selectedEle.getElementsByClassName('polyline-shape')[0].getAttribute('points').split(/\s+/).map(p => p.split(',').map(num => parseInt(num)));
        // in this implt, those dots are not allowed to interact

      } else { // regular shape
        let x = this.staticData.bbox.x = selectedEle.getAttribute('data-bboxx') * 1;
        let y = this.staticData.bbox.y = selectedEle.getAttribute('data-bboxy') * 1;
        let w = this.staticData.bbox.w = selectedEle.getAttribute('data-bboxw') * 1;
        let h = this.staticData.bbox.h = selectedEle.getAttribute('data-bboxh') * 1;
        this.staticData.transform.scalingFactor = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        let handlersPos = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x + w/2, (y - ROTATE_HANDLER_MARGIN)/this.staticData.transform.scalingFactor]]; // the last one is the rotate handler
        this.staticData.transform.scaleOrigin = handlersPos.slice(0, 4); // When a shape is selected, I don't know which scale handler user would click, hence I add all 4 of them as scaleOrigin ...
        // ... when scaleHandler with idx 1 is clicked, the shape is scaled around the scaleHandler with idx 3(I call it scaleOrigin)
        this.staticData.handlersPos = handlersPos.map(p => pointTransform(this.staticData.transform.matrix, p));
      }

      this.staticData.action = 'translate';
      this.setState({selectedElementID: selectedEle.id});
      return;
    }

    // from this line down to the end of the function, we are clicking on a handler
    if (evt.target.classList.contains('control-point-handler')){
      this.staticData.action = 'move-controlPoint';
      this.staticData.curve.CPselected = parseInt(evt.target.id[evt.target.id.length - 1]);

    } else if (target.classList.contains('scale-handler')) {
      this.staticData.action = 'scale';
      let scaleIdx = this.staticData.scaleHandlerIdx = parseInt(target.id.split('-')[2]); // there are 4 scale handlers(top-left, top-right, bottom-right, bottom-left) indexed by 0 ~ 3. Here I save which idx was moused-down
      let pullPoint = this.staticData.handlersPos[scaleIdx];
      let anchorPoint = this.staticData.handlersPos[(scaleIdx + 2) % 4];
      this.staticData.transform.diagonalRad = Math.atan2(pullPoint[1] - anchorPoint[1], pullPoint[0] - anchorPoint[0]); // https://stackoverflow.com/questions/15546273/svg-matrix-to-rotation-degrees
      this.staticData.transform.rotateRad = Math.atan(this.staticData.transform.matrix[2] / this.staticData.transform.matrix[0]);

      let rotateHandler = this.staticData.selector.getElementsByClassName('rotate-handler')[0];
      rotateHandler.setAttribute('visibility', 'hidden');

    } else if (target.classList.contains('rotate-handler')) {
      this.staticData.action = 'rotate';
      [this.staticData.transform.cx, this.staticData.transform.cy] = pointTransform(this.staticData.transform.matrix, [this.staticData.selected.element.getAttribute('data-cx') * 1, this.staticData.selected.element.getAttribute('data-cy') * 1]);

    } else if (evt.target.classList.contains('line-connect-handler')) {
      this.staticData.action = 'draw-line';

      let shape = this.staticData.selected.element.getElementsByClassName('shape')[0]; // shape className is the concrete shape
      if (!shape) return;

      let bbox = shape.getBoundingClientRect();
      let candidatePoints = [
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.top], // top
        [bbox.right - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2], // right
        [bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2, bbox.bottom], // bottom
        [bbox.left - CANVAS_LEFT_MARGIN, bbox.top + bbox.height / 2], // left
      ];

      let handlerID = parseInt(evt.target.id.split('-')[3]);
      this.staticData.drawLine.points = [candidatePoints[handlerID], candidatePoints[handlerID]]; // the moment you click the connect-line handler, a line is being drawn ...
      // ... with the same starting and end points

      let id = this.staticData.drawLine.id = randomString(12); // id is used in componentDidUpdate: save the actual line element when its DOM is created
      this.setState({
        objList: this.state.objList.push(fromJS({
          id: id, type: 'polyline', stroke: '#424242', strokeWidth: 1, fill: 'none', transform: 'matrix(1 0 0 1 0 0)',
          points: `${candidatePoints[handlerID].join(',')} ${candidatePoints[handlerID].join(',')}`,
        }))
      });

    } else { // click on empty space
      this.staticData.selected.element = '';
      this.staticData.transform.matrix = [];
      this.staticData.action = '';
      this.setState({selectedElementID: ''})
    }
  };

  onMouseUp = evt => {
    let placeHolder = this.staticData.selector.getElementsByClassName('place-holder')[0];
    if (placeHolder){ placeHolder.setAttribute('visibility', 'hidden')}

    if (!this.staticData.action || !this.staticData.dragging) { // dbl-click to enter text? this satisfies this "if", the result is: action/dragging both are false????
      this.staticData.action = '';
      this.staticData.dragging = false;
      return;
    } // empty action means you are clicking on empty space, false dragging means you are clicking then release, no movement


    // polylines are not allowed to translate/rotate or whatever in this implt,
    if (this.staticData.selected.element.getElementsByClassName('polyline-shape').length > 0) return;

    let bbox;
    let m = this.staticData.transform.matrix;
    let mStr = `matrix(${m.join(' ')})`;
    let action = this.staticData.action;
    switch(action){
      case "translate": // could use one function to do some post-transform work
        this.staticData.selected.element.setAttribute('transform', mStr);
        this.socket.emit('/canvas/set-attribute', {id: this.state.selectedElementID, attributeName: 'transform', value: mStr});
        break;
      case "rotate":
        let newPosition = this.staticData.handlersPos[0]; // grab the same point after and before rotation, then calculate the radian diff in respect to the same center point.
        let oldPositionX = this.staticData.selected.element.getAttribute('data-bboxx') * 1, // handlersPos[0] is the position of first scale-handler(always at top-left) after rotate
            oldPositionY = this.staticData.selected.element.getAttribute('data-bboxy') * 1; // oldPositionX/Y is the position of top-left corner of the shape before rotate
        [oldPositionX, oldPositionY] = pointTransform(m, [oldPositionX, oldPositionY]); // get the updated oldPositionX/Y but before the current rotate applied

        let r1 = Math.atan2(oldPositionY - this.staticData.transform.cy, oldPositionX - this.staticData.transform.cx);
        let r2 = Math.atan2(newPosition[1] - this.staticData.transform.cy, newPosition[0] - this.staticData.transform.cx);
        let rotateMatrix = [Math.cos(r2 - r1), Math.sin(r2 - r1), -Math.sin(r2 - r1), Math.cos(r2 - r1), 0, 0];
        let cx = this.staticData.selected.element.getAttribute('data-cx') * 1;
        let cy = this.staticData.selected.element.getAttribute('data-cy') * 1;

        m = matrixMultiply(m, [1, 0, 0, 1, cx, cy]);
        m = matrixMultiply(m, rotateMatrix);
        m = matrixMultiply(m, [1, 0, 0, 1, -cx, -cy]);
        m = m.map(num => Math.round(num * 100)/100);
        this.staticData.transform.matrix = m;
        this.staticData.selected.element.setAttribute('transform', `matrix(${m.join(' ')})`);
        this.socket.emit('/canvas/set-attribute', {id: this.state.selectedElementID, attributeName: 'transform', value: `matrix(${m.join(' ')})`});
        break;

      case "scale":
        let scaleOriginIdx = (2 + this.staticData.scaleHandlerIdx) % 4; // if scaleHandler number 2 is clicked, the shape is scaled around the scaleHandler number 0(the one at diagonal)
        let scaleOrigin = this.staticData.transform.scaleOrigin[scaleOriginIdx];
        let handler0 = this.staticData.selector.getElementsByClassName('scale-handler')[0];
        let handler1 = this.staticData.selector.getElementsByClassName('scale-handler')[1];
        let originalWidth = Math.abs(handler0.getAttribute('x') * 1 - handler1.getAttribute('x') * 1);
        let newWidth = Math.abs(this.staticData.handlersPos[0][0] - this.staticData.handlersPos[1][0]);
        let scalingFactor = Math.round(100 * newWidth/originalWidth)/100;
        // let scalingFactor = this.staticData.transform.scalingFactor = newWidth/originalWidth; // this is wrong, because scalingFactor should be the one applied on the original shape...
        // ... newWidth/originalWidth is the scalingFactor of currentWidth/lastWidth(which might already has scaled)

        m = matrixMultiply(m, [1, 0, 0, 1, ...scaleOrigin]);
        m = matrixMultiply(m, [scalingFactor, 0, 0, scalingFactor, 0, 0]);
        m = matrixMultiply(m, [1, 0, 0, 1, -scaleOrigin[0], -scaleOrigin[1]]);
        m = m.map(num => Math.round(num * 100)/100);

        this.staticData.transform.matrix = m; // todo: don't forget to reset width
        this.staticData.transform.scalingFactor = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        this.staticData.selected.element.setAttribute('transform', `matrix(${m.join(' ')})`);
        this.socket.emit('/canvas/set-attribute', {id: this.state.selectedElementID, attributeName: 'transform', value: `matrix(${m.join(' ')})`});
        let rotateHandler = this.staticData.selector.getElementsByClassName('rotate-handler')[0];
        rotateHandler.setAttribute('visibility', 'visible');
        break;

      case "move-controlPoint":
        bbox = this.staticData.selected.element.getBoundingClientRect();
        let [x, y, w, h] = [bbox.left - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN, bbox.width, bbox.height];
        let placeHolder = this.staticData.handlersPos = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
        this.staticData.selector.getElementsByClassName('place-holder')[0].children[0].setAttribute('points', placeHolder.map(p => p.join(',')).join(' '));
        this.socket.emit('/canvas/set-attribute', {id: this.state.selectedElementID, attributeName: 'd', value: `${composeD(this.staticData.curve.CP)}`});
        break;

      case "draw-line": // todo: if startPoint and entPoint are the same, it should be deleted
        let line = this.staticData.drawLine.element;
        if (!line) break;

        // this line's presence confirmed this is the moment when the line drawing is just finished
        bbox = this.staticData.selected.element.getElementsByClassName('shape')[0].getBoundingClientRect();
        let fromRec = [ // the 4 points go from [top, right, bottom, left]
          [bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width/2), bbox.top - CANVAS_TOP_MARGIN],
          [bbox.right - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height/2)],
          [bbox.left - CANVAS_LEFT_MARGIN + Math.round(bbox.width/2), bbox.bottom],
          [bbox.left - CANVAS_LEFT_MARGIN, bbox.top - CANVAS_TOP_MARGIN + Math.round(bbox.height/2)]
        ]; // todo: do the rounding inside optimisePath

        let hoveredEle = this.staticData.drawLine.hoveredElement; // todo: what if the hoveredEle is also the currently selected element
        let path;
        if (hoveredEle){ // users draw a line between 2 shapes, the hoveredShape is the target
          let bbox2 = hoveredEle.getBoundingClientRect();
          let toRect = [
            [bbox2.left - CANVAS_LEFT_MARGIN + Math.round(bbox2.width/2), bbox2.top - CANVAS_TOP_MARGIN],
            [bbox2.right - CANVAS_LEFT_MARGIN, bbox2.top - CANVAS_TOP_MARGIN + Math.round(bbox2.height/2)],
            [bbox2.left - CANVAS_LEFT_MARGIN + Math.round(bbox2.width/2), bbox2.bottom],
            [bbox2.left - CANVAS_LEFT_MARGIN, bbox2.top - CANVAS_TOP_MARGIN + Math.round(bbox2.height/2)]
          ];
          hoveredEle.setAttribute('filter', 'none');
          let hoveredEleID = hoveredEle.closest('.shape-container').id;
          path = optimisePath(fromRec, toRect, SHAPE_LEADING_MARGIN);
          line.getElementsByClassName('shape')[0].setAttribute('points', path);
          line.getElementsByClassName('shape-proxy')[0].setAttribute('points', path);
          line.getElementsByClassName('shape')[0].setAttribute('data-shape2', hoveredEleID);
          this.socket.emit('/canvas/new-shape', {id: this.staticData.drawLine.id, type: 'polyline',
            transform: 'matrix(1 0 0 1 0 0)', shape1: this.state.selectedElementID, shape2: hoveredEleID, points: path});
          this.staticData.attached[hoveredEle.closest('.shape-container').id].lines.add(this.staticData.drawLine.id);

        } else { // users draw a line to the empty space, no targeting shape to link
          let p = [evt.clientX - CANVAS_LEFT_MARGIN, evt.clientY - CANVAS_TOP_MARGIN];
          path = optimisePath(fromRec, [p, p, p, p], SHAPE_LEADING_MARGIN);
          line.getElementsByClassName('shape')[0].setAttribute('points', path);
          line.getElementsByClassName('shape-proxy')[0].setAttribute('points', path);
          this.socket.emit('/canvas/new-shape', {id: this.staticData.drawLine.id, type: 'polyline',
          transform: 'matrix(1 0 0 1 0 0)', shape1: this.state.selectedElementID, shape2: '', points: path});
        }

        line.getElementsByClassName('shape')[0].setAttribute('data-shape1', this.state.selectedElementID);
        this.staticData.attached[this.state.selectedElementID].lines.add(this.staticData.drawLine.id);

        this.staticData.drawLine.hoveredElement = null;
        this.staticData.drawLine.id = '';
        this.staticData.drawLine.points = [];
        this.staticData.drawLine.element = null;
        break;

      default: console.log('unknown action in mouseup')
    }

    // not all cases need to call updatePaths.
    if (this.staticData.dragging && (action === 'translate' || action === 'rotate' || action === 'scale')){
      updateHandlersPos(this.staticData);
      if (this.state.selectedElementID){ // update current element's all polyline paths.
        let lines = this.staticData.attached[ this.state.selectedElementID ].lines;
        if (lines.size > 0){ // polylines could be updated locally when associated shape get transformed, but server also need to know the polyline changes(to be saved into mongoDB)
        // thus, we have to call socket.emit to notify the change
          let newPaths = updatePaths(this.staticData.selected.element, lines);
          newPaths.forEach(p => this.socket.emit('/canvas/set-attribute', {id: p.lineID, attributeName: 'points', value: p.path}))
        }

        let textID = this.staticData.attached[ this.state.selectedElementID ].text;
        if (textID){
          let matrix = updateTxtPos(textID, this.state.selectedElementID);
          this.socket.emit('/canvas/set-attribute', {id: textID, attributeName: 'transform', value: matrix})
        }
      }
    }

    if (this.staticData.dragging && (action === 'move-controlPoint' )){

    }

    this.staticData.dragging = false;
    this.staticData.action = '';
  };

  setFocusOnText = textID => { // make the "content-editable div" input-ready when you double-click a shape.
    if (textID){
      let textContainer = document.getElementById('attached-text-' + textID);
      if (textContainer){ // credit: https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element
        let p = textContainer.getElementsByClassName('attached-text')[0],
            s = window.getSelection(),
            r = document.createRange();
        r.setStart(p, 0);
        r.setEnd(p, 0);
        s.removeAllRanges();
        s.addRange(r);
      }
    }
  };

  onDblClick = evt => { // double click also fire single click(but twice), thus the dbl-clicked element became selected
    if (!evt.target.classList.contains('shape')) return; // only concrete element with shape class accept double-click. Polylines also don't support attached text in this implt

    let textID = this.staticData.attached[this.state.selectedElementID].text;
    if (!textID){ // selectedElement has no attached text yet
      let newTextID = randomString(12);
      this.staticData.attached[this.state.selectedElementID].text = newTextID;
      this.staticData.newItem.textID = newTextID;
      let newText = {
        id: newTextID,
        type: 'text',
        attachedTo: this.state.selectedElementID,
        transform: updateTxtPos('', this.state.selectedElementID),
        textContent: '',
      };

      this.socket.emit('/canvas/new-shape', newText);
      this.setState({
        objList: this.state.objList.push(fromJS(newText)),
      })

    } else { // editable div already exists.
      this.setFocusOnText(textID);
      this.staticData.newItem.textEle = document.getElementById('attached-text-' + textID);
    }
    this.staticData.action = 'text-editing'
  };

  onCtxMenu = evt => {
    evt.preventDefault();
    let ctx = this.ctxMenu;
    ctx.style.display = 'block';
    ctx.style.left = evt.clientX + 'px';
    ctx.style.top = evt.clientY + 'px';
    return false; // omitting this would cause standard context menu to pop up
  };

  onCtxDelete = evt => {
    this.ctxMenu.style.display = 'none';
    let ops = this.removeShape(this.state.selectedElementID);
    ops.forEach(o => this.socket.emit(o.event, o.data));
  };

  onTextBlur = evt => {
    this.staticData.action = '';
    let txtContent = evt.target.innerText.substr(0, 50); // only grab the first 50 characters.
    if (spaceOnly.test(txtContent)){ // empty text? then delete the whole text element
      let shapeID = evt.target.closest('.shape-container').id;
      let ops = this.removeShape(shapeID);
      ops.forEach(o => this.socket.emit(o.event, o.data))
    } else {
      this.socket.emit('/canvas/set-attribute', {id: evt.target.closest('.shape-container').id, attributeName: 'textContent', value: txtContent});
    } // innerText could auto insert <br>, whereas textContent won't
  };

  onTextFocus = evt => { // ?????????????????????????????? why not used????????
    this.staticData.action = 'text-editing'
  };

  onHover = evt => { // todo: what if user want to draw a line from shapeA to shapeA(the same one)
    if (this.staticData.action !== 'draw-line') return;

    let classList = evt.target.classList;
    if (classList.contains('polyline-shape') || classList.contains('curved-shape')) {
      this.staticData.drawLine.hoveredElement = null;
      return;
    }

    if (this.staticData.drawLine.hoveredElement !== evt.target){ // WTF????
      this.staticData.drawLine.hoveredElement = evt.target;
      this.staticData.drawLine.hoveredElement.setAttribute('filter', "url(#blurFilter2)")
    }
  };

  onHoverOut = evt => { // when the line is drawing and mouse is hovering on the target shape, there was supposed to be only one mouseEnter, mouseLeave,
  // but I don't know why there are many of them fired as long as the mouse is still moving inside the target shape.
  // So I have to use evt.clientX/Y to check whether the mouse is still inside the target or not.
    if (this.staticData.drawLine.hoveredElement === evt.target && this.staticData.action === 'draw-line'){
      let bbox = this.staticData.drawLine.hoveredElement.getBoundingClientRect();
      if (evt.clientX < bbox.left || evt.clientX > bbox.right || evt.clientY < bbox.top || evt.clientY > bbox.bottom){ // mouse move out of the current shape.
        this.staticData.drawLine.hoveredElement.setAttribute('filter', 'none');
        this.staticData.drawLine.hoveredElement = null;
      }
    }
  };

  render() {
    let isLine = false, ele;
    if (ele = this.staticData.selected.element){
      if (ele.getElementsByClassName('polyline-shape').length || ele.getElementsByClassName('curved-shape').length){
        isLine = true;
      }
    }

    return (
        <div>
          <Panel createShape={this.createShape}/>
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
               id='work-space' style={{position: 'absolute', left: `${CANVAS_LEFT_MARGIN + 1}px`, top: '0px', height: '100%', width: '100%', backgroundColor: '#F5F5F5'}}
               version="1.1" baseProfile="full" focusable="true" tabIndex="0"
               onKeyUp={this.keyUpHandler} onDoubleClick={this.onDblClick} onMouseMove={this.onMouseMove} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}>
            <defs>
              <pattern id="small-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#BDBDBD" strokeWidth="0.5"/>
              </pattern>
              <pattern id="medium-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#BDBDBD" strokeWidth="0.5"/>
              </pattern>

              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="url(#medium-grid)"/>
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#BDBDBD" strokeWidth="1"/>
              </pattern>

              <filter id="blurFilter2" y="-10" height="40" x="-10" width="150">
                <feOffset in="SourceAlpha" dx="3" dy="3" result="offset2" />
                <feGaussianBlur in="offset2" stdDeviation="3"  result="blur2"/>
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <marker xmlns="http://www.w3.org/2000/svg" id="marker-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse"
                      markerWidth={MARKER_ARROW_WIDTH} markerHeight={MARKER_ARROW_HEIGHT} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"/>
              </marker>

              <linearGradient id="poop-gradient" x1="-492.7" y1="3.63" x2="-490.65" y2="4.59" gradientTransform="translate(10519.1 -59.42) scale(21.33)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity="0.2"/>
                <stop offset="1" stopColor="#fff" stopOpacity="0"/>
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            <g className='all-shape-wrapper' >
              {createElements(this.state, this.staticData, {onHover: this.onHover, onHoverOut: this.onHoverOut, onTextBlur: this.onTextBlur, onCtxMenu: this.onCtxMenu})}
            </g>
            <g id='selector-layer'>{this.state.selectedElementID ? showHandlers(this.staticData) : null}</g>
          </svg>
          <Chat />
          <AttributesWindow element={this.staticData.selected.element} />
          <div id='context-menu' ref={m => this.ctxMenu = m}>
            <ul>
              {isLine ? null : <li onClick={this.cloneShape}>Clone</li>}
              <li onClick={this.onCtxDelete}>Delete</li>
            </ul>
          </div>
        </div>
    )}
}

export default Main;
