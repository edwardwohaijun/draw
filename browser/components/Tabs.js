import React, {Component} from 'react';

// credit: https://gist.github.com/diegocasmo/5cd978e9c5695aefca0c6a8a19fa4c69
// https://medium.com/trisfera/a-simple-react-tabs-component-47cac2cfbb5
// this is so inefficient, everytime a click on canvas would cause a re-render of the whole tab.
export default class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
    // this.state = {};
  }

  // Encapsulate <Tabs/> component API as props for <Tab/> children
  renderChildrenWithTabsApiAsProps() {
    return React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {
        onClick : this.props.switchTab,
        tabIndex: index,
        isActive: index === this.props.activeTabIdx
      });
    });
  }

  componentDidMount = () => {
    if (this.props.setTabRef){
      this.props.setTabRef(this.tabs)
    }
  };

  // Render current active tab content
  renderActiveTabContent() {
    const {children} = this.props;
    const activeTabIndex = this.props.activeTabIdx;
    if(children[activeTabIndex]) {
      return children[activeTabIndex].props.children;
    }
  }

  render() {
    return (
        <div className="tabs" id={this.props.id} style={{height: this.props.height, borderTop: '1px solid #d7d7d7', overflow: 'hidden'}} ref={tabs => this.tabs = tabs}>
          <ul style={{paddingLeft: '0px', marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {this.renderChildrenWithTabsApiAsProps()}
          </ul>
          <div>
            {this.renderActiveTabContent()}
          </div>
        </div>
    );
  }
}
