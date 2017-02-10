import store from './store.js';


export default function setUpMessageHandler() {
  const socket = io.connect();
  const { userId } = store.getState();

  return socket.on(userId.toString(), function(msg) {
    //based on what the message is, dispatch an action
    //msg must be an actionType: { type: TYPE, data: ... }

    store.dispatch(msg);
  });
}
