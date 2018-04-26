import React, {Component} from 'react';
import {CANVAS_LEFT_MARGIN } from './constants/constants'
import MySocket from './components/common/GetSocket';

let rect = props => <rect {...props} />;
let path = props => <path {...props} />;
let ellipse = props => <ellipse {...props} />;

let commonProps = {className: 'shape-button', fill: "#fff", stroke: "#000", pointerEvents: 'none'};
let regularShapes = [
  {tag: 'rect', id: 'create-rect', attributes: {x:2, y:10, width: 31, height: 16, ...commonProps}},
  {tag: 'path', id:'create-triangle', attributes:{d: "M 6 2 L 30 18 L 6 34 Z", strokeMiterlimit: 10, ...commonProps}},
  {tag: 'ellipse', id:'create-circle', attributes: {cx: "18", cy: "18", rx: "15.6", ry: "15.6", ...commonProps}},
  {tag: 'path', id: 'create-star', attributes: {d: "M17.45 1.5l4 11.33h12l-9.33 7.33 3.33 11.34-10-6.67-10 6.67 3.33-11.33-9.33-7.34h12z", ...commonProps}},
  {tag: 'path', id: 'create-diamond', attributes: {d: 'M 18 2 L 34 18 L 18 34 L 2 18 Z', ...commonProps}},
  {tag: 'path', id: 'create-callout', attributes: {d: "M 10 13 C 4 13 2 18 7 19 C 2 21 8 26 12 24 C 15 28 24 28 27 24 C 34 24 34 20 30 18 C 34 14 27 10 22 12 C 18 9 12 9 10 13 Z", ...commonProps}},
  {tag: 'path', id: 'create-cubicBezier', attributes: {d: "M 4 34 Q 33 34 18 19 Q 4 4 29 4", strokeMiterlimit: "10", ...commonProps, fill: 'none'}},
  {tag: 'path', id: 'create-heart', attributes: {d: "M14.82 27.35a33.56 33.56 0 0 0-3.84-3.36 68.43 68.43 0 0 1-6.48-5.26C1.35 15.83.01 12.92.02 8.96a7.47 7.47 0 0 1 .67-3.81 8.86 8.86 0 0 1 4-4.24A6.78 6.78 0 0 1 8.5.01a5.93 5.93 0 0 1 3.84.93 7.75 7.75 0 0 1 3.47 3.91l.2.79.49-1.09c2.8-6.13 11.74-6 14.85.15 1 2 1.1 6.16.22 8.52-1.14 3.08-3.29 5.43-8.24 9a47.06 47.06 0 0 0-7.19 6.43c-.29.62-.01.12-1.32-1.3z", ...commonProps}},
];

let customShapes = ['emoji', 'superHero', 'sports', 'IT', 'people', 'food', 'pet', 'cartoon', 'love', 'weather', 'work', 'general'];

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  fetchShape = evt => {
    let socket = MySocket.getSocket(); // socket make connection to server when it's firstly created, I don't want to make connection until all components are mounted ...
    // ..., the only sure way is to call getSocket() when needed in this Panel child component.
    socket.emit('/canvas/broadcast-new-shape', `${evt.target.id.split('-')[2]}`) // get 'emoji' string from 'create-custom-emoji' string
  };

  render() {
    let buttonContainerSty = {display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap', marginTop: '18px', left: '0px', width: CANVAS_LEFT_MARGIN + 'px', height: '260px', backgroundColor: '#F6F6F6'};
    return (
      <div style={{position: 'fixed', left: '0px', width: CANVAS_LEFT_MARGIN + 'px', height: '100%', backgroundColor: '#F6F6F6', borderRight: '1px solid #D9D9DA'}}>
        <div style={buttonContainerSty}>
          {
              regularShapes.map(shape => {
                let tag;
                switch (shape.tag){
                  case 'rect': tag = rect(shape.attributes); break;
                  case 'path': tag = path(shape.attributes); break;
                  case 'ellipse': tag = ellipse(shape.attributes); break;
                }
                return (
                    <button key={shape.id} className='panel-button' onClick={this.props.createShape} id={shape.id}>
                      <svg pointerEvents='none'>{tag}</svg>
                    </button>
                )
              })
          }
        </div>
        <hr style={{borderColor: '#D9D9DA', backgroundColor: '#D9D9DA', color: '#D9D9DA', height: '1px', border: '0px'}} />
        <div style={buttonContainerSty}>
          {
            customShapes.map(shapeName => <button key={shapeName} className='panel-button custom-shape' id={'create-custom-' + shapeName} onClick={this.fetchShape}>{shapeName}</button>)
          }
        </div>
        {/* <button id='create-clock' onClick={this.props.createShape}>clock</button> */}
      </div>
    )
  }
}

export default Panel;
