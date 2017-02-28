const geolib = require('geolib');

function getLatLngRange(mapBounds) {
  console.log('mapBounds', mapBounds);

  const lngs = mapBounds.lngs.sort(function(a, b) { return a-b; });
  const lats = mapBounds.lats.sort(function(a, b) { return a-b; });

  return {
    lngs: lngs,
    lats: lats,
  };

}


function getNeabyUsersWhereClause(mapBounds, userToExclude) {
  const ranges = getLatLngRange(mapBounds);

  if (userToExclude) {
    return {
      longitude: {
        $between: ranges.lngs,
      },
      latitude: {
        $between: ranges.lats,
      },
      id: {
        $ne: userToExclude
      }
    };
  }

  return {
   longitude: {
     $between: ranges.lngs,
   },
   latitude: {
     $between: ranges.lats,
   }
  };
}

module.exports = {
  getNeabyUsersWhereClause: getNeabyUsersWhereClause,
  getLatLngRange: getLatLngRange,
};
