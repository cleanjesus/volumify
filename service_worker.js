chrome.action.onClicked.addListener((tab) => {
  //when you click
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      alert("Hello from my extension!"); //execution
    },
  });
});
