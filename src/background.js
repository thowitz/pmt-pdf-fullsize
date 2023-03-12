const pmtPdf = "https://www.physicsandmathstutor.com/pdf-pages/";

function redirectToIframe(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      location.replace(document.getElementById("pdf-content").children[0].src);
    },
  });
}

function goBack(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      history.back();
    },
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "ON",
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  console.log("Change info", changeInfo);
  if (changeInfo.url.startsWith(pmtPdf) === true) {
    redirectToIframe(tabId);
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

  if (nextState === "ON" && tab.url.startsWith(pmtPdf) === true) {
    redirectToIframe(tab.id);
  } else if (nextState === "OFF") {
    goBack(tab.id);
  }
});
