import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Instructions from './instructions';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

ReactDOM.render(
  <Instructions />,
  document.getElementById('instructions')
);
