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

import {
  messageReceivedUpdateLineLineMember,
  MSG_LEFT_LINE,
  MSG_ENTER_LINE,
  MSG_RECEIVED_CUT_MESSAGE,
} from '../serverActions.js';


const endNumberPattern = /.+\/([0-9]+)/;
const { bool, arrayOf, string, object, node, number } = PropTypes;
const propTypes = {
  userLocation: arrayOf(number),
  userId: number.isRequired,
  nearbyBathrooms: arrayOf(object),
  lines: object,
};

class Map extends Component {
  constructor() {
    super();
    this.map = null;
    this.messageHandler = null;

    this.closeTooltip = this.closeTooltip.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const oldLocation = this.props.userLocation;
    const newLocation = newProps.userLocation;

    if (newProps.userId !== this.props.userId) {
      //update message handler
      this.messageHandler = this.setUpMessageHandler(newProps.userId.toString());
    }


    if (oldLocation[0] !== newLocation[0] || oldLocation[1] !== newLocation[1]) {
      this.map.panTo(new google.maps.LatLng(...newLocation));
    }
  }

  componentDidMount() {
   const {
      userLocation,
    } = this.props;

    this.messageHandler = this.setUpMessageHandler();
    this.map = this.initMap(this.refs.map);

    this.updateUserLocation(null, userLocation);

    this.setInitialState(() => {
      this.getNearbyBathrooms();
    });
  }

  setUpMessageHandler(id) {
    const socket = io.connect();

    return socket.on(id, msg => {
      //based on what the message is, dispatch an action
      //msg must be an actionType: { type: TYPE, data: ... }
      //TODO if client is looking at bathroom and is in line, must do another request
      //to get relevant data for tooltip

      switch(msg.type) {
        case MSG_LEFT_LINE:
          return this.handleLineLeave(msg);
        case MSG_ENTER_LINE:
          return this.handleServerActionDispatch(msg);
        case MSG_RECEIVED_CUT_MESSAGE:
          return this.handleServerActionDispatch(msg);
        default:
          break;
      }

    });
  }

  handleServerActionDispatch(msg) {
    //someone entered a line that you are near
    //this doesn't handle if you entered a line
    const {
      socketMessageDispatcher,
    } = this.props;

    socketMessageDispatcher(msg);
  }

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

  setInitialState(callback) {
    const {
      bulkUpdatePrimitives,
    } = this.props;

    const userId = this.getUserIdFromURL();
    const url = `routes/messages/${userId}`;

    $.ajax({
      url,
      success: messages => {
        navigator.geolocation.getCurrentPosition(locationData => {
          let userLocation = this.props.userLocation;

          if (false) { //locationData && locationData.coords) {
            const {
              longitude,
              latitude,
            } = locationData.coords;

            userLocation = [longitude, latitude];
          }

          bulkUpdatePrimitives({ userId, userLocation, messages });
          callback();
        });
      },
      error: err => {
        console.log('error', err);
      }
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
    const {
      updateUserLocation,
    } = this.props;

    if (oldLocation) {
     //TODO remove user from old location
     //remove bathrooms that aren't nearby anymore
    }

    const newPosition = {
      lat: newLocation[0],
      lng: newLocation[1],
    };

    const url = 'routes/user/:userId/loc/update';

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
      }
    });


    const marker = new google.maps.Marker({
      position: newPosition,
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
      messages,
    } = this.props;

		return (
      <div>
        <div id="map" ref="map"/>
        { this.showOpenToolTips(nearbyBathrooms) }
        <MessagesBar messages={ messages }/>
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
  } = state;

  return {
      lines,
      userId,
      userLocation,
      nearbyBathrooms,
      messages,
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
    socketMessageDispatcher: message => dispatch(message),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
