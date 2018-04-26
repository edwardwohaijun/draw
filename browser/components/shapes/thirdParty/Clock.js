import React, {Component} from 'react';

// credit: http://quicksilver.be.washington.edu/courses/arch482/4.Common%20Patterns/3.Dynamic%20HTML/e.SVG%20clock.html
// for SMIL: https://codepen.io/sol0mka/pen/0bf400db555f7c9701387b73d25c80a7
export default class Clock extends Component {
 constructor(props) {
   super(props);
 }

  run = () => {
    let now = new Date();
    let hour = now.getHours();
    hour = hour % 12;
    let min = now.getMinutes();
    let sec = now.getSeconds();

    let a1 = (180+(hour+min/60)*30)%360;
    let a2 = (180+min*6)%360;
    let a3 = (180+sec*6)%360;

    this.hourHand.setAttribute("transform","rotate("+(a1)+")");
    this.minuteHand.setAttribute("transform","rotate("+(a2)+")");
    this.secondHand.setAttribute("transform","rotate("+(a3)+")");
  };

  componentDidMount = () => {this.timer = setInterval(this.run, 1000)};
  componentWillUnmount() {clearInterval(this.timer)}

  render(){ // pointerEvents='none' makes sure those line wouldn't get any mouse click events. If not set like this, those lines could get clicked, causing bbox value set to lines, not circle.
    return (
        <g>
          <circle className='svg-shape shape' cx="48.5" cy="48.5" r="48.5" stroke="black" strokeWidth="2" fill="white" pointerEvents='all'
                  data-bboxwidth={this.props['data-bboxwidth']} data-bboxheight={this.props['data-bboxheight']}
                  data-centroidx={this.props['data-centroidx']} data-centroidy={this.props['data-centroidy']}
                  data-bboxx={this.props['data-bboxx']} data-bboxy={this.props['data-bboxy']} />
          <g>
            <line x1="1" y1="48.5" x2="6" y2="48.5" stroke='rgb(0,0,0)' strokeWidth={3} pointerEvents='none' />
            <line x1="48.5" y1="1" x2="48.5" y2="6" stroke='rgb(0,0,0)' strokeWidth={3} pointerEvents='none' />
            <line x1="96" y1="48.5" x2="91" y2="48.5"  stroke='rgb(0,0,0)' strokeWidth={3} pointerEvents='none' />
            <line x1="48.5" y1="96" x2="48.5" y2="91" stroke='rgb(0,0,0)' strokeWidth={3} pointerEvents='none' />
            <line x1="7.36" y1="24.75" x2="11.69" y2="27.25" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="24.75" y1="7.36" x2="27.25" y2="11.69" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="72.25" y1="7.36" x2="69.75" y2="11.69" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="89.64" y1="24.75" x2="85.31" y2="27.25" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="89.64" y1="72.25" x2="85.31" y2="69.75" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="72.25" y1="89.64" x2="69.75" y2="85.31" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="24.75" y1="89.64" x2="27.25" y2="85.31" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
            <line x1="7.36" y1="72.25" x2="11.69" y2="69.75" stroke='rgb(0,0,0)' strokeWidth={1} pointerEvents='none' />
          </g>

          <g transform="translate(48.5, 48.5)">
            <line id="hour-hand" x1="0" y1="-8" x2="0" y2="22" ref={(hand) => this.hourHand = hand}
                  stroke='#000' strokeWidth={4} transform="rotate(0)" pointerEvents='none'>
            </line>
            <line id="minute-hand" x1="0" y1="-8" x2="0" y2="30" ref={minute => this.minuteHand = minute}
                  stroke='#000' strokeWidth={4} transform="rotate(0)" pointerEvents='none'>
            </line>
            <line id="second-hand" x1="0" y1="-8" x2="0" y2="40" ref={second => this.secondHand = second}
                  stroke='#f04666' strokeWidth={1.5} pointerEvents='none'>
            </line>
            <text x={-10} y={-28} pointerEvents='none'>12</text>
            <text x={30} y={5} pointerEvents='none'>3</text>
            <text x={-5} y={40} pointerEvents='none'>6</text>
            <text x={-40} y={5} pointerEvents='none'>9</text>
          </g>
        </g>
    )
  }
}
