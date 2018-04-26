import React, {Component} from 'react';
import MySocket from './components/common/GetSocket';
import Tabs from './components/Tabs';
import Tab from './components/Tab';
import { SketchPicker } from 'react-color';

let downArrow = (
    <svg xmlns="http://www.w3.org/2000/svg" id='toggle-attr-window-btn' transform='rotate(180)' className='svg-button' width="25" height="14">
      <path d="M25.16.26a.9.9 0 0 0-1.27 0L12.72 11.45 1.53.26A.9.9 0 0 0 .26 1.53l11.8 11.8a.88.88 0 0 0 .64.26.91.91 0 0 0 .64-.26l11.8-11.8a.88.88 0 0 0 .02-1.27z" pointerEvents='none'/>
    </svg>
);

class AttributeWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIdx: 0,
      showPicker: false,
      pickerType: '', // fill OR stroke
      pickerX: 0, pickerY: 0, // color picker's x/y coordinate
    };
  }

  switchTab = idx => {
    if (idx === this.state.tabIdx) return;

    this.setState({tabIdx: idx})
  };

  componentDidMount = () => {
    this.socket = MySocket.getSocket();
    this.socket.on('/canvas/set-attribute-style', data => { // when we received this evt, under only one condition we need to forceUpdate...
    // attributeWindow is NOT collapsed, AND, currently selected element.id (this.props.element) is also the data.id, AND tab is not collapsed
      let ele = document.getElementById(data.id);
      if (!ele) {
        return
      }

      ele.getElementsByClassName('shape')[0].setAttribute(data.attributeName, data.value);

      if (!this.props.element) return; // no element selected
      if (data.id !== this.props.element.id) return; // selected element is not the one with attribute to set
      if (!this.tabs) return; // other tab not the attribute one is selected
      if (this.tabs.classList.contains('collapse')) return; // tab is collapsed

      this.forceUpdate()
    })
  };

  setAttribute = attrName => // when called by Picker, attrValue is a color object, when called by slider or dropdown select, attrValue is a event object
      attrValue => {
        if (!this.props.element) return;

        let value = attrValue;
        if (attrValue.target){ // I'm assuming this is an event object
          value = attrValue.target.value;
        } else if (attrName === 'fill' || attrName === 'stroke'){
          value = attrValue.hex;
        }

        this.props.element.getElementsByClassName('shape')[0].setAttribute(attrName, value);
        this.socket.emit('/canvas/set-attribute-style', {id: this.props.element.id, attributeName: attrName, value: value});
        this.forceUpdate(); // under 2 conditions we need to re-render:
    // 1: a new element has been selected(update all attributes in attribute-window), 2: new attribute value has been set(this has to be done with forceUpdate)
      };

  setTabRef = ref => this.tabs = ref;

  attributeWindowOnClick = evt => { // close picker window when clicked inside attribute window but outside picker window
    if (evt.target.closest('.button-color-picker')) return; // we have dedicated click handler for these buttons

    if (!evt.target.closest('.sketch-picker') && this.state.showPicker){ // and don't forget to call socket, update the attribute.
      this.setState({showPicker: false})
    }

    if (this.attributeWindow.style.zIndex !== '10'){
      this.attributeWindow.style.zIndex = '10';
      document.getElementById('chat-window').style.zIndex = '8';
    }
  };

  togglePicker = evt => {
    let ele = evt.target.closest('.button-color-picker'); // Inside the button, there is a div which could also fire click
    let x = ele.getBoundingClientRect().right + 10 - 220; // add some padding(10), minus the picker width(200)
    let y = ele.getBoundingClientRect().bottom + 3;
    let pickerType = ele.id.split('-')[0]; // button ID is either 'fill-picker' or 'stroke-picker'
    let showPicker = false;

    if (!this.state.showPicker || pickerType !== this.state.pickerType){
      showPicker = true;
    }

    this.setState({
      showPicker: showPicker,
      pickerType: pickerType,
      pickerX: x,
      pickerY: y,
    })
  };

  toggleWindow = evt => {
    let target = evt.target;
    if (target.nodeName.toLowerCase() === 'button'){
      target = target.children[0];
    }

    let tabs = this.tabs;
    if (tabs.classList.contains('collapse')){
      target.style.webkitTransform = "rotate(180deg)";
      target.style.transform = "rotate(180deg)";
      tabs.classList.remove('collapse')
    } else {
      target.style.webkitTransform = "rotate(0deg)";
      target.style.transform = "rotate(0deg)";
      tabs.classList.add('collapse');
      if (this.state.showPicker){
        this.setState({showPicker: false})
      }
    }
  };

  render(){ // cubic curve, polylines: add a 'line' class to them all.
    let fill = '#fff', fillOpacity = 1, stroke = '#000', strokeOpacity = 1, strokeWidth = '1', strokeDashArray = 'unset';
    // regular shape must have a fill, otherwise, you have to click the thin outline to select it.
    // We can use the same approach like polyline to draw a proxy-shape underneath, but it's too late to do that.
    let disableAll = true, isPolyline = false; // when no shape is selected, disableAll is true. It's better to show a canvas related attribute window when this happens
    if (this.props.element){
      let shape = this.props.element.getElementsByClassName('shape'); // we found the concrete shape
      if (shape) {
        if (!this.props.element.classList.contains('custom-shape')){ // and its wrapping element is not custom-made.
          disableAll = false; // Custom shapes are made of many paths/circles, there is no one fill/stroke attribute to rule them all
        }
        if (this.props.element.getElementsByClassName('polyline-shape').length > 0){
          isPolyline = true;  // polyline shouldn't be allowed to set fill attributes, otherwise a closed shape is formed.
        }

        fill = shape[0].getAttribute('fill') || '#fff';
        fillOpacity = shape[0].getAttribute('fill-opacity') || 1;
        stroke = shape[0].getAttribute('stroke') || '#000';
        strokeOpacity = shape[0].getAttribute('stroke-opacity') || 1;
        strokeWidth = shape[0].getAttribute('stroke-width') || '1';
        strokeDashArray = shape[0].getAttribute('stroke-dasharray') || 'unset';
      }
    }
    if (fill === 'none') fill = '#fff';
    if (stroke === 'none') stroke = '#000';
    let fillProp = {fill: fill, 'fill-opacity': fillOpacity, disableAll, isPolyline};
    let strokeProp = {stroke: stroke, 'stroke-opacity': strokeOpacity, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDashArray, disableAll};

    return (
      <div id='attribute-window' ref={attr => this.attributeWindow = attr} onClick={this.attributeWindowOnClick}
           style={{position: 'fixed', right: '0px', top: '0px', width: '280px',
             backgroundColor: '#F6F6F6', border: '1px solid gray', borderRadius: '4px'}}>
        <div id='attribute-window-head' style={{display: 'flex', justifyContent: 'space-between', height: '28px'}}>
          <div style={{margin: '4px 8px'}}>Attribute window</div>
          <button onClick={this.toggleWindow} className='toggle-window-button'>{downArrow}</button>
        </div>

        <Tabs id='attribute-window-body' defaultActiveTabIndex={0} activeTabIdx={this.state.tabIdx} setTabRef={this.setTabRef} switchTab={this.switchTab} height={360} >
          <Tab isActive={true} label='Style' tabIndex={0}>
            <FillAttr fillProp={fillProp} showPicker={this.state.showPicker} pickerType={this.state.pickerType} setAttribute={this.setAttribute}
                      togglePicker={this.togglePicker} pickerX={this.state.pickerX} pickerY={this.state.pickerY}/>
            <hr />
            <StrokeAttr strokeProp={strokeProp} showPicker={this.state.showPicker} pickerType={this.state.pickerType} setAttribute={this.setAttribute}
                        togglePicker={this.togglePicker} pickerX={this.state.pickerX} pickerY={this.state.pickerY} />
          </Tab>
          <Tab label='Text' tabIndex={1}>
            <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}><img src='/draw/public/images/throw-table.jpg' /></div>
          </Tab>
          <Tab label='Arrange' tabIndex={2}>
            <img src='/draw/public/images/more-requirement.jpg' />
          </Tab>
        </Tabs>
      </div>
    )
  }
}
export default AttributeWindow;

