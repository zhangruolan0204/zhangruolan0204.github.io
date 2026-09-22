/* =====================================================================
   飞书多维表格 → CSV 采集脚本（复制/导出被禁用时的取数办法）
   ---------------------------------------------------------------------
   使用场景：表格设置了「禁止复制 / 禁止导出 / 禁止下载」，但你在浏览器里
   能正常看到数据。数据既然显示在页面上，就一定存在于页面 DOM 中，
   本脚本直接读取页面结构并导出为 CSV。

   使用方法：
   1. 在本机浏览器打开飞书多维表格页面（登录态正常、数据可见）
   2. 按 F12 打开开发者工具 → 切到 Console（控制台）
   3. 把本文件全部内容粘贴进去 → 回车
   4. 脚本会自动滚动加载全部行（虚拟滚动），完成后自动下载 feishu_table.csv
   5. 回到工作台 → 设置中心 → 「导入 CSV 文件」选中该文件即可

   说明：脚本只读取你本机页面上的内容，不上传任何数据到网络。
   ===================================================================== */
(async function () {
  'use strict';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* 1. 找到可滚动容器（多维表格通常是虚拟滚动） */
  function findScroller() {
    let best = null, bestDiff = 0;
    document.querySelectorAll('div').forEach((d) => {
      const diff = d.scrollHeight - d.clientHeight;
      if (diff > 120 && d.clientHeight > 200 && diff > bestDiff) { best = d; bestDiff = diff; }
    });
    return best || document.scrollingElement || document.body;
  }

  /* 2. 提取表头 */
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

  /* 3. 提取一行的单元格文本 */
  function getCells(rowEl) {
    const direct = Array.from(rowEl.children)
      .map((c) => (c.innerText || '').trim().replace(/\s+/g, ' '))
      .filter((t) => t !== '');
    if (direct.length >= 2) return direct;
    const out = [];
    const walk = (el) => {
      const kids = Array.from(el.children);
      if (!kids.length) { const t = (el.innerText || '').trim().replace(/\s+/g, ' '); if (t) out.push(t); return; }
      kids.forEach(walk);
    };
    walk(rowEl);
    return out;
  }

  /* 4. 提取当前视口内的所有行 */
  function getRows() {
    const sels = ['[role="row"]', '[data-record-id]', '[data-row-id]', '[class*="record-row"]', '[class*="row-item"]'];
    for (const s of sels) {
      const els = Array.from(document.querySelectorAll(s)).filter((e) => e.offsetParent && (e.innerText || '').trim());
      const rows = els.map(getCells).filter((r) => r.length >= 2);
      if (rows.length) return rows;
    }
    return [];
  }

  const headers = getHeaders();
  const scroller = findScroller();
  const seen = new Set();
  const all = [];

  console.log('[采集] 表头：', headers ? headers.join(' | ') : '未自动识别（将使用通用列名）');

  /* 5. 自动滚动加载全部行 */
  const maxRounds = 120;
  for (let i = 0; i < maxRounds; i++) {
    const rows = getRows();
    rows.forEach((r) => {
      const key = r.join('');
      if (!seen.has(key)) { seen.add(key); all.push(r); }
    });
    const before = scroller.scrollTop;
    scroller.scrollTop = scroller.scrollTop + Math.max(300, scroller.clientHeight - 80);
    await sleep(260);
    if (scroller.scrollTop === before) break; // 已到底
  }

  console.log('[采集] 共采集到行数：', all.length);
  if (!all.length) {
    console.warn('[采集] 未识别到表格行结构。请把控制台这段提示截图反馈，或改用「打印为 PDF」后交由解析。');
    return;
  }

  /* 6. 组装 CSV 并下载 */
  const cols = headers && headers.length ? headers : all[0].map((_, i) => '列' + (i + 1));
  const esc = (s) => '"' + String(s === undefined ? '' : s).replace(/"/g, '""') + '"';
  const csv = [cols.map(esc).join(',')].concat(all.map((r) => r.map(esc).join(','))).join('\r\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'feishu_table.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  console.log('[采集] 已生成下载：feishu_table.csv（如浏览器拦截下载请允许）');
})();
