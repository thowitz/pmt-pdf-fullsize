// todo switch to typescript
const pmtPdfIframeRoot = "https://www.physicsandmathstutor.com/pdf-pages/";
const pmtPdfRoot = "https://pmt.physicsandmathstutor.com/download/";

function redirectToPdf(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      location.replace(document.getElementById("pdf-content").children[0].src);
    },
  });
}

function goBackToIframe(tab) {
  const iframePdfLocation = `${pmtPdfIframeRoot}?pdf=${encodeURIComponent(
    tab.url
  )}`;

  chrome.tabs.update(tab.id, { url: iframePdfLocation });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.action.setBadgeText({
    text: "ON",
  });

  // todo check current state
  if (
    tab.pendingUrl !== true &&
    tab.url.startsWith(pmtPdfIframeRoot) === true
  ) {
    redirectToPdf(tabId);
  }
});

// thanks chrome extension docs
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });

  // Next state will always be the opposite
  const nextState = prevState === "ON" ? "OFF" : "ON";

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === "ON" && tab.url.startsWith(pmtPdfIframeRoot) === true) {
    redirectToPdf(tab);
  } else if (nextState === "OFF" && tab.url.startsWith(pmtPdfRoot) === true) {
    goBackToIframe(tab);
  }
});