// todo: disable all action when no element selected
let opacityValue = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
const FillAttr = props => {
    return (
        <div style={{margin: '14px 18px'}}>
          <h4>Fill</h4>
          <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
            <span>color</span>
            <button disabled={props.fillProp.disableAll || props.fillProp.isPolyline} onClick={props.togglePicker} id='fill-picker' className='button-color-picker' style={{marginTop: '-4px', right: '20px', height: '22px'}}>
              <div style={{width: '36px', height: '12px', margin: '3px', border: '1px solid black', backgroundColor: props.fillProp.fill ? props.fillProp.fill : '#ffffff'}} />
            </button>
            {(!props.showPicker || props.pickerType !== 'fill')? null :
                <div style={{position: 'fixed', left: props.pickerX, top: props.pickerY}}>
                  <SketchPicker color={props.fillProp.fill} onChangeComplete={props.setAttribute('fill')} disableAlpha={true}/>
                </div>
            }
          </div>
          <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
            <span>opacity: {props.fillProp['fill-opacity']} </span>
            <input disabled={props.fillProp.disableAll || props.fillProp.isPolyline} type="range" value={props.fillProp['fill-opacity']} min="0" max="1" step="0.1" list="fill-opacity-tickmarks" onChange={props.setAttribute('fill-opacity')} />
              <datalist id="fill-opacity-tickmarks">
                {
                  opacityValue.map(num => <option key={num} value={num} />)
                }
              </datalist>
          </div>
        </div>
    )
};

