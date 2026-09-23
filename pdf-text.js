/* =======================================================
   pdf-text.js · PDF 文字提取（按需加载 pdf.js，纯本机解析）
   - 只在用户点「提取文字」时才下载 vendor/pdf.min.js（约 320KB）
   - 全程在本机浏览器内解析，PDF 不上传任何服务器
   ======================================================= */
(function (global) {
  'use strict';

  var SRC = 'vendor/pdf.min.js?v=42';
  var WORKER = 'vendor/pdf.worker.min.js?v=42';
  var loading = null;

  function load() {
    if (global.pdfjsLib) return Promise.resolve(global.pdfjsLib);
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      try {
        var s = document.createElement('script');
        s.src = SRC;
        s.onload = function () {
          try {
            var lib = global.pdfjsLib;
            if (!lib || !lib.getDocument) throw new Error('pdf.js 初始化异常');
            lib.GlobalWorkerOptions.workerSrc = WORKER;
            res(lib);
          } catch (e) { loading = null; rej(e); }
        };
        s.onerror = function () { loading = null; rej(new Error('pdf.js 下载失败，请检查网络后重试')); };
        document.head.appendChild(s);
      } catch (e) { loading = null; rej(e); }
    });
    return loading;
  }

  function toBuf(blob) {
    if (blob && blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = function () { rej(new Error('文件读取失败')); };
      fr.readAsArrayBuffer(blob);
    });
  }

  /** 把一页的 text items 按 y 坐标拼成行 */
  function itemsToLines(items) {
    var lines = [], line = '', lastY = null, lastX = null;
    (items || []).forEach(function (it) {
      var tr = it.transform || [];
      var y = tr[5], x = tr[4];
      var s = String(it.str == null ? '' : it.str);
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 2) {
        lines.push(line); line = ''; lastX = null;
      } else if (lastX !== null && x !== undefined && x - lastX > 14 && line) {
        /* 同一行但横向间隔大（表格/多栏）→ 补两个空格，避免词语粘连 */
        line += '  ';
      }
      line += s;
      lastY = y; lastX = x;
    });
    if (line) lines.push(line);
    return lines;
  }

  /** 提取全文：返回 { text, pages } */
  function extract(blob) {
    return load().then(function () {
      return toBuf(blob);
    }).then(function (buf) {
      var lib = global.pdfjsLib;
      var task = lib.getDocument({ data: buf.slice(0) });
      return task.promise.then(function (doc) {
        var n = doc.numPages;
        var chain = Promise.resolve([]);
        for (var p = 1; p <= n; p++) {
          (function (pageNo) {
            chain = chain.then(function (arr) {
              return doc.getPage(pageNo).then(function (page) {
                return page.getTextContent().then(function (tc) {
                  return arr.concat(itemsToLines(tc.items));
                });
              });
            });
          })(p);
        }
        return chain.then(function (lines) {
          try { doc.destroy(); } catch (e) { }
          var text = lines.join('\n')
            .replace(/[ \t\u00a0]{2,}/g, '  ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          return { text: text, pages: n };
        });
      }).catch(function (e) {
        try { if (task && task.destroy) task.destroy(); } catch (e2) { }
        throw e;
      });
    });
  }

  global.QzPdfText = {
    load: load,
    extract: extract,
    ready: function () { return !!global.pdfjsLib; }
  };
})(window);
