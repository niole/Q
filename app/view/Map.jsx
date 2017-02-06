import React, {PropTypes, Component} from 'react';
import $ from 'jquery';
import ToolTip from './ToolTip.jsx';


const { bool, arrayOf, string, node, number } = PropTypes;
const propTypes = {
  userLocation: arrayOf(number),
  userId: string.isRequired,
};
const defaultProps = {
  userLocation: [51.508742,-0.120850],
};

export default class Map extends Component {
  constructor() {
    super();
    this.map = null;
  }

  componentDidMount() {
   const {
      userLocation,
    } = this.props;
    //this.map = this.initMap(this.refs.map);
    //this.updateUserLocation(null, userLocation);
    this.getNearbyBathrooms(userLocation);
  }

  updateUserLocation(oldLocation, newLocation) {
   if (oldLocation) {
    //TODO remove user from old location
   }

   const marker = new google.maps.Marker({
     position: { lat: newLocation[0], lng: newLocation[1] },
      map: this.map,
      icon: '../user_loc_icon.png'
    });
  }

  getNearbyBathrooms(userLocation) {
    const url = 'routes/bathrooms/near/:lat/:lng'.replace(":lat", userLocation[0]).replace(":lng", userLocation[1]);
    $.ajax({
      url,
      success: d => {
        console.log('success', d);
      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  initMap(ref) {
    const {
      userLocation,
    } = this.props;

    const mapProp = {
        center: new google.maps.LatLng(...userLocation),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    return new google.maps.Map(ref, mapProp);
  }

	render() {
		return (
        <div id="map" ref="map"/>
		);
	}
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;
