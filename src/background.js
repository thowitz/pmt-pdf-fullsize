// todo switch to typescript
const pmtPdfIframeRoot = "https://www.physicsandmathstutor.com/pdf-pages/";
const pmtPdfRoot = "https://pmt.physicsandmathstutor.com/download/";

function redirectToPdf(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      location.replace(
        document.getElementById("pdf-content").children[0].src + "#zoom=125"
      );
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
  console.log("Attempt navigation called");
  if (nextState === "on" && tab.url.startsWith(pmtPdfIframeRoot) === true) {
    redirectToPdf(tab);
  } else if (nextState === "off" && tab.url.startsWith(pmtPdfRoot) === true) {
    goBackToIframe(tab);
  }
}

function saveState(newState, tab) {
  console.log("Save state called");
  chrome.action.setBadgeText({
    tabId: tab ? tab.id : undefined,
    text: newState.toUpperCase(),
  });

  chrome.storage.sync.set({ extensionEnabledState: newState });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("On installed");
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    const currentState = result.extensionEnabledState;
    if (!currentState) {
      saveState("on");
    } else {
      saveState(currentState);
    }
  });
});

chrome.windows.onFocusChanged.addListener(() => {
  console.log("On focus changed");
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    let badgeText = "";
    badgeText ||= result.extensionEnabledState.toUpperCase();

    console.log("On focus changed result", result);
    chrome.action.setBadgeText({
      text: badgeText,
    });
  });
});

// set badge text in new active tab
// todo fix
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("On activated");
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    let badgeText = "";
    badgeText ||= result.extensionEnabledState.toUpperCase();

    console.log("On activated result", result);
    chrome.action.setBadgeText({
      tabId: activeInfo.tabId,
      text: badgeText,
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("On updated");
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
  console.log("On clicked");
  const result = await chrome.storage.sync.get("extensionEnabledState");
  const prevState = result.extensionEnabledState;

  // the button only toggles
  const nextState =
    prevState === "on" ? "off" : prevState === "off" ? "on" : "";

  attemptNavigation(nextState, tab);
  saveState(nextState, tab);
});
