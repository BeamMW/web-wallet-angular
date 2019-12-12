// On first install, open a new tab with MetaMask
function openExtensionInBrowser() {
  const extensionURL = chrome.runtime.getURL('index.html#initialize/create');

  chrome.tabs.create({ url: extensionURL })
}

chrome.runtime.onInstalled.addListener(({reason}) => {
  if ((reason === 'install')) {
    openExtensionInBrowser();
  }
});