import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  render() { return <Main />}
}

ReactDOM.render(<App />, document.getElementById('main-content-wrapper'));
