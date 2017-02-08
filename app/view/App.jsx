import React, {PropTypes, Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import Map from './Map.jsx';

export default class App extends Component {
	constructor() {
		super();
	}

	render() {
		return (
      <div className="landing-page">
        <Map
          userId={ "sdfdss" }
        />
      </div>
		);
	}
}
