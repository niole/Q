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
  bulkUpdatePrimitives,
} from '../actions.js';


const endNumberPattern = /.+\/([0-9]+)/;
const { bool, arrayOf, string, object, node, number } = PropTypes;
const propTypes = {
  userLocation: arrayOf(number),
  userId: number.isRequired,
  nearbyBathrooms: arrayOf(object),
};

class Map extends Component {
  constructor() {
    super();
    this.map = null;
    this.closeTooltip = this.closeTooltip.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const oldLocation = this.props.userLocation;
    const newLocation = newProps.userLocation;

    if (oldLocation[0] !== newLocation[0] || oldLocation[1] !== newLocation[1]) {
      this.map.panTo(new google.maps.LatLng(...newLocation));
    }
  }

  componentDidMount() {
   const {
      userLocation,
    } = this.props;

    this.map = this.initMap(this.refs.map);

    this.updateUserLocation(null, userLocation);

    this.setInitialState(() => {
      this.getNearbyBathrooms();
    });
  }

  setInitialState(callback) {
    const {
      bulkUpdatePrimitives,
    } = this.props;

    navigator.geolocation.getCurrentPosition(locationData => {
      let userLocation = this.props.userLocation;

      if (false) { //locationData && locationData.coords) {
        const {
          longitude,
          latitude,
        } = locationData.coords;

        userLocation = [longitude, latitude];
      }

      const userId = this.getUserIdFromURL();

      bulkUpdatePrimitives({ userId, userLocation });
      callback();
    });
  }

  getUserIdFromURL() {
    const url = window.location.href;
    let userId = url.match(endNumberPattern);

    if (userId) {
      userId = parseInt(userId[1]);
    } else {
      userId = 0;
    }

    return userId;
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

  getNearbyBathrooms() {
    const {
      userId,
      userLocation,
      addBathrooms
    } = this.props;
    const url = `routes/bathrooms/near/${userLocation[0]}/${userLocation[1]}/${userId}`;

    $.ajax({
      url,
      success: bathroomData => {
        console.log('success');

        const {
          nearbyBathrooms,
          lineMembers,
        } = bathroomData;

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
              //TODO this won't work
              google.maps.event.removeEventListener(marker, 'click', boundListener);
            },
            lat: b.latitude,
            lng: b.longitude,
            showTooltip: false,
            lineLength: b.lineLength,
            id: b.id,
          };
        });

        addBathrooms({ newNearByBathrooms, lineMembers });
      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  initMap(ref) {
    let {
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
    bulkUpdatePrimitives: stateObj => dispatch(bulkUpdatePrimitives(stateObj)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
