const geolib = require('geolib');


function getNeabyUsersWhereClause(centralLat, centralLng, userToExclude) {
  const bLocation = {
    lat: centralLat,
    lon: centralLng,
  };

  const north = geolib.computeDestinationPoint(bLocation, 2000, 0);
  const east = geolib.computeDestinationPoint(bLocation, 2000, 90);
  const south = geolib.computeDestinationPoint(bLocation, 2000, 180);
  const west = geolib.computeDestinationPoint(bLocation, 2000, 270);

  if (userToExclude) {
    return {
      longitude: {
        $between: [west.longitude, east.longitude]
      },
      latitude: {
        $between: [south.latitude, north.latitude]
      },
      id: {
        $ne: userToExclude
      }
    };
  }
  return {
   longitude: {
     $between: [west.longitude, east.longitude]
   },
   latitude: {
     $between: [south.latitude, north.latitude]
   }
  };
}

module.exports = {
  getNeabyUsersWhereClause: getNeabyUsersWhereClause,
};
