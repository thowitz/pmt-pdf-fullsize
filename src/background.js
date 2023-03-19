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
  // removes zoom parameter from end of url
  const plainPdfUrl = currentUrl.slice(0, currentUrl.indexOf("#zoom="));

  const iframePdfLocation = `${pmtPdfIframeRoot}?pdf=${encodeURIComponent(
    plainPdfUrl
  )}`;

  chrome.tabs.update(tabId, { url: iframePdfLocation });
}

function attemptNavigation(nextState, currentUrl, tabId) {
  if (currentUrl) {
    if (
      nextState === "on" &&
      currentUrl.startsWith(pmtPdfIframeRoot) === true
    ) {
      redirectToPdf(tabId);
    } else if (
      nextState === "off" &&
      currentUrl.startsWith(pmtPdfRoot) === true
    ) {
      goBackToIframe(currentUrl, tabId);
    }
  }
}

function updateIcon(newState, tabId) {
  if (newState) {
    chrome.action.setIcon({
      path: `assets/img/16x16${newState === "off" ? "-disabled" : ""}.png`,
      tabId,
    });
  }
}

function saveState(newState, tabId) {
  updateIcon(newState, tabId);
  chrome.storage.sync.set({ extensionEnabledState: newState });
}

function updateTabToCurrentState(currentUrl, tabId) {
  chrome.storage.sync.get("extensionEnabledState").then((result) => {
    const currentState = result.extensionEnabledState;

    attemptNavigation(currentState, currentUrl, tabId);
    updateIcon(currentState, tabId);
  });
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

chrome.windows.onFocusChanged.addListener(() => {
  chrome.tabs.query({ active: true }, (tabs) =>
    tabs.forEach((tab) => {
      updateTabToCurrentState(tab.url, tab.id);
    })
  );
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) =>
    updateTabToCurrentState(tab.url, activeInfo.tabId)
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.get(tabId, (tab) => updateTabToCurrentState(tab.url, tabId));
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.sync.get("extensionEnabledState");
  const prevState = result.extensionEnabledState;

  // the button only toggles
  if (prevState) {
    const nextState = prevState === "on" ? "off" : "on";

    attemptNavigation(nextState, tab.url, tab.id);
    saveState(nextState, tab.id);
  }
});
