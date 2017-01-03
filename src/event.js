import once from 'once';
import pLimit from 'p-limit';

const limit = pLimit(2);
const downloads = {};
const resolvers = {};

const addDownloadListener = once(() => {
  chrome.downloads.onChanged.addListener(function (delta) {
    const download = downloads[delta.id];
    const hasState = delta.state;

    download.state = hasState
      ? delta.state.current
      : 'in_progress';

    if (download.state !== 'in_progress') {
      resolvers[delta.id]();
    }
    sendUpdateMessage();
  });
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab && request.type === 'DOWNLOAD_MANY') {
    const {files, destPath} = request.payload;
    addDownloadListener();
    queueAllDownloads(files, destPath);
  }
});

function downloadFile({url, filename}, destPath) {
  return limit(() => {
    return new Promise((resolve) => {
      chrome.downloads.download({
        conflictAction: 'overwrite',
        filename: destPath + filename,
        url
      }, downloadStarted({url, filename, resolve}));
    });
  });
}

function downloadStarted(info) {
  return function (downloadId) {
    // Store resolve functions separately to avoid trying to marshall them in messages
    resolvers[downloadId] = info.resolve;
    downloads[downloadId] = {
      filename: info.filename,
      url: info.url,
      state: 'in_progress'
    };
  };
}

function queueAllDownloads(files, destPath) {
  files.forEach(file => downloadFile(file, destPath));
}

function sendUpdateMessage() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'DOWNLOAD_MANY_UPDATE',
      payload: {
        files: downloads
      }
    });
  });
}
