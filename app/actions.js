export const UPDATE_LINE_RANK = "updateLineRank";
export const REMOVE_FROM_LINE = "removeFromLine";
export const ADD_TO_LINE = "addToLine";

export const ADD_MSG = "addMessage";
export const REMOVE_MSG = "removeMessage";

export const SET_BATHROOM_OCCUPIED = "setBathroomOccupied";
export const SET_BATHROOM_UNOCCUPIED = "setBathroomUnoccupied";
export const ADD_BATHROOMS = "addBathrooms";
export const REMOVE_BATHROOMS = "removeBathrooms";
export const SHOW_BATHROOM_TOOLTIP = "showBathroomTooltip";
export const HIDE_BATHROOM_TOOLTIP = "hideBathroomTooltip";

export const UPDATE_USER_LOCATION = "updateUserLocation";
export const UPDATE_USER_ID = "updateUserId";


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

export function enterLine(bathroomId) {
  return {
    type: ADD_TO_LINE,
    data: bathroomId,
  };
}

export function leaveLine(bathroomId) {
  return {
    type: REMOVE_FROM_LINE,
    data: bathroomId,
  };
}

export function addMessage(message) {
  return {
    type: ADD_MSG,
    data: message,
  };
}

export function removeMessage(message) {
  return {
    type: REMOVE_MSG,
    data: message,
  };
}
