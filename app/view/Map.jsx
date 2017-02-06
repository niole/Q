import React, {PropTypes, Component} from 'react';
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
    this.map = this.initMap(this.refs.map);
    this.updateUserLocation(null, userLocation);
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

  getNearbyBathrooms() {
    //TODO hit routes
    //router.get('/bathrooms/near/:lat/:lng', function(req, res) {
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