const StrokeAttr = props => {
  let isZeroWidth = true;
  let width = props.strokeProp['stroke-width'];
  if (width && width * 1 !== 0){
    isZeroWidth = false;
  }

  return (
        <div style={{margin: '14px 18px'}}>
          <h4>Stroke</h4>
          <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
            <span>width: {props.strokeProp['stroke-width'] + 'px'}</span>
            <input disabled={props.strokeProp.disableAll} type="range" value={props.strokeProp['stroke-width']} min="0" max="10" step="1" list="stroke-width-tickmarks" onChange={props.setAttribute('stroke-width')} />
            <datalist id="stroke-width-tickmarks">
              {
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num} />)
              }
            </datalist>
          </div>

          { isZeroWidth ? null :
              <div><div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                <span>color</span>
                <button disabled={props.strokeProp.disableAll} onClick={props.togglePicker} id='stroke-picker' className='button-color-picker' style={{marginTop: '-4px', right: '20px', height: '22px'}}>
                  <div style={{width: '36px', height: '12px', margin: '3px', border: '1px solid black', backgroundColor: props.strokeProp.stroke ? props.strokeProp.stroke : '#ffffff'}} />
                </button>
                {(!props.showPicker || props.pickerType !== 'stroke') ? null :
                    <div style={{position: 'fixed', left: props.pickerX, top: props.pickerY}}>
                      <SketchPicker color={props.strokeProp.stroke} onChangeComplete={props.setAttribute('stroke')} disableAlpha={true}/>
                    </div>
                }
              </div>

              <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
              <span>opacity: {props.strokeProp['stroke-opacity']}</span>
              <input disabled={props.strokeProp.disableAll} type="range" value={props.strokeProp['stroke-opacity']} min="0" max="1" step="0.1" list="stroke-opacity-tickmarks" onChange={props.setAttribute('stroke-opacity')} />
              <datalist id="stroke-opacity-tickmarks">
                {
                  opacityValue.map(num => <option key={num} value={num} />)
                }
              </datalist>
            </div>

          <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
            <span>line type</span>
            <select disabled={props.strokeProp.disableAll} name="stroke-type" value={props.strokeProp['stroke-dasharray']} onChange={props.setAttribute('stroke-dasharray')}>
              <option value="unset">Solid</option>
              <option value="10,5">Dashed</option>
              <option value="1,5">Dotted</option>
            </select>
          </div></div>
          }

        </div>
    )
};