import React, {PropTypes, Component} from 'react';
import ReactDOMServer from 'react-dom/server';
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
      nearbyBathrooms: [], //[{ marker: object, lat: number, lng: number, showTooltip: false, target: null}]
    };
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
    const nextBathrooms = this.state.nearbyBathrooms.map(otherB => {
      if (otherB._id === b._id) {
        otherB.showTooltip = !otherB.showTooltip;
      } else {
        otherB.showTooltip = false;
      }

      return otherB;
    });

    this.setState({ nearbyBathrooms: nextBathrooms });
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

          const infoWindow = new google.maps.InfoWindow({
            content: ReactDOMServer.renderToString(<div id={ `${b._id}-tooltip` }/>)
          });

          const boundListener = this.handleBathroomClick.bind(this, b);
          google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
            boundListener(b);
          });

          return {
            marker,
            unmountHandler: () => {
              //TODO look into if this actuall works
              google.maps.event.removeEventListener(marker, 'click', boundListener);
            },
            lat: b.latitude,
            lng: b.longitude,
            showTooltip: false,
            lineLength: b.lineLength,
            _id: b._id,
          };
        });

        this.setState({ nearbyBathrooms: newNearByBathrooms });
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
              bathroomId={ b._id }
              location={ [b.lat, b.lng] }
              lineLength={ b.lineLength }
              userRank={ -1 } //TODO send request to get this info
              target={ document.getElementById(`${b._id}-tooltip`) }
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
      nearbyBathrooms,
    } = this.state;

    const newBathrooms = nearbyBathrooms.map(b => {
      if (b._id === bathroomId) {
        b.showTooltip = false;
      }
      return b;
    });

    this.setState({ nearbyBathrooms: newBathrooms });
  }

	render() {
    const {
      nearbyBathrooms,
    } = this.state

		return (
      <div>
        <div id="map" ref="map"/>
        { this.showOpenToolTips(nearbyBathrooms) }
      </div>
		);
	}
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;
