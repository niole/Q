import React, {PropTypes, Component} from 'react';



export default class App extends Component {
	constructor() {
		super();
	}

  componentDidMount() {
    this.initMap(this.refs.map);
  }

  initMap(ref) {
      const mapProp = {
          center: new google.maps.LatLng(51.508742,-0.120850),
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      return new google.maps.Map(ref, mapProp);
  }

	render() {
		return (
      <div className="landing-page">
        <div id="map" ref="map"/>
      </div>
		);
	}
}
