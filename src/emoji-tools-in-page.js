;(() => {
  const poller = setInterval(() => {
    const { activeTeam } = window.slackDebug && window.slackDebug
    const { customizeEmoji } = activeTeam && activeTeam.redux.getState()
    if (customizeEmoji && customizeEmoji.customEmojiData) {
      clearInterval(poller)

      console.log(
        '*** Custom emoji count: ${customizeEmoji.customEmojiData.size}'
      )
      const names = customizeEmoji.customEmojiData.map(({ name }) => name)

      document.dispatchEvent(
        new CustomEvent('EmojiTools_CustomEmoji', {
          detail: new Set(names)
        })
      )
    }
  }, 2000)
})()
