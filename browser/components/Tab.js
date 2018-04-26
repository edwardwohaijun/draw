import React from 'react';
import {TAB_LABEL_HEIGHT} from '../constants/constants';

const Tab = props => {
    return ( // better to calculate the width by itself
        <li className="tab" style={{display: 'inline', width: '33.3%', height: TAB_LABEL_HEIGHT + 'px'}}>
          <div style={{backgroundColor: props.isActive ? '#f6f6f6' : "#d7d7d7", width: '100%', height: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', flexDirection: 'column'}}
               onClick={evt => {
                 evt.preventDefault();
                 props.onClick(props.tabIndex);
               }}>
            {props.label}
          </div>
        </li>
    )
};
export default Tab
