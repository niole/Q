import React, {PropTypes, Component} from 'react';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux';
import $ from 'jquery';
import FlatButton from 'material-ui/FlatButton';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import ToolTip from './ToolTip.jsx';
import MessagesBar from './MessagesBar.jsx';
import CreateBathroomDialog from './CreateBathroomDialog.jsx';
import { getLatLngRange } from '../dataHelpers.js';
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
  toggleBathroomMaker,
} from '../actions.js';
import {
  messageReceivedUpdateLineLineMember,
  MSG_LEFT_LINE,
  MSG_ENTER_LINE,
  MSG_RECEIVED_CUT_MESSAGE,
  MSG_RANK_UPDATED,
  MSG_BATHROOM_CREATED,
} from '../serverActions.js';


const endNumberPattern = /.+\/([0-9]+)/;
const { bool, arrayOf, string, object, node, number } = PropTypes;
const propTypes = {
  userLocation: arrayOf(number),
  userId: number.isRequired,
  nearbyBathrooms: arrayOf(object),
  lines: object,
};

class Map extends MUIBaseTheme {
  constructor() {
    super();
    this.userMarker = null;
    this.map = null;
    this.messageHandler = null;

    this.closeTooltip = this.closeTooltip.bind(this);
    this.handleUpdateLocationButtonClick = this.handleUpdateLocationButtonClick.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const oldLocation = this.props.userLocation;
    const newLocation = newProps.userLocation;

    if (newProps.userId !== this.props.userId) {
      //update message handler
      this.messageHandler = this.setUpMessageHandler(newProps.userId.toString());
    }


    if (oldLocation[0] !== newLocation[0] || oldLocation[1] !== newLocation[1]) {
      this.updateUserLocation(newLocation, newProps.userId, updatedLocation => {
        this.map.panTo(new google.maps.LatLng(...newLocation));
      });
    }

  }

  initGeoCoder() {
    return new google.maps.Geocoder();
  }

