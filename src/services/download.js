export function downloadAllEmoji(options = {}) {
  addDownloadListener(options.onUpdate);
  queueAllDownloads();
}

export function getDownloadPath() {
  const teamName = getTeamName();
  return `${teamName} Emoji/`;
}

function addDownloadListener(listener) {
  chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (request.type === 'DOWNLOAD_MANY_UPDATE') {
      listener(request.payload.files);
    }
  });
}

function getTeamName() {
  return document.querySelector('#header_team_name').innerText;
}

function queueAllDownloads() {
  chrome.runtime.sendMessage({
    type: 'DOWNLOAD_MANY',
    payload: {
      destPath: getDownloadPath(),
      files: scrapeEmoji()
    }
  });
}

function scrapeEmoji() {
  return Array.from(document.querySelectorAll('.emoji_row td:first-child span'))
    .map(el => {
      // Emoji CDN URLs look like: "https://emoji.slack-edge.com/T1R4QBJ0N/emoji-name/f185bdc9736cc070.png"
      const url = el.getAttribute('data-original');
      const segments = url.split('/');
      const ext = segments[segments.length - 1].split('.')[1];
      const filename = segments[segments.length - 2] + `.${ext}`;
      return { url, filename };
    });
}
