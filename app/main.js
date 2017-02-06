import React from 'react';
import ReactDOM from 'react-dom';
import App from './view/App.jsx';


document.addEventListener("DOMContentLoaded", () => {
  console.log('works');
  ReactDOM.render(
  <App/>,
  document.getElementById('app')
  );
});
