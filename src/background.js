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

function attemptNavigation(nextState, tab) {
  if (nextState === "on" && tab.url.startsWith(pmtPdfIframeRoot) === true) {
    redirectToPdf(tab);
  } else if (nextState === "off" && tab.url.startsWith(pmtPdfRoot) === true) {
    goBackToIframe(tab);
  }
}

function saveState(newState, tab) {
  chrome.action.setBadgeText({
    tabId: tab ? tab.id : undefined,
    text: newState.toUpperCase(),
  });

  console.log("New state set", newState);
  chrome.storage.sync.set({ extensionEnabledState: newState });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    const currentState = result.extensionEnabledState;
    if (!currentState) {
      saveState("on");
    } else {
      saveState(currentState);
    }
  });
});

// set badge text in new active tab
// todo fix
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    let badgeText = "";
    badgeText ||= result.extensionEnabledState.toUpperCase();

    console.log("Called on activated");
    chrome.action.setBadgeText({
      tabId: activeInfo.tabId,
      text: badgeText,
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    const currentState = result.extensionEnabledState;

    attemptNavigation(currentState, tab);
    chrome.action.setBadgeText({
      tabId: tab ? tab.id : undefined,
      text: currentState.toUpperCase(),
    });
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.sync.get("extensionEnabledState");
  const prevState = result.extensionEnabledState;

  // the button only toggles
  const nextState =
    prevState === "on" ? "off" : prevState === "off" ? "on" : "";

  attemptNavigation(nextState, tab);
  saveState(nextState, tab);
});
