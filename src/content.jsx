import React from 'react';
import ReactDOM from 'react-dom';

import './styles/content.less';

import Uploader from './components/Uploader.jsx';
import Downloader from './components/Downloader.jsx';

var add_emoji_form = document.querySelector('#addemoji');
var container_div = document.createElement('div');

add_emoji_form.appendChild(container_div);

ReactDOM.render(
  <div>
    <hr />
    <Uploader />
    <hr />
    <Downloader />
  </div>,
  container_div
);
