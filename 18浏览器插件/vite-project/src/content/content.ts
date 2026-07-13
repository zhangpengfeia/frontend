// console.log("this is content.ts");

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => { 
  if (request.message === "Hello") { 
    console.log("hello from content script");
  }

  sendResponse();
  return true;
})