const script = document.createElement('script');
script.setAttribute("type", "module");
script.setAttribute("src", chrome.extension.getURL('inpage.js'));
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(script, head.lastChild);

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.text === 'api-result') {
        window.dispatchEvent(new CustomEvent("apiResult", {detail: {response: message.response}}));
    }
});

window.addEventListener("getChromeData", function(data) {
    chrome.runtime.sendMessage({text: 'load-faucet', params: data.detail});
    console.log( data );
}, false);

window.addEventListener("callWalletApi", function(data) {
    chrome.runtime.sendMessage({text: 'call-app-api', params: data.detail});
    console.log( data );
}, false);




  