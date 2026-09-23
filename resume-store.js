/* =======================================================
   resume-store.js · 简历 PDF 本机存储（IndexedDB）
   - 文件以 Blob 存在浏览器 IndexedDB，不上传任何服务器
   - localStorage 只存文件名 / 大小 / 时间等元数据，避免撑爆
   ======================================================= */
(function (global) {
  'use strict';

  var DB = 'qz2027_files', STORE = 'resumes', VER = 1;

  function open() {
    return new Promise(function (res, rej) {
      try {
        if (!global.indexedDB) { rej(new Error('浏览器不支持 IndexedDB')); return; }
        var req = global.indexedDB.open(DB, VER);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
        };
        req.onsuccess = function () { res(req.result); };
        req.onerror = function () { rej(req.error || new Error('打开本地文件库失败')); };
        req.onblocked = function () { rej(new Error('本地文件库被占用，请关掉其他标签页再试')); };
      } catch (e) { rej(e); }
    });
  }

  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t, req;
        try {
          t = db.transaction(STORE, mode);
          req = fn(t.objectStore(STORE));
        } catch (e) { rej(e); return; }
        t.oncomplete = function () {
          try { res(req && req.result !== undefined ? req.result : undefined); }
          catch (e) { res(undefined); }
        };
        t.onerror = function () { rej(t.error || new Error('读写失败')); };
        t.onabort = function () { rej(t.error || new Error('读写被中止')); };
      });
    });
  }

  global.ResumeStore = {
    /** 存一份 PDF（同一 id 覆盖） */
    put: function (id, blob, meta) {
      meta = meta || {};
      return tx('readwrite', function (s) {
        return s.put({
          id: String(id),
          blob: blob,
          name: meta.name || '',
          size: meta.size || 0,
          at: meta.at || ''
        });
      });
    },
    /** 取一份（返回 {id, blob, name, size, at}） */
    get: function (id) { return tx('readonly', function (s) { return s.get(String(id)); }); },
    /** 删一份 */
    del: function (id) { return tx('readwrite', function (s) { return s.delete(String(id)); }); },
    /** 全部 id */
    keys: function () { return tx('readonly', function (s) { return s.getAllKeys(); }); },
    available: function () { return !!global.indexedDB; }
  };
})(window);
