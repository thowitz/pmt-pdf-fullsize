const pmtPdfIframeRoot = "https://www.physicsandmathstutor.com/pdf-pages/";
const pmtPdfRoot = "https://pmt.physicsandmathstutor.com/download/";

function redirectToPdf(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      location.replace(
        document.getElementById("pdf-content").children[0].src + "#zoom=125"
      );
    },
  });
}

function goBackToIframe(currentUrl, tabId) {
  // remove zoom text from end of url
  const plainPdfUrl = currentUrl.slice(0, currentUrl.indexOf("#zoom="));

  const iframePdfLocation = `${pmtPdfIframeRoot}?pdf=${encodeURIComponent(
    plainPdfUrl
  )}`;

  chrome.tabs.update(tabId, { url: iframePdfLocation });
}

function attemptNavigation(nextState, currentUrl, tabId) {
  console.log("Attempt navigation called");
  if (nextState === "on" && currentUrl.startsWith(pmtPdfIframeRoot) === true) {
    redirectToPdf(tabId);
  } else if (
    nextState === "off" &&
    currentUrl.startsWith(pmtPdfRoot) === true
  ) {
    goBackToIframe(currentUrl, tabId);
  }
}

function saveState(newState, tabId) {
  console.log("Save state called");
  chrome.action.setBadgeText({
    tabId,
    text: newState.toUpperCase(),
  });

  chrome.storage.sync.set({ extensionEnabledState: newState });
}

function updateTabToCurrentState(currentUrl, tabId) {
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    console.log("Current state", result);
    const currentState = result.extensionEnabledState;

    attemptNavigation(currentState, currentUrl, tabId);
    chrome.action.setBadgeText({
      tabId,
      text: currentState.toUpperCase(),
    });
  });
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

  chrome.tabs.getCurrent({ active: true }, (tabs) =>
    tabs.forEach((tab) => updateTabToCurrentState(tab.url, tab.id))
  );
});

// set badge text in new active tab
// todo fix
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("On activated");

  chrome.tabs.get(activeInfo.tabId, (tab) =>
    updateTabToCurrentState(tab.url, activeInfo.tabId)
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  console.log("On updated");

  updateTabToCurrentState(changeInfo.url, tabId);
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log("On clicked");
  const result = await chrome.storage.sync.get("extensionEnabledState");
  const prevState = result.extensionEnabledState;

  // the button only toggles
  let nextState;
  if (prevState === "on") {
    nextState = "off";
  } else if (prevState === "off") {
    nextState = "on";
  }

  if (nextState) {
    attemptNavigation(nextState, tab);
    saveState(nextState, tab);
  }
});
