/* 注入到飞书页面：多策略抓取多维表格数据（接口拦截 + WebSocket + DOM 兜底），并记录诊断信息 */
(function () {
  'use strict';
  if (window.__qzBridgeHooked) return;
  window.__qzBridgeHooked = true;

  var diag = {
    url: location.href,
    xhrJson: 0,      // 捕获到的 JSON 响应数
    matched: 0,      // 命中表格数据的次数
    wsMsg: 0,        // WebSocket 消息数
    domRows: 0,      // DOM 兜底采集行数
    canvasCount: 0,  // 页面 canvas 数量（>0 说明可能是画布渲染，DOM 取不到文字）
    iframeCount: 0,  // 页面 iframe 数量
    textLen: 0,      // 页面可见文本长度
    sample: '',      // 页面可见文本前 200 字（用于判断页面渲染方式）
    isLoginPage: /accounts\.feishu\.cn|passport|\/login/i.test(location.href),
    note: ''
  };
  var saved = false;

  function probePage() {
    try {
      diag.canvasCount = document.querySelectorAll('canvas').length;
      diag.iframeCount = document.querySelectorAll('iframe').length;
      var txt = (document.body && document.body.innerText ? document.body.innerText : '').replace(/\s+/g, ' ').trim();
      diag.textLen = txt.length;
      diag.sample = txt.slice(0, 200);
    } catch (e) { }
  }

  function saveDiag() {
    probePage();
    try { chrome.storage.local.set({ feishu_diag: { ts: Date.now(), d: diag } }); } catch (e) { }
  }

  /* ---------- 类型扁平化 ---------- */
  function flat(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) {
      return v.map(function (x) {
        if (x === null || x === undefined) return '';
        if (typeof x === 'string') return x;
        if (typeof x === 'object') return x.text || x.name || x.value || x.title || x.link || '';
        return String(x);
      }).filter(function (s) { return s !== ''; }).join('、');
    }
    if (typeof v === 'object') return v.text || v.link || v.name || v.value || v.title || JSON.stringify(v);
    return String(v);
  }

  function flattenFields(f) {
    var o = {};
    Object.keys(f || {}).forEach(function (k) { o[k] = flat(f[k]); });
    return o;
  }

  /* ---------- 业务字段名识别 ---------- */
  var NAME_RE = /企业|公司|岗位|职位|招聘|单位|城市|地点|状态|截止|时间|链接|批次|公司名|company|position|job|title|city|status|deadline|link|salary|category/i;
  function looksLikeRow(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
    var keys = Object.keys(o);
    if (keys.length < 2) return false;
    var hit = keys.filter(function (k) { return NAME_RE.test(k); }).length;
    return hit >= 2 || (keys.length >= 3 && hit >= 1);
  }

  /* ---------- 从任意 JSON 中挖掘记录数组 ---------- */
  function extract(json) {
    if (!json || typeof json !== 'object') return null;
    var queue = [json], seen = 0, best = null;
    while (queue.length && seen < 6000) {
      var cur = queue.shift(); seen++;
      if (Array.isArray(cur)) {
        if (cur.length && typeof cur[0] === 'object' && !Array.isArray(cur[0])) {
          var sample = cur[0];
          var src = sample.fields || sample.record || sample;
          if (looksLikeRow(src)) {
            var rows = cur.map(function (it) { return flattenFields(it.fields || it.record || it); })
              .filter(function (r) { return Object.keys(r).filter(function (k) { return r[k] !== ''; }).length >= 2; });
            if (rows.length && (!best || rows.length > best.length)) best = rows;
          }
        }
        continue;
      }
      if (typeof cur === 'object') {
        for (var k in cur) {
          if (Object.prototype.hasOwnProperty.call(cur, k) && cur[k] && typeof cur[k] === 'object') queue.push(cur[k]);
        }
      }
    }
    return best;
  }

  function handle(text) {
    if (!text || text.length < 20 || (text[0] !== '{' && text[0] !== '[')) return;
    var json;
    try { json = JSON.parse(text); } catch (e) { return; }
    diag.xhrJson++;
    var rows = extract(json);
    if (!rows || !rows.length) { saveDiag(); return; }
    diag.matched++;
    var payload = { ts: Date.now(), url: location.href, rows: rows, via: 'api' };
    try {
      chrome.storage.local.set({ feishu_capture: payload });
      chrome.runtime.sendMessage({ type: 'feishu_captured', count: rows.length }).catch(function () { });
    } catch (e) { }
    saveDiag();
  }

  /* ---------- hook fetch / XHR / WebSocket ---------- */
  var of = window.fetch;
  if (of) {
    window.fetch = function () {
      var p = of.apply(this, arguments);
      try {
        p.then(function (res) {
          if (res && res.clone) res.clone().text().then(handle).catch(function () { });
          return res;
        }).catch(function () { });
      } catch (e) { }
      return p;
    };
  }

  var OX = window.XMLHttpRequest;
  if (OX) {
    var open = OX.prototype.open, send = OX.prototype.send;
    OX.prototype.open = function () { return open.apply(this, arguments); };
    OX.prototype.send = function () {
      this.addEventListener('load', function () {
        try { if (!this.responseType || this.responseType === 'text') handle(this.responseText); } catch (e) { }
      });
      return send.apply(this, arguments);
    };
  }

  var OWS = window.WebSocket;
  if (OWS) {
    try {
      window.WebSocket = function (a, b) {
        var ws = b ? new OWS(a, b) : new OWS(a);
        try {
          ws.addEventListener('message', function (ev) {
            diag.wsMsg++;
            try {
              var d = ev.data;
              if (typeof d === 'string') handle(d);
            } catch (e) { }
            saveDiag();
          });
        } catch (e) { }
        return ws;
      };
      window.WebSocket.prototype = OWS.prototype;
      window.WebSocket.CONNECTING = OWS.CONNECTING;
      window.WebSocket.OPEN = OWS.OPEN;
      window.WebSocket.CLOSING = OWS.CLOSING;
      window.WebSocket.CLOSED = OWS.CLOSED;
    } catch (e) { }
  }

  /* ---------- DOM 兜底：接口抓不到时，直接从页面读可见行 ---------- */
  function findScroller() {
    var best = null, diff = 0;
    document.querySelectorAll('div').forEach(function (d) {
      var dd = d.scrollHeight - d.clientHeight;
      if (dd > 120 && d.clientHeight > 200 && dd > diff) { best = d; diff = dd; }
    });
    return best || document.scrollingElement || document.body;
  }
  function getHeaders() {
    var sels = ['[role="columnheader"]', '[data-field-id]', 'th', '[class*="header-cell"]', '[class*="columnHeader"]'];
    for (var i = 0; i < sels.length; i++) {
      var els = Array.prototype.slice.call(document.querySelectorAll(sels[i]))
        .filter(function (e) { return e.offsetParent && e.innerText && e.innerText.trim(); });
      if (els.length >= 2) {
        var hs = els.map(function (e) { return e.innerText.trim().replace(/\s+/g, ' '); });
        if (new Set(hs).size >= 2) return hs;
      }
    }
    return null;
  }
  function getCells(rowEl) {
    var direct = Array.prototype.slice.call(rowEl.children)
      .map(function (c) { return (c.innerText || '').trim().replace(/\s+/g, ' '); })
      .filter(function (t) { return t !== ''; });
    if (direct.length >= 2) return direct;
    var out = [];
    (function walk(el) {
      var kids = Array.prototype.slice.call(el.children);
      if (!kids.length) { var t = (el.innerText || '').trim().replace(/\s+/g, ' '); if (t) out.push(t); return; }
      kids.forEach(walk);
    })(rowEl);
    return out;
  }
  function getRows() {
    var sels = ['[role="row"]', '[data-record-id]', '[data-row-id]', '[class*="record-row"]', '[class*="row-item"]', '[class*="grid-row"]'];
    for (var i = 0; i < sels.length; i++) {
      var els = Array.prototype.slice.call(document.querySelectorAll(sels[i]))
        .filter(function (e) { return e.offsetParent && (e.innerText || '').trim(); });
      var rows = els.map(getCells).filter(function (r) { return r.length >= 2; });
      if (rows.length) return rows;
    }
    return [];
  }

  /* ---------- 响应后台指令：立即做一次 DOM 采集 ---------- */
  try {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (msg && msg.type === 'collect_dom') {
        runDomCollect().then(function (rows) { sendResponse({ rows: rows || [] }); });
        return true;
      }
    });
  } catch (e) { }

  function runDomCollect() {
    return new Promise(function (resolve) {
      try {
        var sc = findScroller();
        var startTop = sc.scrollTop;
        var headers = getHeaders();
        var seen = {}, all = [], rounds = 0;
        var timer = setInterval(function () {
          getRows().forEach(function (r) {
            var key = r.join('||');
            if (!seen[key]) { seen[key] = 1; all.push(r); }
          });
          var before = sc.scrollTop;
          sc.scrollTop = sc.scrollTop + Math.max(300, sc.clientHeight - 80);
          rounds++;
          if (rounds > 60 || (sc.scrollTop === before && rounds > 3)) {
            clearInterval(timer);
            sc.scrollTop = startTop;
            diag.domRows = all.length;
            if (!all.length) diag.note = '当前页面未找到表格行（可能内容在 iframe 中或尚未渲染）';
            saveDiag();
            var cols = headers && headers.length ? headers : (all[0] || []).map(function (_, i) { return '列' + (i + 1); });
            resolve(all.map(function (r) {
              var o = {};
              cols.forEach(function (c, i) { o[c] = r[i] || ''; });
              return o;
            }).filter(function (o) { return Object.keys(o).filter(function (k) { return o[k]; }).length >= 2; }));
          }
        }, 220);
      } catch (e) { diag.note = 'DOM 采集异常：' + e.message; saveDiag(); resolve([]); }
    });
  }

  setTimeout(function () {
    if (saved) return;
    runDomCollect().then(function (rows) {
      if (rows && rows.length) {
        chrome.storage.local.set({ feishu_capture: { ts: Date.now(), url: location.href, rows: rows, via: 'dom' } });
        chrome.runtime.sendMessage({ type: 'feishu_captured', count: rows.length }).catch(function () { });
      }
    });
  }, 10000);

  setTimeout(saveDiag, 3000);
  setInterval(saveDiag, 15000);
})();
