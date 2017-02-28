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

  const lngs = [west.longitude, east.longitude].sort(function(a, b) { return a-b; });
  const lats = [south.latitude, north.latitude].sort(function(a, b) { return a-b; });

  if (userToExclude) {
    return {
      longitude: {
        $between: lngs,
      },
      latitude: {
        $between: lats,
      },
      id: {
        $ne: userToExclude
      }
    };
  }

  return {
   longitude: {
     $between: lngs,
   },
   latitude: {
     $between: lats,
   }
  };
}

module.exports = {
  getNeabyUsersWhereClause: getNeabyUsersWhereClause,
};
