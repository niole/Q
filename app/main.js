import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './view/App.jsx';
import store from './store.js';


document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
  <Provider store={ store }>
    <App/>
  </Provider>,
  document.getElementById('app')
  );
});
