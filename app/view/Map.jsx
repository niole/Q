import React, {PropTypes, Component} from 'react';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux';
import $ from 'jquery';
import ToolTip from './ToolTip.jsx';
import MessagesBar from './MessagesBar.jsx';
import {
  updateUserLocation,
  addBathrooms,
  removeBathrooms,
  updateUserId,
  setBathroomToUnoccupied,
  setBathroomToOccupied,
  hideBathroomTooltip,
  showBathroomTooltip,
} from '../actions.js';


const { bool, arrayOf, string, object, node, number } = PropTypes;
const propTypes = {
  userLocation: arrayOf(number),
  userId: number.isRequired,
  nearbyBathrooms: arrayOf(object),
};
const defaultProps = {
  userLocation: [51.508742,-0.120850],
};

class Map extends Component {
  constructor() {
    super();

    navigator.geolocation.getCurrentPosition(locationData =>{
      if (locationData && locationData.coords) {
        const {
          updateUserLocation,
        } = this.props;
        const {
          longitude,
          latitude,
        } = locationData.coords;
        updateUserLocation([longitude, latitude]);
      }
    });

    this.map = null;
    this.closeTooltip = this.closeTooltip.bind(this);
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
    const {
      showBathroomTooltip,
    } = this.props;
    showBathroomTooltip(b.id);
  }

  getNearbyBathrooms(userLocation) {
    const {
      addBathrooms
    } = this.props;
    const url = `routes/bathrooms/near/${userLocation[0]}/${userLocation[1]}`;

    $.ajax({
      url,
      success: nearbyBathrooms => {
        console.log('success');

        const newNearByBathrooms = nearbyBathrooms.map(b => {
          const marker = new google.maps.Marker({
            position: { lat: b.latitude, lng: b.longitude },
            map: this.map
          });

          const infoWindow = new google.maps.InfoWindow({
            content: ReactDOMServer.renderToString(<div id={ `${b.id}-tooltip` }/>)
          });

          const boundListener = this.handleBathroomClick.bind(this, b);

          google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
            boundListener(b);
          });

          return {
            marker,
            infoWindow,
            unmountHandler: () => {
              //TODO look into if this actuall works
              google.maps.event.removeEventListener(marker, 'click', boundListener);
            },
            lat: b.latitude,
            lng: b.longitude,
            showTooltip: false,
            lineLength: b.lineLength,
            id: b.id,
          };
        });

        addBathrooms(newNearByBathrooms);
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

  showOpenToolTips(bathrooms) {
    const {
      userId,
    } = this.props;

    let b;
    let i=0;
    for (; i < bathrooms.length; i++) {
      b = bathrooms[i];
      if (b.showTooltip) {
          return (
            <ToolTip
              bathroomId={ b.id }
              location={ [b.lat, b.lng] }
              target={ document.getElementById(`${b.id}-tooltip`) }
              shouldOpen={ true }
              userId={ userId }
              closeTooltip={ this.closeTooltip }
            />
          );
      }
    }
  }

  closeTooltip(bathroomId) {
    const {
      hideBathroomTooltip,
    } = this.props;
    hideBathroomTooltip(bathroomId);
  }

	render() {
    const {
      nearbyBathrooms,
    } = this.props;

		return (
      <div>
        <div id="map" ref="map"/>
        { this.showOpenToolTips(nearbyBathrooms) }
        <MessagesBar
        />
      </div>
		);
	}
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  /**
    state:
      userId: "sdfdss",
      userLocation: undefined,
      lines: {},
      messages: [],
      nearbyBathrooms: [],
   */
  const {
    userId,
    userLocation,
    nearbyBathrooms,
  } = state;

  return {
      userId,
      userLocation,
      nearbyBathrooms,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  //initiated by actions
  //put in a container component that
  return {
    updateUserLocation: location => dispatch(updateUserLocation(location)),
    addBathrooms: bs => dispatch(addBathrooms(bs)),
    removeBathrooms: bs => dispatch(removeBathrooms(bs)),
    updateUserId: id => dispatch(updateUserId(id)),
    setBathroomToUnoccupied: bId => dispatch(setBathroomToUnoccupied(bId)),
    setBathroomToOccupied: bId => dispatch(setBathroomToOccupied(bId)),
    hideBathroomTooltip: bId => dispatch(hideBathroomTooltip(bId)),
    showBathroomTooltip: bId => dispatch(showBathroomTooltip(bId)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
