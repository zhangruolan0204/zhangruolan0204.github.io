const $ = (id) => document.getElementById(id);

function fmt(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function refresh() {
  chrome.storage.local.get(['sync_state', 'feishu_capture', 'feishu_diag'], (res) => {
    const s = res.sync_state || {};
    const cap = res.feishu_capture;
    const dg = res.feishu_diag;
    let html =
      '最近抓取：<b>' + fmt(s.lastOk) + '</b><br>' +
      '记录条数：<b>' + (cap && cap.rows ? cap.rows.length : 0) + '</b>' + (cap && cap.via ? '（' + (cap.via === 'dom' ? '页面读取' : '接口拦截') + '）' : '') + '<br>' +
      '状态：' + (s.msg || '等待首次同步');
    if (dg && dg.d) {
      html += '<hr style="border:none;border-top:1px solid #E9E5DC;margin:8px 0">' +
        '<span style="color:#8A9A96">诊断 ' + fmt(dg.ts) + '</span><br>' +
        '页面：' + (dg.d.isLoginPage ? '<b style="color:#E4725F">登录页（未登录态）</b>' : '表格页') + '<br>' +
        'JSON 响应 ' + dg.d.xhrJson + ' 个 / 命中 ' + dg.d.matched + '<br>' +
        'WS 消息 ' + dg.d.wsMsg + ' / DOM 行 ' + dg.d.domRows + '<br>' +
        'canvas ' + (dg.d.canvasCount || 0) + ' 个 / iframe ' + (dg.d.iframeCount || 0) + ' 个 / 文本 ' + (dg.d.textLen || 0) + ' 字' +
        (dg.d.sample ? '<br><span style="color:#8A9A96">页面文本：' + String(dg.d.sample).slice(0, 120) + '…</span>' : '') +
        (dg.d.note ? '<br>' + dg.d.note : '');
    }
    $('state').innerHTML = html;
  });
}

$('sync').addEventListener('click', () => {
  $('state').textContent = '正在抓取（后台 25s，失败会自动前台重试 30s，共约 1 分钟）…';
  chrome.runtime.sendMessage({ type: 'sync_now' }, () => {
    setTimeout(refresh, 4000);
    setTimeout(refresh, 30000);
    setTimeout(refresh, 65000);
  });
});

$('push').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'push_now' }, (r) => {
    $('state').innerHTML = r && r.ok ? ('已应用到工作台：' + r.count + ' 条') : ('未应用：' + ((r && r.msg) || '请先打开工作台页面'));
    setTimeout(refresh, 2500);
  });
});

$('copy').addEventListener('click', () => {
  chrome.storage.local.get(['sync_state', 'feishu_diag'], (res) => {
    const txt = JSON.stringify({ state: res.sync_state || {}, diag: res.feishu_diag || {} }, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    $('state').innerHTML += '<br><span style="color:#3FA79C">诊断信息已复制，可发给开发者定位</span>';
  });
});

refresh();
