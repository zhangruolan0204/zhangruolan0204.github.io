/* 后台服务：定时/手动触发抓取 → 写入工作台（localStorage 桥接） */
const SOURCE_URL = 'https://yal2at57cvq.feishu.cn/base/GtSLbyyR3aCENOsJYC6cdlsVnih?table=tblH4au5rnBcqHgJ&view=vew8PFC7nG';
const WORK_HOST = '*.workbuddy.host/*';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('feishu-sync', { periodInMinutes: 30 });
  chrome.storage.local.set({ sync_state: { lastTry: 0, lastOk: 0, msg: '已安装，等待首次同步' } });
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'feishu-sync') runSync();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'feishu_captured') {
    chrome.storage.local.set({ sync_state: { lastOk: Date.now(), msg: '已抓取 ' + msg.count + ' 条记录' } });
    pushToWorkbench();
  }
  if (msg && msg.type === 'sync_now') { runSync().then(r => sendResponse(r)).catch(() => sendResponse({ ok: false })); return true; }
  if (msg && msg.type === 'push_now') { pushToWorkbench().then(r => sendResponse(r)); return true; }
});

function saveCapture(rows, via) {
  const payload = { ts: Date.now(), url: SOURCE_URL, rows: rows, via: via || 'dom' };
  return new Promise((resolve) => {
    chrome.storage.local.set({ feishu_capture: payload }, () => {
      chrome.storage.local.set({
        sync_state: { lastTry: Date.now(), lastOk: Date.now(), msg: '已抓取 ' + rows.length + ' 条记录（' + (via === 'dom' ? '页面读取' : '接口拦截') + '）' }
      }, () => { pushToWorkbench(); resolve(payload); });
    });
  });
}

function markFail(note) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['feishu_diag'], (res) => {
      const d = res.feishu_diag ? res.feishu_diag.d : null;
      const extra = d ? ('诊断：JSON ' + d.xhrJson + ' / 命中 ' + d.matched + ' / WS ' + d.wsMsg + ' / DOM 行 ' + d.domRows + (d.note ? ' / ' + d.note : '')) : '';
      chrome.storage.local.set({
        sync_state: { lastTry: Date.now(), lastOk: 0, msg: '未抓到数据。' + (note || extra) }
      }, () => resolve());
    });
  });
}

/* 页面内执行：滚动采集可见表格行（自包含，不依赖任何外部变量） */
async function collectDomRowsInPage() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function findScroller() {
    let best = null, diff = 0;
    document.querySelectorAll('div').forEach((d) => {
      const dd = d.scrollHeight - d.clientHeight;
      if (dd > 120 && d.clientHeight > 200 && dd > diff) { best = d; diff = dd; }
    });
    return best || document.scrollingElement || document.body;
  }
  function getHeaders() {
    const sels = ['[role="columnheader"]', '[data-field-id]', 'th', '[class*="header-cell"]', '[class*="columnHeader"]'];
    for (const s of sels) {
      const els = Array.from(document.querySelectorAll(s)).filter((e) => e.offsetParent && e.innerText && e.innerText.trim());
      if (els.length >= 2) {
        const hs = els.map((e) => e.innerText.trim().replace(/\s+/g, ' '));
        if (new Set(hs).size >= 2) return hs;
      }
    }
    return null;
  }
  function getCells(rowEl) {
    const direct = Array.from(rowEl.children)
      .map((c) => (c.innerText || '').trim().replace(/\s+/g, ' '))
      .filter((t) => t !== '');
    if (direct.length >= 2) return direct;
    const out = [];
    (function walk(el) {
      const kids = Array.from(el.children);
      if (!kids.length) { const t = (el.innerText || '').trim().replace(/\s+/g, ' '); if (t) out.push(t); return; }
      kids.forEach(walk);
    })(rowEl);
    return out;
  }
  function getRows() {
    const sels = ['[role="row"]', '[data-record-id]', '[data-row-id]', '[class*="record-row"]', '[class*="row-item"]', '[class*="grid-row"]'];
    for (const s of sels) {
      const els = Array.from(document.querySelectorAll(s)).filter((e) => e.offsetParent && (e.innerText || '').trim());
      const rows = els.map(getCells).filter((r) => r.length >= 2);
      if (rows.length) return rows;
    }
    return [];
  }

  const sc = findScroller();
  const startTop = sc.scrollTop;
  const headers = getHeaders();
  const seen = new Set();
  const all = [];
  for (let i = 0; i < 60; i++) {
    getRows().forEach((r) => {
      const k = r.join('||');
      if (!seen.has(k)) { seen.add(k); all.push(r); }
    });
    const before = sc.scrollTop;
    sc.scrollTop = sc.scrollTop + Math.max(300, sc.clientHeight - 80);
    await sleep(220);
    if (sc.scrollTop === before && i > 3) break;
  }
  sc.scrollTop = startTop;
  if (!all.length) return [];
  const cols = headers && headers.length ? headers : all[0].map((_, i) => '列' + (i + 1));
  return all.map((r) => {
    const o = {};
    cols.forEach((c, i) => { o[c] = r[i] || ''; });
    return o;
  }).filter((o) => Object.keys(o).filter((k) => o[k]).length >= 2);
}

