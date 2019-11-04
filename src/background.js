const extension = require('extensionizer')

// On first install, open a new tab with MetaMask
extension.runtime.onInstalled.addListener(({reason}) => {
  if ((reason === 'install') && (!METAMASK_DEBUG)) {
    platform.openExtensionInBrowser()
  }
})  
  
chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});