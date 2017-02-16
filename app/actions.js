export const UPDATE_LINE_RANK = "updateLineRank";
export const REMOVE_FROM_LINE = "removeFromLine";
export const ADD_TO_LINE = "addToLine";

export const ADD_MSG = "addMessage";
export const REMOVE_MSG = "removeMessage";
export const ACCEPT_CUT_MSG = "exportCutMessage";

export const SET_BATHROOM_OCCUPIED = "setBathroomOccupied";
export const SET_BATHROOM_UNOCCUPIED = "setBathroomUnoccupied";
export const ADD_BATHROOMS = "addBathrooms";
export const REMOVE_BATHROOMS = "removeBathrooms";
export const SHOW_BATHROOM_TOOLTIP = "showBathroomTooltip";
export const HIDE_BATHROOM_TOOLTIP = "hideBathroomTooltip";
export const ENTER_BATHROOM = "enterBathroom";
export const UPDATE_TIME_IN_BATHROOM = "updateTimeInBathroom";
export const TOGGLE_BATHROOM_MAKER = "toggleBathroomMaker";

export const UPDATE_USER_LOCATION = "updateUserLocation";
export const UPDATE_USER_ID = "updateUserId";

export const BULK_UPDATE_PRIMITIVES = "bulkUpdatePrimitivesOnly";

export function toggleBathroomMaker(makeBathroom = false, address = null, latLng = null) {
  return {
    type: TOGGLE_BATHROOM_MAKER,
    data: {
      makeBathroom,
      address,
      latLng,
    },
  };
}


export function bulkUpdatePrimitives(stateObj) {
  return {
    type: BULK_UPDATE_PRIMITIVES,
    data: stateObj,
  };
}

export function hideBathroomTooltip(bathroomId) {
  return {
    type: HIDE_BATHROOM_TOOLTIP,
    data: bathroomId,
  };
}

export function showBathroomTooltip(bathroomId) {
  return {
    type: SHOW_BATHROOM_TOOLTIP,
    data: bathroomId,
  };
}

export function setBathroomToUnoccupied(bathroomId) {
  return {
    type: SET_BATHROOM_UNOCCUPIED,
    data: bathroomId,
  };
}

export function setBathroomToOccupied(bathroomId) {
  return {
    type: SET_BATHROOM_OCCUPIED,
    data: bathroomId,
  };
}

export function updateUserId(userId) {
  return {
    type: UPDATE_USER_ID,
    data: userId,
  };
}

export function updateUserLocation(newLocation) {
  return {
    type: UPDATE_USER_LOCATION,
    data: newLocation,
  };
}

export function removeBathrooms(bathroomsToRemove) {
  return {
    type: REMOVE_BATHROOMS,
    data: bathroomsToRemove,
  };
}

export function addBathrooms(newBathrooms) {
  return {
    type: ADD_BATHROOMS,
    data: newBathrooms,
  };
}

export function updateLineRank(newRank, bathroomId) {
  return {
    type: UPDATE_LINE_RANK,
    data: { [bathroomId]: newRank },
  };
}

export function enterBathroom(bathroomId, time) {
  return {
    type: ENTER_BATHROOM,
    data: {
      bathroomId,
      time,
    }
  };
}

export function updateTimeInBathroom(bathroomId, time = -1) {
  return {
    type: UPDATE_TIME_IN_BATHROOM,
    data: {
      time,
      bathroomId,
    }
  };
}

export function enterLine(lineData, time = 0) {
  const bathroomId = Object.keys(lineData)[0];

  return {
    type: ADD_TO_LINE,
    data: {
      bathroomId,
      lineData,
      time,
    }
  };
}

export function leaveLine(bathroomId, lineLength) {
  return {
    type: REMOVE_FROM_LINE,
    data: {
      bathroomId,
      lineLength,
    }
  };
}

export function addMessage(message) {
  return {
    type: ADD_MSG,
    data: message,
  };
}

export function acceptCut(bathroomId, newRank, messageId) {
  return {
    type: ACCEPT_CUT_MSG,
    data: {
      bathroomId,
      newRank,
      messageId
    }
  };
}

export function removeMessage(message) {
  return {
    type: REMOVE_MSG,
    data: message,
  };
}
