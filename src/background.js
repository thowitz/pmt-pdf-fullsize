// todo switch to typescript
const pmtPdfIframe = "https://www.physicsandmathstutor.com/pdf-pages/";
const pmtPdf = "https://pmt.physicsandmathstutor.com/download/";

function redirectToIframe(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      location.replace(document.getElementById("pdf-content").children[0].src);
    },
  });
}

function goBack(tabId, iframePdfLocation) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // todo figure out variables not working
      window.alert(iframePdfLocation);
      // location.replace(iframePdfLocation);
    },
  });
}

// chrome.runtime.onInstalled.addListener(() => {
//   // todo get saved state
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.action.setBadgeText({
    text: "ON",
  });

  // todo check current state
  console.log("Tab", tab.url);
  if (tab.pendingUrl !== true && tab.url.startsWith(pmtPdfIframe) === true) {
    console.log("Redirect");
    // redirectToIframe(tabId);
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

  if (nextState === "ON" && tab.url.startsWith(pmtPdfIframe) === true) {
    redirectToIframe(tab.id);
  } else if (nextState === "OFF" && tab.url.startsWith(pmtPdf) === true) {
    // const iframePdfLocation = `${pmtPdfIframe}?pdf=${encodeURIComponent(
    //   tab.url
    // )}`;
    const iframePdfLocation =
      "https://www.physicsandmathstutor.com/pdf-pages/?pdf=https://pmt.physicsandmathstutor.com/download/Physics/A-level/Topic-Qs/AQA/07-Fields/Set-N/7.2.%20Gravitational%20Fields%20MS.pdf";
    goBack(tab.id, iframePdfLocation);
  }
});