  componentDidMount() {
   const {
      userLocation,
      toggleBathroomMaker,
    } = this.props;


    this.messageHandler = this.setUpMessageHandler();
    this.map = this.initMap(this.refs.map);
    const geocoder = this.initGeoCoder();

    this.map.addListener('mousedown', event => {
      var shouldShow = false;

      var timer = setTimeout(() => {
        shouldShow = true;
      }, 1000);

      this.map.addListener('mouseup', event => {
        if (shouldShow) {
          const {
            latLng,
            pixel,
          } = event;

          function getAddress(formattedAddress, latLng) {
            toggleBathroomMaker(true, formattedAddress, latLng);
          }

          geocoder.geocode({ 'latLng': event.latLng }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              const latLng = [event.latLng.lat(), event.latLng.lng()];
              const address =results[0].formatted_address ? results[0].formatted_address : latLng;
              getAddress(address, latLng);
            }
          });
        }

        clearTimeout(timer);
        timer = null;
        shouldShow = false;
      });
    });

    const userId = this.getUserIdFromURL(); //TODO this is a hack and must change

    this.setInitialState(
      userId,
      () => {
        this.getNearbyBathrooms();
    });
  }

  /**
    delegates actions from server to respective handler
   */
  setUpMessageHandler(id) {
    const socket = io.connect();

    return socket.on(id, msg => {
      //based on what the message is, dispatch an action
      //msg must be an actionType: { type: TYPE, data: ... }

      switch(msg.type) {
        case MSG_LEFT_LINE:
          return this.handleLineLeave(msg);
        case MSG_ENTER_LINE:
          return this.handleServerActionDispatch(msg);
        case MSG_RECEIVED_CUT_MESSAGE:
          return this.handleServerActionDispatch(msg);
        case MSG_RANK_UPDATED:
          return this.handleMessageReceivedRankUpdated(msg);
        case MSG_BATHROOM_CREATED:
          return this.handleMessageReceivedNewNearbyBathrooms(msg);
        default:
          break;
      }

    });
  }

  handleMessageReceivedNewNearbyBathrooms(msg) {
    msg.data = this.newNearbyBathroomsHandler(msg.data);
    this.handleServerActionDispatch(msg);
  }

  handleMessageReceivedRankUpdated(msg) {
    const {
      userId,
      socketMessageDispatcher,
    } = this.props;

    const url = `routes/linemember/${msg.data.bathroomId}/${userId}`;
    $.ajax({
      url,
      success: lineMember => {
        msg.data.newRank = lineMember.rank;
        socketMessageDispatcher(msg);
      },
      error: err => {
        console.log('error', err);
      }
    });
  }

  /**
   * dispatches actions issued by the server via a socket
   **/
  handleServerActionDispatch(msg) {
    const {
      socketMessageDispatcher,
    } = this.props;

    socketMessageDispatcher(msg);
  }

  /**
   * updates client state when server returns with nearby bathroom data
   **/
  newNearbyBathroomsHandler(nearbyBathrooms) {
    return nearbyBathrooms.map(b => {
      const marker = new google.maps.Marker({
        position: { lat: b.latitude, lng: b.longitude },
        map: this.map,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: ReactDOMServer.renderToString(<div id={ `${b.id}-tooltip` } className="gmaps-infowindow"/>),
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
  }

  /**
   * when other user leaves a line near the current user
   * this handles the push notification
   * and updates client line data
   **/
  handleLineLeave(msg) {
    const {
      socketMessageDispatcher,
      nearbyBathrooms,
      lines,
      userId,
    } = this.props;
    const updatedBathroomId = msg.data.bathroomId;
    const bathroomId = nearbyBathrooms.find(b => b.id === updatedBathroomId).id;

    if (typeof bathroomId === "number") {
      if (typeof lines[updatedBathroomId] === "number") {
        //if in line and looking at tooltip, get current rank and then update state
        const url = `routes/linemember/${bathroomId}/${userId}`;
        $.ajax({
          url,
          success: lm => {
            socketMessageDispatcher(messageReceivedUpdateLineLineMember(msg.data.bathroomId, lm.rank, msg.data.lineLength));
          }, error: err => {
            console.log('error', err);
          }
          });
      } else {
        //if not in line but looking at tooltip, update data
        //will handle line length
        socketMessageDispatcher(msg);
      }
    }
  }

  /**
   * handles updating client state with browser location
   **/
  getBrowserLocation(callback) {
    navigator.geolocation.getCurrentPosition(locationData => {
      let userLocation = this.props.userLocation;

      if (locationData && locationData.coords) {
        const {
          longitude,
          latitude,
        } = locationData.coords;

        userLocation = [latitude, longitude];
      }

      callback(userLocation);
    });
  }

  /**
   * handles batch updates necessary when this component mounts
   **/
  setInitialState(userId, callback) {
    const {
      bulkUpdatePrimitives,
    } = this.props;

    const url = `routes/messages/${userId}`;

    $.ajax({
      url,
      success: messages => {
        this.getBrowserLocation(userLocation => {
          bulkUpdatePrimitives({ userId, userLocation, messages });
          callback();
        });
      },
      error: err => {
        console.log('error', err);
      }
    });
  }

  /**
   * returns user Id which is appended at end of url
   **/
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

  updateUserLocation(newLocation, userId, callback) {
    const newPosition = {
      lat: newLocation[0],
      lng: newLocation[1],
    };

    const url = `routes/user/${userId}/loc/update`;

    $.ajax({
      url,
      type: "POST",
      dataType: "json",
      data: newPosition,
      error: err => {
        console.log('err', err);
      },
      success: d => {
        console.log('success', d);

        this.userMarker = new google.maps.Marker({
          position: newPosition,
           map: this.map,
           icon: '../user_loc_icon.png'
         });

        if (callback) {
          callback(newLocation);
        }
      }
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
        const {
          nearbyBathrooms,
          lineMembers,
        } = bathroomData;
        const newNearByBathrooms = this.newNearbyBathroomsHandler(nearbyBathrooms);
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
            map={ this.map }
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

  showAddBathroomDialog() {
    return (
      <CreateBathroomDialog map={ this.map }/>
    );
  }

  handleUpdateLocationButtonClick() {
    const {
      userId,
      updateUserLocation,
    } = this.props;

    this.getBrowserLocation(userLocation => {

      if (userLocation[0] !== this.props.userLocation[0] &&
        userLocation[1] !== this.props.userLocation[1]) {
        updateUserLocation(userLocation, getLatLngRange(userLocation[0], userLocation[1]));
      } else {
        //pan to old location, just in case moved map
        this.map.panTo(new google.maps.LatLng(...userLocation));
      }

    });

  }

	render() {
    const {
      nearbyBathrooms,
      messages,
      timeInBathroom,
      addingBathroom,
      userId,
      updateUserLocation,
    } = this.props;

		return (
      <div>
        <div id="map" ref="map"/>
        <div id="update-pos">
          <FlatButton
            label="Update Your Location"
            primary={true}
            onTouchTap={ this.handleUpdateLocationButtonClick }
          />
        </div>
        { addingBathroom && this.showAddBathroomDialog() }
        { this.showOpenToolTips(nearbyBathrooms) }
        <MessagesBar map={ this.map } timeInBathroom={ timeInBathroom } messages={ messages }/>
      </div>
		);
	}
}

Map.propTypes = propTypes;

const mapStateToProps = (state) => {
  const {
    userId,
    userLocation,
    nearbyBathrooms,
    lines,
    messages,
    inProgressBathroomAddress,
    inProgressBathroomLatLng,
    addingBathroom,
    timeInBathroom,
  } = state;

  return {
    timeInBathroom,
    lines,
    userId,
    userLocation,
    nearbyBathrooms,
    messages,
    inProgressBathroomAddress,
    inProgressBathroomLatLng,
    addingBathroom,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  //initiated by actions
  //put in a container component that
  return {
    updateUserLocation: (location, ranges) => dispatch(updateUserLocation(location, ranges)),
    addBathrooms: bs => dispatch(addBathrooms(bs)),
    removeBathrooms: bs => dispatch(removeBathrooms(bs)),
    updateUserId: id => dispatch(updateUserId(id)),
    setBathroomToUnoccupied: bId => dispatch(setBathroomToUnoccupied(bId)),
    setBathroomToOccupied: bId => dispatch(setBathroomToOccupied(bId)),
    hideBathroomTooltip: bId => dispatch(hideBathroomTooltip(bId)),
    showBathroomTooltip: bId => dispatch(showBathroomTooltip(bId)),
    bulkUpdatePrimitives: stateObj => dispatch(bulkUpdatePrimitives(stateObj)),
    socketMessageDispatcher: message => dispatch(message),
    toggleBathroomMaker: (shouldOpen, address, latLng) => dispatch(toggleBathroomMaker(shouldOpen, address, latLng)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
