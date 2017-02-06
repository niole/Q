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
    this.state = {
      nearbyBathrooms: [], //[{ marker: object, lat: number, lng: number}]
    };
  }

  componentDidMount() {
   const {
      userLocation,
    } = this.props;
    this.map = this.initMap(this.refs.map);
    this.updateUserLocation(null, userLocation);
    this.getNearbyBathrooms(userLocation);
  }

  updateUserLocation(oldLocation, newLocation) {
   if (oldLocation) {
    //TODO remove user from old location
    //remove bathrooms that aren't nearby anymore
   }

   const marker = new google.maps.Marker({
     position: { lat: newLocation[0], lng: newLocation[1] },
      map: this.map,
      icon: '../user_loc_icon.png'
    });
  }

  handleBathroomClick(b) {
    console.log('clicked on bathroom', b);
  }

  getNearbyBathrooms(userLocation) {
    const url = 'routes/bathrooms/near/:lat/:lng'.replace(":lat", userLocation[0]).replace(":lng", userLocation[1]);
    $.ajax({
      url,
      success: nearbyBathrooms => {
        console.log('success');

        const newNearByBathrooms = nearbyBathrooms.map(b => {
          const marker = new google.maps.Marker({
            position: { lat: b.latitude, lng: b.longitude },
            map: this.map
          });

          const boundListener = this.handleBathroomClick.bind(this, b);
          google.maps.event.addListener(marker, 'click', boundListener);

          return {
            marker,
            unmountHandlers: () => {
              //TODO look into if this actuall works
              google.maps.event.removeEventListener(marker, 'click', boundListener);
            },
            lat: b.latitude,
            lng: b.longitude
          };
        });

        this.setState({ nearbyBathrooms });
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
        zoom: 14,
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
