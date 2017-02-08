import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducer.js';
import App from './view/App.jsx';

const store = createStore(reducer);

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
  <Provider store={ store }>
    <App/>
  </Provider>,
  document.getElementById('app')
  );
});
