import {
  UPDATE_LINE_RANK,
  REMOVE_FROM_LINE,
  ADD_TO_LINE,
  ADD_MSG,
  REMOVE_MSG,
  ADD_BATHROOMS,
  REMOVE_BATHROOMS,
  UPDATE_USER_LOCATION,
  UPDATE_USER_ID,
  SET_BATHROOM_OCCUPIED,
  SET_BATHROOM_UNOCCUPIED,
  SHOW_BATHROOM_TOOLTIP,
  HIDE_BATHROOM_TOOLTIP,
  ADD_TIME_IN_BATHROOM,
  BULK_UPDATE_PRIMITIVES,
  MSG_LEFT_LINE,
  MSG_ENTER_LINE,
} from './actions.js';


const initialState = {
  userId: 0,
  userLocation: [51.508742,-0.120850],
  lines: {},
  messages: [],
  nearbyBathrooms: [],
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case MSG_LEFT_LINE:
      return Object.assign({}, state, {
        lines: Object.assign({}, state.lines, { [action.data.bathroomId]: action.data.newRank }),
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b.id === action.data.bathroomId) {
            b.lineLength = action.data.lineLength;
          }
          return b;
        })
      });

    case BULK_UPDATE_PRIMITIVES:
      return Object.assign({}, state, action.data);

    case SHOW_BATHROOM_TOOLTIP:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b.id === action.data) {
            b.showTooltip = true;
          } else if (b.showTooltip) {
            b.showTooltip = false;
          }

          return b;
        })
      });

    case HIDE_BATHROOM_TOOLTIP:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          //currently hides all tooltips
          if (b.id === action.data) {
            b.showTooltip = false;
            b.infoWindow.close();
          }

          return b;
        })
      });

    case SET_BATHROOM_OCCUPIED:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b.id === action.data) {
            b.occupied = true;
          }
          return b;
        })
      });

    case SET_BATHROOM_UNOCCUPIED:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b.id === action.data) {
            b.occupied = false;
          }
          return b;
        })
      });

    case UPDATE_USER_LOCATION:
      return Object.assign({}, state, {
        userLocation: action.data,
      });

    case UPDATE_USER_ID:
      return Object.assign({}, state, {
        userId: action.data,
      });

    case ADD_BATHROOMS:
      return Object.assign({}, state, {
        nearbyBathrooms: action.data.newNearByBathrooms.concat(state.nearbyBathrooms),
        lines:  action.data.lineMembers.length ?
          action.data.lineMembers.reduce((acc, lm) => {
            acc[lm.bathroomId] = lm.rank;
            return acc;
          }, Object.assign({}, state.lines)) :
          state.lines
      });

    case REMOVE_BATHROOMS:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.filter(b => action.data.indexOf(b.id) === -1),
      });

    case UPDATE_LINE_RANK:
      //find relevant bathroom and update rank
      return Object.assign({}, state, {
        lines: Object.assign(state.lines, action.data),
      });

    case REMOVE_FROM_LINE:
      const newLines = Object.assign({}, state.lines);
      const bId = parseInt(action.data);

      delete newLines[bId];

      return Object.assign({}, state, {
        lines: newLines,
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (bId === b.id) {
            b.lineLength -= 1;
          }
          return b;
        })
      });

    case ADD_TO_LINE:
      return Object.assign({}, state, {
        lines: Object.assign(state.lines, action.data),
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (typeof action.data[b.id] === "number") {
            b.lineLength += 1;
          }
          return b;
        })
      });

    case ADD_MSG:
      return Object.assign({}, state, {
        messages: [action.data].concat(state.messages),
      });

    case REMOVE_MSG:
      return Object.assign({}, state, {
        messages: state.messages.filter(m => m.id !== action.data.id),
      });

    default:
      return state
  }
}
