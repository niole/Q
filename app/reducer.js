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
} from './actions.js';


const initialState = {
  userId: "sdfdss",
  userLocation: undefined,
  lines: {},
  messages: [],
  nearbyBathrooms: [],
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_BATHROOM_TOOLTIP:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b._id === action.data) {
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
          if (b._id === action.data) {
            b.showTooltip = false;
            b.infoWindow.close();
          }

          return b;
        })
      });

    case SET_BATHROOM_OCCUPIED:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b._id === action.data) {
            b.occupied = true;
          }
          return b;
        })
      });

    case SET_BATHROOM_UNOCCUPIED:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.map(b => {
          if (b._id === action.data) {
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
        nearbyBathrooms: action.data.concat(state.nearbyBathrooms),
      });

    case REMOVE_BATHROOMS:
      return Object.assign({}, state, {
        nearbyBathrooms: state.nearbyBathrooms.filter(b => action.data.indexOf(b._id) === -1),
      });

    case UPDATE_LINE_RANK:
      //find relevant bathroom and update rank
      return Object.assign({}, state, {
        lines: Object.assign(state.lines, action.data),
      });

    case REMOVE_FROM_LINE:
      const newLines = Object.assign({}, state.lines);
      delete newLines[action.data];

      return Object.assign({}, state, {
        lines: newLines,
      });

    case ADD_TO_LINE:
      return Object.assign({}, state, {
        lines: Object.assign(state.lines, action.data),
      });

    case ADD_MSG:
      return Object.assign({}, state, {
        messages: [action.data].concat(state.messages),
      });

    case REMOVE_MSG:
      return Object.assign({}, state, {
        messages: state.messages.filter(m => m._id !== action.data._id),
      });

    default:
      return state
  }
}
