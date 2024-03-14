// 注意 V3 和 V2 的区别
// V3 的 全局变量不支持持久化，因此需要存储到sessionStorage中
// 在回调函数中不能修改http header， 需要使用 声明性网络请求语法。

//let rootTabUrls = {};

//console.log("init")
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //console.log("detect change:", changeInfo, tabId, tab)
  if (changeInfo.url) {
    chrome.storage.session.set({ "tabid": tabId.toString() }, function() {
      console.log('sessionStorage add  tabId:' ,tabId );
    });
    chrome.storage.session.set({ "taburl": changeInfo.url }, function() {
      console.log('sessionStorage add  taburl:', changeInfo.url );
    });
  }
});

// chrome.webRequest.onBeforeSendHeaders.addListener(
//   (details) => {
//     // 获取顶级框架的URL
//     let rootUrl = details.type === "main_frame" ? details.url : rootTabUrls[details.tabId];
//     if (rootUrl) {
//       // 解析URL以获取根URI
//       let url = new URL(rootUrl);
//       let rootUri = url.origin + url.pathname;

//       // 在请求头部添加自定义字段
//       details.requestHeaders.push({
//         name: "X-Instant-Id",
//         value: rootUri
//       });
//       console.log("requestHeaders add:", rootUri)
//     }

//     return { requestHeaders: details.requestHeaders };
//   },
//   { urls: ["<all_urls>"] },
//   ["requestHeaders", "blocking", "extraHeaders"]
// );

// ResourceType取值参考： https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn#type-ResourceType
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("request details:", details)
    // 获取存储在session中的根节点请求URI
    chrome.storage.session.get(["tabid", "taburl"], function(result) {
      console.log("result", result)
      if (true) {
        // 添加或修改请求头中的x-aa字段
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [{
            id: 1,
            priority: 1,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                { header: "_tab_url", operation: "set", value: result.taburl },
                { header: "_tab_id", operation: "set", value: result.tabid }
              ]
            },
            condition: { urlFilter: '|http*://*/*', resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', "stylesheet", 'websocket', "media", "ping"] }
          }],
          removeRuleIds: [1]
        });
      }
    });
  },
  { urls: ["<all_urls>"] }
);

// 清除不再需要的URLs
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(["tabid", "taburl"], function() {
    console.log('sessionStorage remove tabId: ' ,tabId);
  });

});

