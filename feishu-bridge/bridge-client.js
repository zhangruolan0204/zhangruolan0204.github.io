/* 注入到秋招工作台页面：与页面握手，让工作台能显示「扩展已连接」状态 */
(function () {
  'use strict';
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'qz-bridge-ping') {
      window.postMessage({ type: 'qz-bridge-pong', ts: Date.now() }, '*');
    }
  });
  // 页面加载后主动告知：我有桥接数据待推送吗
  window.postMessage({ type: 'qz-bridge-hello' }, '*');
})();
