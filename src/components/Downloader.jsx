import React from 'react';
import cx from 'classnames';
import { downloadAllEmoji, getDownloadPath } from '../services/download.js';

export default class Downloader extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      downloads: {}
    };
    this.downloadAll = Downloader.prototype.downloadAll.bind(this);
    this.onUpdate = Downloader.prototype.onUpdate.bind(this);
  }

  downloadAll(event) {
    event.preventDefault();
    downloadAllEmoji({ onUpdate: this.onUpdate });
  }

  onUpdate(downloads) {
    this.setState({ downloads });
  }

  renderDownload({filename, state}) {
    const status = state === 'complete'
      ? 'Complete'
      : state === 'in_progress'
        ? 'Downloading...'
        : 'Interrupted';

    const base_class = 'set__uploader__upload';
    const upload_classes = cx({
      [base_class]: true,
      [`${base_class}--success`]: state === 'complete',
      [`${base_class}--error`]: state === 'interrupted'
    });

    return (
      <li className={upload_classes} key={filename}>
        <span className={`${base_class}__filename`}>{filename}</span>
        <span className={`${base_class}__status`}>
          <i className={`${base_class}__status__icon ${base_class}__status__icon-uploading ts_icon ts_icon_spin ts_icon_spinner`} />
          <i className={`${base_class}__status__icon ${base_class}__status__icon-error ts_icon ts_icon_warning`} />
          <i className={`${base_class}__status__icon ${base_class}__status__icon-success ts_icon ts_icon_check_circle_o`} />
          {status}
        </span>
      </li>
    );
  }

  renderDownloads() {
    const downloads = Object.keys(this.state.downloads)
      .map(id => this.renderDownload(this.state.downloads[id]));

    return (
      <ul className='set__uploader__uploads'>
        {downloads}
      </ul>
    );
  }

  render() {
    return (
      <div className='slack-emoji-tools'>
        <h4>Bulk Emoji Downloader</h4>
        <p>
          Downloads all emoji to <code>(your download folder)/{getDownloadPath()}</code>.
        </p>
        <p>
          <button className='btn' onClick={this.downloadAll}>Download all emoji</button>
        </p>
        {this.renderDownloads()}
      </div>
    );
  }
}
