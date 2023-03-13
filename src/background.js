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

function attemptNavigation(tab, nextState) {
  if (nextState === "on" && tab.url.startsWith(pmtPdfIframeRoot) === true) {
    redirectToPdf(tab);
  } else if (nextState === "off" && tab.url.startsWith(pmtPdfRoot) === true) {
    goBackToIframe(tab);
  }
}

function saveState(tab, newState) {
  chrome.action.setBadgeText({
    tabId: tab.id,
    text: newState,
  });

  chrome.storage.sync.set({ extensionEnabledState: newState });
}

// set badge text in new active tab
chrome.tabs.onActivated.addListener((tabId) => {
  chrome.storage.sync.get(["extensionEnabledState"]).then((currentState) =>
    chrome.action.setBadgeText({
      tabId,
      text: currentState.toUpperCase(),
    })
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync
    .get(["extensionEnabledState"])
    .then((currentState) => attemptNavigation(tab, currentState));
});

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.storage.sync.get(["extensionEnabledState"]);
  // the button only toggles
  const nextState = prevState === "on" ? "off" : "on";

  attemptNavigation(tab, nextState);
  saveState(tab, nextState);
});
