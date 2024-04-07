chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  if (details.url.startsWith('chrome://')) return
    chrome.scripting.executeScript({
      target: {tabId: details.tabId},
      files: ['script.js']
    });
  // }
});