/* 优先：直接在已打开的表格页取数（页面已加载完，成功率最高；含 iframe） */
async function tryCollectFromOpenTab() {
  const tabs = await chrome.tabs.query({});
  const t = tabs.find((x) => x.url && /feishu\.cn\/base\//.test(x.url));
  if (!t) return null;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: t.id, allFrames: true },
      func: collectDomRowsInPage
    });
    let best = [];
    (results || []).forEach((r) => {
      if (r && r.result && r.result.length > best.length) best = r.result;
    });
    return best.length ? { rows: best, via: 'dom' } : null;
  } catch (e) {
    return null;
  }
}

/* 兜底：新开标签加载表格页，等待 content script 抓取 */
function openAndCapture(active) {
  return new Promise((resolve) => {
    const startTs = Date.now();
    chrome.tabs.query({ active: true, currentWindow: true }, (cur) => {
      const backId = cur && cur[0] ? cur[0].id : null;
      chrome.tabs.create({ url: SOURCE_URL, active: !!active }, (tab) => {
        const tabId = tab.id;
        const timer = setInterval(() => {
          chrome.storage.local.get(['feishu_capture'], (res) => {
            const cap = res.feishu_capture;
            const fresh = cap && cap.ts >= startTs - 1000;
            const timeout = Date.now() - startTs > (active ? 45000 : 40000);
            if (!fresh && !timeout) return;
            clearInterval(timer);
            chrome.tabs.remove(tabId).catch(() => { });
            if (backId && active) chrome.tabs.update(backId, { active: true }).catch(() => { });
            if (fresh) { saveCapture(cap.rows, cap.via); resolve({ ok: true, count: cap.rows.length, via: cap.via }); }
            else { markFail().then(() => resolve({ ok: false, count: 0 })); }
          });
        }, 2000);
      });
    });
  });
}

/* 主流程：已打开表格页 → 后台新开 → 前台新开 */
async function runSync() {
  const direct = await tryCollectFromOpenTab();
  if (direct) {
    await saveCapture(direct.rows, direct.via);
    return { ok: true, count: direct.rows.length, via: direct.via };
  }
  const r1 = await openAndCapture(false);
  if (r1.ok) return r1;
  return await openAndCapture(true);
}

/* 把抓取到的记录注入到已打开的秋招工作台页面 */
async function pushToWorkbench() {
  const res = await chrome.storage.local.get(['feishu_capture']);
  const cap = res.feishu_capture;
  if (!cap || !cap.rows || !cap.rows.length) return { ok: false, msg: '暂无抓取数据' };
  const tabs = await chrome.tabs.query({ url: ['https://' + WORK_HOST] });
  if (!tabs.length) {
    await chrome.storage.local.set({ pending_push: cap });
    return { ok: false, msg: '工作台页面未打开，数据已暂存，打开工作台后自动应用' };
  }
  for (const t of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: t.id },
        func: (rows, ts) => {
          if (typeof window.QZ !== 'undefined' && window.QZ.applyBridgeRows) {
            const r = window.QZ.applyBridgeRows(rows, { ts: ts, from: '浏览器扩展桥接' });
            window.__QZ_BRIDGE_TS = ts;
            return r;
          }
          return null;
        },
        args: [cap.rows, cap.ts]
      });
    } catch (e) { /* 忽略单个标签失败 */ }
  }
  await chrome.storage.local.remove('pending_push');
  return { ok: true, count: cap.rows.length };
}

/* 工作台页面打开时，补推一次暂存的抓取数据 */
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === 'complete' && tab.url && tab.url.indexOf('workbuddy.host') >= 0) {
    chrome.storage.local.get(['pending_push', 'feishu_capture'], (res) => {
      const cap = res.pending_push || res.feishu_capture;
      if (!cap) return;
      setTimeout(() => pushToWorkbench(), 1500);
    });
  }
});
