import React from 'react';

let wrap = (shape, o, handlers) => {
  if (!shape) return;
  let objID = o.get('id');
  let customProps = {
      'data-bboxx': o.get('dataBboxX'), 'data-bboxy': o.get('dataBboxY'), 'data-bboxw': o.get('dataBboxW'),
      'data-bboxh': o.get('dataBboxH'), 'data-cx': o.get('dataCX'), 'data-cy': o.get('dataCY')
    };
  let isCustomShape = (o.get('type') === 'custom');
  return (
      <g key={objID} id={objID} className={'svg-shape shape-container' + (isCustomShape ? ' custom-shape custom-' + o.get('customClassName') : '')}
      transform={o.get('transform')} {...customProps}
      onMouseEnter={handlers.onHover} onMouseLeave={handlers.onHoverOut} onContextMenu={handlers.onCtxMenu}>
        {shape}
      </g>
  )};

let customShape = shapeProps => {
  return <g>
    {
        shapeProps.get('components').map((com, idx) => {
          switch(com.get('tag')){
            case "path":
              return <path className='svg-shape shape' key={idx} {...com.get('attributes').toJS()} />; // todo: toJS() is strongly not recommended, try to figure out the common props, and list them one by one
            case "circle":
              return <circle className='svg-shape shape' key={idx} {...com.get('attributes').toJS()} />;
            case "ellipse":
              return <ellipse className='svg-shape shape' key={idx} {...com.get('attributes').toJS()} />;
          }
        })
    }
  </g>;
};

export default function createElements(state, staticData, handlers) {
  return state.objList.map(o => {
  let commonProps = {
    stroke: o.get('stroke'), 'stroke-width': o.get('stroke-width'), 'stroke-opacity': o.get('stroke-opacity'), 'stroke-dasharray': o.get('stroke-dasharray'),
    fill: o.get('fill'), 'fill-opacity': o.get('fill-opacity')
  };
    let objID = o.get('id');
    if (!staticData.attached[objID]){
      staticData.attached[objID] = {lines: new Set(), text: ''}
    }

    let shape;
    switch (o.get('type')) {
      case "circle":
        shape = <circle {...commonProps}
                        cx={o.get('cx')} cy={o.get('cy')} r={o.get('r')}
                        className='svg-shape shape'
        />;
        break;

      case "rect":
        shape = <rect {...commonProps}
                      x={o.get('x')} y={o.get('y')} className='svg-shape shape'
                      width={o.get('width')} height={o.get('height')}
        />;
        break;

      case "cubicBezier": // cubic curves are mainly defined by a 'd' attribute like path type.
        shape = ( // But to ease selection on the thin curve, I add another proxy path. It has to be treated differently from a normal 'path' type.
            <g>
              <path {...commonProps} fill='none' strokeWidth={1}
                    className='svg-shape shape curved-shape'
                    d={o.get('d')} pointerEvents='none'
              />
              <path
                    className='svg-shape shape-proxy shape curved-shape'
                    fill='none' strokeWidth={14} d={o.get('d')}
                    pointerEvents='all' visibility='hidden'
              />
            </g>);
        break;

      case "polyline":
        let shape1 = o.get('shape1'), shape2 = o.get('shape2');
        if (shape1 && staticData.attached[shape1]) staticData.attached[shape1].lines.add(objID);
        if (shape2 && staticData.attached[shape2]) staticData.attached[shape2].lines.add(objID);
            // about the pointEvents props, go check: https://stackoverflow.com/questions/18663958/clicking-a-svg-line-its-hard-to-hit-any-ideas-how-to-put-a-click-area-around-a-l
            // https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events           https://css-tricks.com/almanac/properties/p/pointer-events/
        let handlerPoints = [];
        if (state.selectedElementID === objID){
          handlerPoints = staticData.selected.element.getElementsByClassName('shape')[0].getAttribute('points').split(/\s+/).map(p => p.split(',').map(num => parseInt(num)));
        }
        shape = (
            <g>
              <polyline {...commonProps}
                  className='svg-shape shape polyline-shape' fill='none' strokeWidth={1} stroke='#424242'
                  points={o.get('points')} data-shape1={o.get('shape1')}  data-shape2={o.get('shape2')}
                  pointerEvents='none' markerEnd="url(#marker-arrow)"
              />
              <polyline
                  className='svg-shape shape-proxy polyline-shape' fill='none' strokeWidth={14} stroke='#424242'
                  points={o.get('points')}
                  pointerEvents='all' visibility='hidden'
              />
            </g>);
        break;

      case "polygon":
        shape = (
            <polygon {...commonProps}
                className='svg-shape shape'
                points={o.get('points')}
            />);
        break;

      case "path":
        shape = (
            <path {...commonProps}
                className='svg-shape shape'
                d={o.get('d')}
            />);
        break;

      case "text":
        let attachedTo = o.get('attachedTo');
        if (attachedTo){staticData.attached[attachedTo].text = objID}
        shape = (
            <g key={objID} id={'attached-text-' + objID} className='svg-shape shape text-container' pointerEvents='none'>
              <foreignObject x={0} y={0} width={80} height={40}>
                <div xmlns="http://www.w3.org/1999/xhtml" data-attachedto={o.get('attachedTo')} className='attached-text content-editable'
                     contentEditable={true} style={{position: 'inherit'}} onBlur={handlers.onTextBlur}>{o.get('textContent')}</div>
              </foreignObject>
            </g>);
        break;

      case "custom":
        shape = customShape(o);
        break;
    }
    return wrap(shape, o, handlers);
  })}
