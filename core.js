/* =======================================================
   core.js · 框架内核：登录 / 权限 / 路由 / 存储 / 通用组件
   ======================================================= */
(function (global) {
  'use strict';

  var D = global.QZ_DATA;
  var KEY = 'qz2027_workbench_v3';
  var SESSION = 'qz2027_session_v3';
  var ICON_MODE_KEY = 'qz_icon_mode';
  /* 启动时立刻应用图标模式，避免登录页图标也去发 404 请求 */
  try { if (D && D.setIconMode) D.setIconMode(localStorage.getItem(ICON_MODE_KEY) === 'img' ? 'img' : 'svg'); } catch (e) { }

  var QZ = {
    data: null,
    user: null,
    page: 'dashboard',
    filters: {},
    collections: {},   // 由 pages.js 注册
    pages: []          // 由 pages.js 注册
  };

  /* ---------------- 工具 ---------------- */
  QZ.esc = function (s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  QZ.shin = function (n, s) { return D.shinIcon(n, s); };
  QZ.tiny = function (n, s, c) { return D.tinyIcon(n, s, c); };
  /* 图标模式：默认纯 SVG（零图片请求）。用户放好自定义 PNG 后可在设置中心切换成 img */
  QZ.iconMode = function (m) {
    try {
      if (m === undefined || m === null) {
        return localStorage.getItem(ICON_MODE_KEY) === 'img' ? 'img' : 'svg';
      }
      var v = (m === 'img') ? 'img' : 'svg';
      localStorage.setItem(ICON_MODE_KEY, v);
      if (D && D.setIconMode) D.setIconMode(v);
      return v;
    } catch (e) { return 'svg'; }
  };
  QZ.uid = function () { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  QZ.today = function () {
    var d = new Date(), p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  QZ.daysLeft = function (str) {
    if (!str) return null;
    var s = String(str).slice(0, 16).replace(' ', 'T');
    var t = new Date(s.replace(/-/g, '/'));
    if (isNaN(t)) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  };
  QZ.ddl = function (str) {
    var n = QZ.daysLeft(str);
    if (n === null) return '';
    if (n < 0) return '<span class="chip gray">已过 ' + (-n) + ' 天</span>';
    if (n === 0) return '<span class="chip red">今天</span>';
    if (n <= 3) return '<span class="chip red">' + n + ' 天后</span>';
    if (n <= 7) return '<span class="chip yellow">' + n + ' 天后</span>';
    return '<span class="chip">' + n + ' 天后</span>';
  };
  QZ.toast = function (msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove('show'); }, 2400);
  };

  /* ---------------- 存储 ---------------- */
  QZ.load = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { QZ.data = JSON.parse(raw); QZ.ensureSync(); return; }
    } catch (e) { }
    QZ.data = JSON.parse(JSON.stringify(D.seed));
    QZ.ensureSync();
    QZ.save();
  };
  QZ.save = function () {
    QZ.data.updatedAt = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5);
    try { localStorage.setItem(KEY, JSON.stringify(QZ.data)); } catch (e) { QZ.toast('本地存储写入失败'); }
  };
  QZ.resetData = function () {
    QZ.data = JSON.parse(JSON.stringify(D.seed));
    QZ.save();
  };

  /* ---------------- 权限 ---------------- */
  QZ.canEdit = function () { return QZ.user && QZ.user.role === 'admin'; };
  QZ.canManage = function () { return QZ.user && QZ.user.role === 'admin'; };

  /* ---------------- 卡片组件（统一规范） ---------------- */
  QZ.card = function (opt) {
    return '<section class="card' + (opt.cls ? ' ' + opt.cls : '') + '">' +
      '<div class="card-head">' +
      '<div class="card-icon">' + QZ.shin(opt.icon || 'doc', 42) + '</div>' +
      '<div class="card-titles"><h3 class="card-title">' + opt.title + '</h3>' +
      (opt.desc ? '<p class="card-desc">' + opt.desc + '</p>' : '') + '</div>' +
      (opt.tools ? '<div class="card-tools">' + opt.tools + '</div>' : '') +
      '</div><div class="card-body">' + (opt.body || '') + '</div></section>';
  };
  QZ.statCard = function (value, label, sub, icon) {
    return '<section class="card stat-card">' +
      '<div class="card-head" style="gap:10px">' +
      '<div class="card-icon" style="flex:0 0 38px">' + QZ.shin(icon || 'chart', 38) + '</div>' +
      '<div class="card-titles"><div class="stat-value">' + value + '</div>' +
      '<div class="stat-label">' + label + '</div></div></div>' +
      (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</section>';
  };
  QZ.table = function (cols, rows) {
    if (!rows.length) return '<div class="empty">暂无数据，点击右上角「新增」添加第一条记录</div>';
    return '<div class="table-wrap"><table><thead><tr>' +
      cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  };
  QZ.empty = function (t) { return '<div class="empty">' + t + '</div>'; };

  /* ---------------- 模态框 ---------------- */
  function closeModal() {
    var r = document.getElementById('modalRoot'); r.innerHTML = '';
  }
  QZ.closeModal = closeModal;

  QZ.modal = function (opt) {
    var bodyHtml = opt.html || '';
    if (opt.fields) {
      bodyHtml += '<div class="modal-grid">' + opt.fields.map(function (f) {
        var v = (opt.values && opt.values[f.key] !== undefined) ? opt.values[f.key] : (f.def || '');
        var cls = f.type === 'textarea' || f.full ? 'full' : '';
        var input;
        if (f.type === 'textarea') {
          input = '<textarea class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8;min-height:78px" data-k="' + f.key + '">' + QZ.esc(v) + '</textarea>';
        } else if (f.type === 'select') {
          input = '<select class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8" data-k="' + f.key + '">' +
            f.options.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + QZ.esc(o) + '</option>'; }).join('') + '</select>';
        } else {
          input = '<input class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8" type="' + (f.type || 'text') + '" data-k="' + f.key + '" value="' + QZ.esc(v) + '" placeholder="' + QZ.esc(f.ph || '') + '">';
        }
        return '<div class="' + cls + '" style="margin-bottom:8px"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">' + f.label + '</div>' + input + '</div>';
      }).join('') + '</div>';
    }
    var wrap = document.createElement('div');
    wrap.className = 'modal-mask';
    wrap.innerHTML = '<div class="modal"><h3>' + opt.title + '</h3>' +
      (opt.desc ? '<p class="modal-desc">' + opt.desc + '</p>' : '') +
      bodyHtml +
      '<div class="modal-foot">' +
      '<button class="btn btn-ghost" data-x="c">' + (opt.cancelText || '取消') + '</button>' +
      (opt.onSubmit ? '<button class="btn btn-primary" data-x="s">' + (opt.okText || '保存') + '</button>' : '') +
      '</div></div>';
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) closeModal();
      if (e.target.dataset.x === 'c') closeModal();
      if (e.target.dataset.x === 's') {
        var vals = {};
        wrap.querySelectorAll('[data-k]').forEach(function (n) { vals[n.dataset.k] = n.value; });
        if (opt.onSubmit(vals) !== false) closeModal();
      }
      if (e.target.dataset.actx) { opt.onExtra && opt.onExtra(e.target.dataset.actx, wrap); }
    });
    document.getElementById('modalRoot').innerHTML = '';
    document.getElementById('modalRoot').appendChild(wrap);
    return wrap;
  };

  QZ.confirm = function (msg, onOk) {
    QZ.modal({
      title: '确认操作', desc: msg,
      html: '<div class="note">该操作仅影响本机浏览器中的数据，可随时通过设置中心重置为初始样例数据。</div>',
      okText: '确认', onSubmit: function () { onOk(); }
    });
  };

  /* ---------------- 通用增删改 ---------------- */
  QZ.openCreate = function (ckey) {
    if (!QZ.canEdit()) { QZ.toast('当前为只读账号，无法新增'); return; }
    var c = QZ.collections[ckey];
    QZ.modal({
      title: '新增 · ' + c.name, desc: c.tip || '填写后保存到本机，可随时编辑',
      fields: c.fields, values: (c.defaults ? (c.expand ? c.expand(c.defaults()) : c.defaults()) : {}),
      onSubmit: function (v) {
        var item = c.build ? c.build(v) : v;
        item.id = QZ.uid();
        QZ.data[c.key].unshift(item);
        QZ.save(); QZ.render(); QZ.toast('已新增');
      }
    });
  };
  QZ.openEdit = function (ckey, id) {
    if (!QZ.canEdit()) { QZ.toast('当前为只读账号，无法编辑'); return; }
    var c = QZ.collections[ckey];
    var item = QZ.data[c.key].filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    QZ.modal({
      title: '编辑 · ' + c.name, desc: '修改后点击保存生效',
      fields: c.fields, values: c.expand ? c.expand(item) : item,
      onSubmit: function (v) {
        var idx = QZ.data[c.key].indexOf(item);
        var next = c.build ? c.build(v) : v;
        Object.keys(next).forEach(function (k) { item[k] = next[k]; });
        QZ.data[c.key][idx] = item;
        QZ.save(); QZ.render(); QZ.toast('已保存');
      }
    });
  };
  QZ.remove = function (ckey, id) {
    if (!QZ.canEdit()) { QZ.toast('当前为只读账号，无法删除'); return; }
    var c = QZ.collections[ckey];
    QZ.confirm('确定删除这条「' + c.name + '」记录吗？', function () {
      QZ.data[c.key] = QZ.data[c.key].filter(function (x) { return x.id !== id; });
      QZ.save(); QZ.render(); QZ.toast('已删除');
    });
  };
  QZ.toggle = function (ckey, id, field) {
    var item = QZ.data[ckey].filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    item[field] = !item[field];
    QZ.save(); QZ.render();
  };

  /* ---------------- 路由与渲染 ---------------- */
  QZ.go = function (id, fromHash) {
    if (!id) return;
    QZ.page = id;
    /* 同步 URL hash，让地址栏反映当前模块（也支持刷新/分享直连） */
    if (!fromHash) {
      try { if (location.hash !== '#/' + id) location.hash = '#/' + id; } catch (e) { }
    }
    try {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').style.display = 'none';
    } catch (e) { }
    QZ.render();
    try { window.scrollTo(0, 0); } catch (e) { }
  };

  /* 保险①：URL hash 变化即切换 —— 锚点跳转是浏览器原生行为，不依赖任何 JS 事件绑定 */
  function syncFromHash() {
    try {
      var h = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
      if (!h || !QZ.user || h === QZ.page) return;
      for (var i = 0; i < QZ.pages.length; i++) {
        if (QZ.pages[i].id === h) { QZ.go(h, true); return; }
      }
    } catch (e) { }
  }
  window.addEventListener('hashchange', syncFromHash);
  QZ.syncFromHash = syncFromHash;

  /* 底部细提示条：显示实际运行的版本与模块数，出错时整条变红 */
  QZ.VERSION = 'v38';
  QZ.hideVerbar = function () {
    try { localStorage.setItem('qz_verbar_hide', QZ.VERSION); } catch (e) { }
    var b = document.getElementById('verbar');
    if (b) b.style.display = 'none';
    return false;
  };
  function paintDiag(txt, bad) {
    var line = QZ.VERSION + ' · ' + QZ.page + (txt ? ' · ' + txt : '');
    try {
      var vb = document.getElementById('verbarTxt');
      if (vb) vb.textContent = bad ? (QZ.VERSION + ' · 错误：' + txt) : line;
      var bar = document.getElementById('verbar');
      if (bar) {
        if (bad) {
          bar.className = 'verbar bad';
          bar.style.display = 'flex';
        } else {
          bar.className = 'verbar';
          var hidden = false;
          try { hidden = localStorage.getItem('qz_verbar_hide') === QZ.VERSION; } catch (e) { }
          bar.style.display = hidden ? 'none' : 'flex';
        }
      }
    } catch (e) { }
    try {
      var d = document.getElementById('diag');
      if (!d) return;
      if (bad) { QZ.__bad = 1; d.className = 'diag-pill bad'; d.textContent = txt; d.style.display = 'block'; return; }
      if (QZ.__bad) return;
      d.className = 'diag-pill';
      d.textContent = line;
      d.style.display = 'block';
    } catch (e) { }
  }
  QZ.paintDiag = paintDiag;

  /* 一键清缓存重载：清 CacheStorage + 注销全部 SW + 带时间戳重载（保留本地数据） */
  QZ.hardReset = function () {
    function go() {
      try { location.replace(location.pathname + '?hr=' + Date.now()); }
      catch (e) { location.reload(); }
    }
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () { });
      }
      if (window.caches && caches.keys) {
        caches.keys().then(function (ks) {
          return Promise.all(ks.map(function (k) { return caches.delete(k); }));
        }).then(go, go);
      } else { go(); }
    } catch (e) { go(); }
    return false;
  };

  /* 菜单点击入口（内联 onclick 走这条），打标记避免与事件委托重复渲染一次 */
  QZ.navGo = function (e, id) {
    if (e && e.__qzNav) return false;   // 捕获阶段已处理，避免重复渲染
    if (e) {
      if (e.preventDefault) { try { e.preventDefault(); } catch (err) { } }
      e.__qzNav = 1;
    }
    QZ.go(id);
    return false;
  };

  QZ.render = function () {
    if (!QZ.user) return;
    try { renderInner(); }
    catch (err) { paintDiag('渲染崩溃：' + String((err && err.message) || err), true); }
  };

  function renderInner() {
    var nav = document.getElementById('nav');
    /* 菜单只构建一次，之后仅切换高亮 / 更新角标。
       关键：不再每次渲染都重建 innerHTML —— 否则「正在点击的按钮被替换掉」会导致 click 事件丢失 */
    if (nav.getAttribute('data-built') !== String(QZ.pages.length)) {
      nav.innerHTML = QZ.pages.map(function (p) {
        /* 四重保险：①锚点 href ②内联 onclick ③document 捕获监听 ④#nav 事件委托 */
        return '<a class="nav-item" href="#/' + p.id + '" data-page="' + p.id + '" onclick="return QZ.navGo(event,\'' + p.id + '\')">' +
          QZ.shin(p.icon, 34) +
          '<span class="nav-text"><strong>' + p.name + '</strong><span>' + p.sub + '</span></span>' +
          '<span class="nav-badge" style="display:none"></span></a>';
      }).join('');
      nav.setAttribute('data-built', String(QZ.pages.length));
    }
    var items = nav.querySelectorAll('.nav-item');
    for (var ai = 0; ai < items.length; ai++) {
      var it = items[ai];
      var pid = it.getAttribute('data-page');
      if (pid === QZ.page) it.classList.add('active'); else it.classList.remove('active');
      var def = null;
      for (var di = 0; di < QZ.pages.length; di++) { if (QZ.pages[di].id === pid) { def = QZ.pages[di]; break; } }
      var txt = '';
      if (def && def.badge) { try { txt = String(def.badge() || ''); } catch (e2) { txt = ''; } }
      var bd = it.querySelector ? it.querySelector('.nav-badge') : null;
      if (bd) { bd.textContent = txt; bd.style.display = txt ? '' : 'none'; }
    }

    var u = QZ.user;    if (!QZ.page && QZ.pages[0]) QZ.page = QZ.pages[0].id;   // 首次进入默认高亮第一个模块
    var p = QZ.pages.filter(function (x) { return x.id === QZ.page; })[0] || QZ.pages[0];
    document.getElementById('pageTitle').textContent = p.name;
    document.getElementById('pageDesc').textContent = p.sub;
    try {
      document.getElementById('content').innerHTML = p.render();
    } catch (err) {
      document.getElementById('content').innerHTML =
        '<div class="card"><h3>该模块渲染出错</h3><p>' +
        QZ.esc(String((err && err.message) || err)) + '</p></div>';
      paintDiag('渲染错误：' + String((err && err.message) || err), true);
    }

    var u = QZ.user;
    document.getElementById('roleChip').innerHTML = QZ.tiny(u.role === 'admin' ? 'shield' : 'user', 14) +
      (u.role === 'admin' ? '超级管理员' : '只读账号');
    document.getElementById('sideUser').innerHTML =
      QZ.shin(u.role === 'admin' ? 'shield' : 'user', 30) +
      '<div><div class="su-name">' + QZ.esc(u.name) + '</div><div class="su-role">' +
      (u.role === 'admin' ? '超级管理员 · 全站可管理' : '普通账号 · 仅查看') + '</div></div>';
    var fs = document.getElementById('footSync');
    if (fs) fs.textContent = QZ.data.sync.lastSync ? '最近同步：' + QZ.data.sync.lastSync : '尚未同步飞书文档';
    paintDiag('');
  }

  /* ---------------- 飞书多维表格同步引擎 ---------------- */
  var DEFAULT_SOURCE = 'https://yal2at57cvq.feishu.cn/base/GtSLbyyR3aCENOsJYC6cdlsVnih?table=tblH4au5rnBcqHgJ&view=vew8PFC7nG';

  /* 字段映射：飞书多维表格列名 → 工作台标准字段（中英文/常见别名全覆盖） */
  var FIELD_MAP = {
    company: ['company', '企业名称', '企业', '公司', '公司名称', '单位名称', '招聘企业', '公司/单位'],
    position: ['position', '岗位名称', '岗位', '职位', '招聘职位', '岗位方向', '投递岗位', '招聘岗位'],
    category: ['category', '岗位类别', '方向', '类别', '岗位类型', '投递方向', '岗位大类', '行业分类'],
    city: ['city', '工作地点', '城市', '地点', '工作城市', 'base', '所在城市'],
    status: ['status', '投递状态', '状态', '当前状态', '进度', '流程状态'],
    channel: ['channel', '投递渠道', '渠道', '来源', '投递方式', '公告来源'],
    referrer: ['referrer', '内推人', '推荐人', '内推码', '内推', '内推链接'],
    link: ['link', '投递链接', '链接', '原文链接', '岗位链接', 'url', '详情链接'],
    appliedAt: ['appliedAt', '投递时间', '投递日期', '日期', '开始时间', '开放时间', '更新时间'],
    deadline: ['deadline', '截止时间', '截止日期', '网申截止', '投递截止', 'Due', '结束时间'],
    salary: ['salary', '薪资', '薪酬', '待遇', '月薪', '工资'],
    remark: ['remark', '备注', '说明', '备注信息', '注意事项'],
    title: ['title', '事项', '标题', '任务', '待办事项', '名称'],
    name: ['name', '资源名称', '资料名称', '名称', '标题'],
    priority: ['priority', '优先级', '重要程度'],
    type: ['type', '类型', '分类', '校招类型', '批次', '招聘类型'],
    examAt: ['examAt', '笔试时间', '考试时间', '在线笔试时间', '笔试日期'],
    platform: ['platform', '笔试平台', '考试平台', '平台'],
    account: ['account', '账号', '笔试账号'],
    password: ['password', '密码', '笔试密码'],
    interviewAt: ['interviewAt', '面试时间', '面试日期'],
    time: ['time', '时间'],
    round: ['round', '轮次', '面试轮次', '面试进度'],
    interviewer: ['interviewer', '面试官'],
    mode: ['mode', '形式', '面试形式'],
    url: ['url', '网址', '地址'],
    desc: ['desc', '描述', '简介', '资源说明'],
    tag: ['tag', '标签'],
    prepare: ['prepare', '备考', '备考记录'],
    notes: ['notes', '笔记', '错题笔记']
  };

  function normalizeRow(row) {
    var out = {};
    Object.keys(FIELD_MAP).forEach(function (std) {
      var aliases = FIELD_MAP[std];
      for (var i = 0; i < aliases.length; i++) {
        var v = row[aliases[i]];
        if (v !== undefined && v !== null && String(v).trim() !== '') { out[std] = String(v).trim(); break; }
      }
    });
    // 兼容：中文列名 key 也保留，方便未命中时人工查看
    Object.keys(row).forEach(function (k) { if (out[k] === undefined) out[k] = row[k]; });
    return out;
  }

  /* 轻量 CSV/TSV 解析（支持双引号包裹） */
  function splitLine(line, sep) {
    var res = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === sep && !inQ) { res.push(cur); cur = ''; }
      else cur += c;
    }
    res.push(cur);
    return res.map(function (s) { return s.trim(); });
  }

  function parseDelimited(txt, sep) {
    var lines = txt.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
    if (lines.length < 2) return [];
    var heads = splitLine(lines[0], sep);
    return lines.slice(1).map(function (l) {
      var cells = splitLine(l, sep), o = {};
      heads.forEach(function (h, i) { o[h] = cells[i] === undefined ? '' : cells[i]; });
      return normalizeRow(o);
    }).filter(function (o) {
      return Object.keys(o).some(function (k) { return o[k] !== '' && o[k] !== undefined; });
    });
  }

  /* 统一解析：JSON / CSV / TSV / Markdown 表格 */
  function parseAny(txt) {
    txt = (txt || '').trim();
    if (!txt) return [];
    if (txt[0] === '[' || txt[0] === '{') {
      try {
        var j = JSON.parse(txt);
        var arr = Array.isArray(j) ? j
          : (j.data && (j.data.items || j.data.records || j.data.list || j.data.rows))
          || j.items || j.records || j.list || j.rows || [];
        return arr.map(normalizeRow);
      } catch (e) { /* 继续尝试文本解析 */ }
    }
    // Markdown 表格
    if (txt.indexOf('|') >= 0) {
      var lines = txt.split(/\r?\n/).filter(function (l) { return l.indexOf('|') >= 0; });
      if (lines.length >= 3 && /\|[\s:|-]+\|/.test(lines[1])) {
        var heads = lines[0].split('|').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
        return lines.slice(2).map(function (l) {
          var cells = l.split('|').map(function (s) { return s.trim(); });
          if (cells[0] === '') cells.shift();
          if (cells.length && cells[cells.length - 1] === '') cells.pop();
          var o = {}; heads.forEach(function (h, i) { o[h] = cells[i] === undefined ? '' : cells[i]; });
          return normalizeRow(o);
        }).filter(function (o) { return o.company || o.position || o.title || o.name; });
      }
    }
    // 分隔符自动判断
    var first = txt.split(/\r?\n/)[0] || '';
    var comma = (first.match(/,/g) || []).length;
    var tab = (first.match(/\t/g) || []).length;
    if (tab > comma) return parseDelimited(txt, '\t');
    return parseDelimited(txt, ',');
  }

  /* 智能归类：按字段判断该条记录进入哪个模块 */
  function classify(r) {
    if (r.examAt) return 'exams';
    if (r.interviewAt || r.round) return 'interviews';
    if ((r.title || r.deadline) && !r.company && !r.position) return 'todos';
    if (r.name && r.url && !r.company) return 'resources';
    if (r.company || r.position) return 'jobs';
    return 'jobs';
  }

  function itemKeyOf(ckey, r) {
    if (ckey === 'jobs') return (r.company || '') + '||' + (r.position || '');
    if (ckey === 'exams') return (r.company || '') + '||' + (r.examAt || '');
    if (ckey === 'interviews') return (r.company || '') + '||' + (r.round || r.interviewAt || '');
    if (ckey === 'todos') return r.title || '';
    if (ckey === 'resources') return r.name || '';
    return r.company || r.title || '';
  }

  function buildItem(ckey, r) {
    var c = QZ.collections[ckey];
    var item = {};
    (c.fields || []).forEach(function (f) {
      var v = r[f.key];
      if (ckey === 'exams' && f.key === 'examAt' && !v && r.time) v = r.time;
      if (ckey === 'interviews' && f.key === 'time' && !v && r.interviewAt) v = r.interviewAt;
      if (ckey === 'todos' && f.key === 'deadline' && !v && r.appliedAt) v = r.appliedAt;
      item[f.key] = v !== undefined ? v : (f.def || '');
    });
    if (!item.status) item.status = (c.fields || []).filter(function (f) { return f.key === 'status'; })[0]
      ? (c.defaults && c.defaults().status) || '' : undefined;
    if (ckey === 'jobs' && !item.appliedAt) item.appliedAt = QZ.today();
    if (ckey === 'todos' && !item.priority) item.priority = '中';
    item.id = r.id || QZ.uid();
    item._src = 'feishu';
    return item;
  }

  function mergeInto(ckey, rows, mode) {
    var list = QZ.data[ckey] || (QZ.data[ckey] = []);
    var added = 0, updated = 0;
    /* 先对已有数据建哈希索引：万级数据导入时避免 O(n²) 全表扫描导致浏览器卡死 */
    var index = {};
    for (var i = 0; i < list.length; i++) {
      var ik = itemKeyOf(ckey, list[i]);
      if (index[ik] === undefined) index[ik] = list[i];
    }
    rows.forEach(function (r) {
      if (!(r.company || r.position || r.title || r.name || r.examAt)) return;
      var key = itemKeyOf(ckey, r);
      var exist = index[key] || null;
      var item = buildItem(ckey, r);
      if (exist) {
        if (mode === 'overwrite') {
          Object.keys(item).forEach(function (k) { exist[k] = item[k]; });
          exist.id = exist.id || item.id;
          updated++;
        }
      } else {
        list.push(item); added++;
        if (index[key] === undefined) index[key] = item;
      }
    });
    return { added: added, updated: updated };
  }

  function pushSyncLog(entry) {
    QZ.data.sync.logs = QZ.data.sync.logs || [];
    QZ.data.sync.logs.unshift(entry);
    if (QZ.data.sync.logs.length > 10) QZ.data.sync.logs = QZ.data.sync.logs.slice(0, 10);
  }

  function fmtNow() {
    var d = new Date(), p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* 同步配置兼容升级（旧版本数据结构补齐） */
  QZ.ensureSync = function () {
    var s = QZ.data.sync = QZ.data.sync || {};
    if (!s.sourceUrl) s.sourceUrl = DEFAULT_SOURCE;
    if (!s.sourceName) s.sourceName = '飞书多维表格（27届秋招/春招/实习汇总表）';
    if (!s.mode) s.mode = 'overwrite';
    if (s.auto === undefined) s.auto = true;
    if (s.useProxy === undefined) s.useProxy = true;
    if (!s.proxy) s.proxy = 'https://r.jina.ai/';
    if (!s.logs) s.logs = [];
    if (!s.oauth) {
      s.oauth = {
        appId: '', appSecret: '',
        appToken: 'GtSLbyyR3aCENOsJYC6cdlsVnih',
        tableId: 'tblH4au5rnBcqHgJ', viewId: 'vew8PFC7nG'
      };
    }
  };

  /* 核心：执行同步（rows 直接给数据时为「导入」，否则从数据源拉取） */
  QZ.runSync = function (opts) {
    opts = opts || {};
    var s = QZ.data.sync;
    var mode = opts.mode || s.mode || 'overwrite';
    var silent = !!opts.silent;

    function finish(rows, from) {
      var target = opts.target || 'auto';
      var stat = { added: 0, updated: 0 };
      var buckets = {};
      rows.forEach(function (r) {
        var ckey = target === 'auto' ? classify(r) : target;
        (buckets[ckey] = buckets[ckey] || []).push(r);
      });
      Object.keys(buckets).forEach(function (ckey) {
        if (!QZ.collections[ckey]) return;
        var res = mergeInto(ckey, buckets[ckey], mode);
        stat.added += res.added; stat.updated += res.updated;
      });
      s.lastSync = fmtNow();
      s.lastResult = '来源：' + from + ' · 新增 ' + stat.added + ' 条 / 更新 ' + stat.updated + ' 条';
      s.lastStats = stat;
      pushSyncLog({ time: s.lastSync, from: from, mode: mode, added: stat.added, updated: stat.updated });
      QZ.save();
      if (QZ.user) QZ.render();
      if (!silent) QZ.toast('同步完成：新增 ' + stat.added + ' 条 / 更新 ' + stat.updated + ' 条');
      else if (stat.added + stat.updated > 0) QZ.toast('已自动同步飞书表格：新增 ' + stat.added + ' 条 / 更新 ' + stat.updated + ' 条');
      if (stat.added + stat.updated === 0 && !silent) {
        QZ.modal({
          title: '未解析到有效数据',
          desc: '数据源返回的内容不是可识别的表格数据',
          html: '<div class="note">飞书多维表格是网页应用，浏览器直接读取受登录态与跨域限制。<br>推荐做法：在飞书表格右上角「⋯ → 导出 / 下载」或「复制整个表格」，把 CSV 内容粘贴到同步窗口；也可以让表格维护者提供一个公开的 CSV/JSON 直链，填入后即可全自动同步。</div>'
        });
      }
      return stat;
    }

    // ① 直接给数据（粘贴 / 文件导入）
    if (opts.text) {
      var rows = parseAny(opts.text);
      if (!rows.length && !silent) QZ.toast('未解析到有效数据，请检查格式');
      return Promise.resolve(finish(rows, opts.from || '粘贴导入'));
    }

    // ② 从数据源拉取
    var url = opts.url || s.sourceUrl || DEFAULT_SOURCE;
    var finalUrl = s.useProxy ? (s.proxy + url) : url;
    if (!silent) QZ.toast('正在拉取飞书表格…');
    return fetch(finalUrl, { mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.text(); })
      .then(function (txt) { return finish(parseAny(txt), (s.useProxy ? '代理拉取' : '直链拉取')); })
      .catch(function (err) {
        var msg = '拉取失败：' + (err && err.message ? err.message : '网络/跨域限制');
        s.lastResult = msg;
        pushSyncLog({ time: fmtNow(), from: '拉取失败', mode: mode, added: 0, updated: 0, err: msg });
        QZ.save();
        if (QZ.user) QZ.render();
        if (!silent) {
          QZ.modal({
            title: '自动拉取失败',
            desc: msg,
            html: '<div class="note"><b>当前链接需要登录才能访问</b>（飞书会把未登录请求 302 跳到登录页），因此浏览器无法直接读取。<br><br>可用通道：<br>1) <b>粘贴导入（立即可用）</b>：在飞书表格里「导出 / 全选复制」，把内容粘贴到同步窗口；<br>2) <b>CSV/JSON 文件导入（立即可用）</b>：导出为 CSV 文件后在本页一键导入；<br>3) <b>公开直链（全自动）</b>：请表格维护者开启「分享 → 互联网上获得链接的人可阅读」，或提供导出的 CSV/JSON 公开直链，填入后每天打开工作台自动同步；<br>4) <b>开放平台 API（二期）</b>：飞书 Base API 需 app_id/app_secret 与后端中转，纯前端不适合直连。</div>' +
              '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
              '<button class="btn btn-primary btn-sm" onclick="QZ.closeModal();QZ.syncModal()">打开同步窗口</button>' +
              '<button class="btn btn-ghost btn-sm" onclick="QZ.closeModal()">关闭</button></div>'
          });
        }
        return { added: 0, updated: 0 };
      });
  };

  /* ---------------- Excel / CSV 文件导入 ---------------- */
  function fmtCell(v) {
    if (v instanceof Date && !isNaN(v.getTime())) {
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      var d = v.getFullYear() + '-' + p(v.getMonth() + 1) + '-' + p(v.getDate());
      if (v.getHours() || v.getMinutes()) d += ' ' + p(v.getHours()) + ':' + p(v.getMinutes());
      return d;
    }
    if (v === null || v === undefined) return '';
    return String(v).trim();
  }

  /* 工作表 → 记录数组（自动定位表头行） */
  QZ.sheetToRows = function (wb, sheetName) {
    var ws = wb.Sheets[sheetName];
    var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '', blankrows: false });
    if (!aoa || !aoa.length) return [];
    var hi = 0;
    for (var i = 0; i < aoa.length; i++) {
      var n = aoa[i].filter(function (c) { return c !== '' && c !== null && c !== undefined; }).length;
      if (n >= 2) { hi = i; break; }
    }
    var heads = aoa[hi].map(function (h, i) {
      var t = fmtCell(h);
      return t === '' ? ('列' + (i + 1)) : t;
    });
    var rows = [];
    aoa.slice(hi + 1).forEach(function (r) {
      var o = {}, has = false;
      heads.forEach(function (h, i) {
        var v = fmtCell(r[i]);
        if (v !== '') has = true;
        o[h] = v;
      });
      if (has) rows.push(o);
    });
    return rows;
  };

  /* 统一文件导入入口：.xlsx/.xls/.xlsb 走 Excel 解析，其余按文本解析 */
  /* 按需懒加载 SheetJS（避免 881KB 大文件阻塞首页/登录加载） */
  function ensureXLSX(cb) {
    if (typeof XLSX !== 'undefined') return cb();
    QZ.toast('正在加载 Excel 解析组件…');
    var s = document.createElement('script');
    s.src = 'vendor/xlsx.full.min.js?v=32';
    s.onload = cb;
    s.onerror = function () { QZ.toast('Excel 组件加载失败，请检查网络后重试'); };
    document.head.appendChild(s);
  }

  QZ.importFileObject = function (file) {
    if (!file) return;
    var name = file.name || '文件';
    var lower = name.toLowerCase();
    if (/\.(xlsx|xlsm|xlsb|xls)$/.test(lower)) {
      ensureXLSX(function () {
        QZ.toast('正在解析 Excel…');
        var fr = new FileReader();
      fr.onload = function (e) {
        try {
          var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
          var names = wb.SheetNames || [];
          if (!names.length) { QZ.toast('未读取到工作表'); return; }
          if (names.length === 1) {
            var rows = QZ.sheetToRows(wb, names[0]);
            QZ.runSync({ text: JSON.stringify(rows), from: 'Excel：' + name });
            return;
          }
          QZ.modal({
            title: '选择工作表',
            desc: '该 Excel 含 ' + names.length + ' 个工作表，请选择要导入的：',
            fields: [{ key: 'sheet', label: '工作表', type: 'select', options: names }],
            okText: '导入该表',
            onSubmit: function (v) {
              QZ.runSync({ text: JSON.stringify(QZ.sheetToRows(wb, v.sheet)), from: 'Excel：' + name + ' / ' + v.sheet });
            }
          });
        } catch (err) {
          QZ.toast('Excel 解析失败：' + (err && err.message ? err.message : '未知错误'));
        }
      };
      fr.readAsArrayBuffer(file);
      return;
    });
    }
    var reader = new FileReader();
    reader.onload = function () { QZ.runSync({ text: reader.result, from: '文件导入：' + name }); };
    reader.readAsText(file, 'utf-8');
  };

  /* 浏览器扩展桥接入口：扩展把抓取到的表格记录直接推送进来 */
  QZ.applyBridgeRows = function (rows, meta) {
    if (!rows || !rows.length) return { added: 0, updated: 0 };
    var list = rows.map(function (r) {
      var src = (r && r.fields && typeof r.fields === 'object') ? r.fields : r;
      var o = {};
      Object.keys(src || {}).forEach(function (k) {
        var v = src[k];
        if (Array.isArray(v)) {
          o[k] = v.map(function (x) {
            return (x && (x.text || x.name || x.value || x.title)) || (typeof x === 'string' ? x : '');
          }).filter(function (s) { return s !== ''; }).join('、');
        } else if (v && typeof v === 'object') {
          o[k] = v.text || v.link || v.name || v.value || v.title || '';
        } else {
          o[k] = v;
        }
      });
      return normalizeRow(o);
    });
    window.__QZ_BRIDGE_TS = (meta && meta.ts) || Date.now();
    QZ.data.sync.bridgeLast = fmtNow();
    return QZ.runSync({ text: JSON.stringify(list), from: (meta && meta.from) || '浏览器扩展桥接' });
  };

  /* 每日自动同步：当天首次打开工作台自动拉取一次 */
  QZ.maybeAutoSync = function () {
    var s = QZ.data.sync;
    if (!s.auto) return;
    var today = QZ.today();
    if (s.lastSync && String(s.lastSync).slice(0, 10) === today) return;
    QZ.runSync({ silent: true });
  };

  /* 同步窗口 */
  QZ.syncModal = function () {
    var s = QZ.data.sync;
    QZ.modal({
      title: '飞书多维表格同步',
      desc: '27 届秋招 / 春招 / 实习汇总表 · 一键拉取最新数据，自动归类到各模块',
      html:
        '<div class="modal-grid">' +
        '<div class="full" style="margin-bottom:8px"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">数据源链接（飞书多维表格）</div>' +
        '<input class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8" data-k="url" value="' + QZ.esc(s.sourceUrl || DEFAULT_SOURCE) + '"></div>' +
        '<div style="margin-bottom:8px"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">同步方式</div>' +
        '<select class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8" data-k="mode">' +
        '<option value="overwrite"' + (s.mode === 'overwrite' ? ' selected' : '') + '>覆盖更新（用表格最新数据刷新）</option>' +
        '<option value="incremental"' + (s.mode === 'incremental' ? ' selected' : '') + '>增量更新（只补新岗位）</option>' +
        '</select></div>' +
        '<div style="margin-bottom:8px"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">归属模块</div>' +
        '<select class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8" data-k="target">' +
        '<option value="auto">自动归类（推荐）</option>' +
        '<option value="jobs">岗位投递库</option><option value="exams">笔试管理</option><option value="interviews">面试管理</option>' +
        '<option value="todos">日程待办</option><option value="resources">资源收藏夹</option></select></div>' +
        '<div class="full" style="margin-bottom:8px"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">或粘贴表格内容（在飞书表格里全选复制 / 导出 CSV 后粘贴）</div>' +
        '<textarea class="field" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8;min-height:110px" data-k="paste" placeholder="企业名称,岗位名称,工作地点,投递链接,投递状态,截止时间&#10;腾讯,测试开发工程师,深圳,https://...,笔试中,2026-10-08"></textarea></div>' +
        '<div class="full"><div class="note teal">自动归类规则：含「笔试时间」→ 笔试管理；含「面试时间/轮次」→ 面试管理；含企业+岗位 → 岗位投递库；仅链接/资料 → 资源收藏夹；仅事项+截止 → 日程待办。列名支持中英文自动映射。</div></div>' +
        '</div>',
      okText: '开始同步',
      onSubmit: function (v) {
        s.sourceUrl = v.url || DEFAULT_SOURCE;
        s.mode = v.mode;
        QZ.save();
        if (v.paste && v.paste.trim()) { QZ.runSync({ text: v.paste, mode: v.mode, target: v.target, from: '粘贴导入' }); return; }
        QZ.runSync({ url: v.url, mode: v.mode, target: v.target });
      }
    });
  };

  /* 兼容旧调用 */
  QZ.doImport = function (target, text, mode, from) {
    return QZ.runSync({ text: text, mode: mode, target: target, from: from || '导入' });
  };

  QZ.exportJson = function () {
    var blob = new Blob([JSON.stringify(QZ.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '秋招工作台备份_' + QZ.today() + '.json';
    a.click();
    QZ.toast('备份文件已下载');
  };

  /* ============================================================
   * 网申助手扩展桥接（可选增强：装了扩展才生效，没装完全不影响原有功能）
   * 通信通道：window.postMessage（页面 ↔ 扩展 content script）
   * 协议：所有消息带 __qzjaf:1，与飞书桥接的 qz-bridge-* 完全隔离
   * ============================================================ */
  QZ.jaf = {
    ready: false,      // 是否检测到网申助手扩展
    ver: '',           // 扩展版本号
    ts: 0,             // 最近一次握手时间戳
    lastMsg: ''        // 最近一条联动记录（显示在设置中心）
  };

  /* 网申档案字段：[扩展 key, 中文标签] */
  QZ.JAF_FIELDS = [
    ['name', '姓名'], ['gender', '性别'], ['birthday', '出生日期'], ['phone', '手机号'],
    ['email', '邮箱'], ['idCard', '身份证号'], ['hometown', '籍贯'], ['address', '现居地址'],
    ['school', '学校'], ['major', '专业'], ['degree', '学历'], ['graduationDate', '毕业时间'],
    ['schoolType', '学校类型'], ['expectedCity', '期望城市'], ['expectedPosition', '期望岗位'],
    ['selfEvaluation', '自我评价']
  ];

  function jafProfile() {
    try {
      if (!QZ.data.profile || typeof QZ.data.profile !== 'object') QZ.data.profile = {};
    } catch (e) { QZ.data.profile = {}; }
    return QZ.data.profile;
  }
  QZ.jaf.profile = jafProfile;

  /** 向页面广播 ping，扩展若在运行会回 pong */
  QZ.jaf.ping = function () {
    try { window.postMessage({ __qzjaf: 1, type: 'ping' }, '*'); } catch (e) { }
    return false;
  };

  /** 档案编辑：onchange 写入 QZ.data.profile */
  QZ.jaf.setProfile = function (k, v) {
    try { jafProfile()[k] = v; QZ.save(); } catch (e) { }
  };

  /** 把档案推给扩展（扩展收到后存入自己的 storage） */
  QZ.jaf.syncProfile = function () {
    try {
      var p = jafProfile();
      var n = Object.keys(p).filter(function (k) { return String(p[k] || '').trim() !== ''; }).length;
      if (!n) { QZ.toast('档案还是空的，先填几项再同步'); return; }
      window.postMessage({ __qzjaf: 1, type: 'syncProfile', profile: p }, '*');
      QZ.toast('已推送档案（' + n + ' 项）给网申助手扩展');
    } catch (e) { QZ.toast('推送失败：' + e.message); }
  };

  /** 导出档案 JSON（可在扩展选项页「导入」） */
  QZ.jaf.exportProfile = function () {
    try {
      var out = { _type: 'jaf-profile', _from: '秋招工作台', _time: QZ.jaf.now(), profile: jafProfile() };
      var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '网申档案_' + QZ.today() + '.json';
      a.click();
      QZ.toast('档案已下载，可在扩展选项页导入');
    } catch (e) { QZ.toast('导出失败：' + e.message); }
  };

  QZ.jaf.now = function () {
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; };
    return QZ.today() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  };

  /* ---- 当前正在投递的岗位上下文（点「⚡网申」时写入） ---- */
  QZ.jaf.setCtx = function (job) {
    var ctx = { id: job.id, company: job.company || '', position: job.position || '', url: job.link || '', ts: Date.now() };
    QZ._applyCtx = ctx;
    try { localStorage.setItem('qz_apply_ctx', JSON.stringify(ctx)); } catch (e) { }
    return ctx;
  };
  QZ.jaf.getCtx = function () {
    if (QZ._applyCtx) return QZ._applyCtx;
    try {
      var s = localStorage.getItem('qz_apply_ctx');
      if (s) return JSON.parse(s);
    } catch (e) { }
    return null;
  };

  function jafHost(u) {
    try { var m = String(u || '').match(/^https?:\/\/([^\/]+)/i); return m ? m[1].toLowerCase() : ''; } catch (e) { return ''; }
  }

  /** 按 jobId → 链接域名 → 公司名 的顺序匹配岗位 */
  QZ.jaf.findJob = function (d) {
    d = d || {};
    var jobs = QZ.data.jobs || [];
    var ctx = QZ.jaf.getCtx();
    var byId = d.jobId || (ctx && ctx.id) || '';
    if (byId) {
      var j0 = jobs.filter(function (x) { return String(x.id) === String(byId); })[0];
      if (j0) return j0;
    }
    var h = jafHost(d.url);
    if (h) {
      var j1 = jobs.filter(function (x) { return x.link && jafHost(x.link) === h; })[0];
      if (j1) return j1;
    }
    var c = String(d.company || (ctx && ctx.company) || '').trim();
    if (c) {
      var j2 = jobs.filter(function (x) {
        return x.company && (String(x.company).indexOf(c) >= 0 || c.indexOf(String(x.company)) >= 0);
      })[0];
      if (j2) return j2;
    }
    return null;
  };

  /** 扩展填充完成 → 把对应岗位标成「已投递」 */
  QZ.jaf.applyDone = function (d) {
    try {
      d = d || {};
      var job = QZ.jaf.findJob(d);
      if (!job) {
        QZ.jaf.lastMsg = '收到填充结果，但没匹配到岗位（' + (d.company || d.url || '—') + '）';
        if (QZ.page === 'settings') { try { QZ.render(); } catch (e) { } }
        QZ.toast('网申助手已回填，但未匹配到岗位，可手动改状态');
        return false;
      }
      var t = QZ.jaf.now();
      job.status = '已投递';
      if (!job.appliedAt) job.appliedAt = QZ.today();
      var tag = '网申助手填充 ' + (d.filled || 0) + ' 项 · ' + t;
      job.remark = (job.remark && job.remark !== '—' ? job.remark + ' ｜ ' : '') + tag;
      QZ.save();
      QZ.render();
      QZ.jaf.lastMsg = job.company + ' → 已投递（' + t + '）';
      QZ.toast('已回填：' + job.company + ' 标记「已投递」');
      return true;
    } catch (e) { QZ.jaf.lastMsg = '回填出错：' + e.message; return false; }
  };

  /** 解析回写串：QZRW1 + JSON（或 base64 后的 JSON） */
  QZ.jaf.parseWriteback = function (text) {
    try {
      var s = String(text || '');
      var i = s.indexOf('QZRW1');
      if (i < 0) return null;
      var rest = s.slice(i + 5).replace(/^[\s|:：]+/, '').trim();
      try { return JSON.parse(rest); } catch (e) { }
      try { return JSON.parse(atob(rest)); } catch (e2) { }
      return null;
    } catch (e) { return null; }
  };

  QZ.actions = QZ.actions || {};

  /* 档案字段中文名（简历识别结果展示用） */
  var JAF_LABEL = {
    name: '姓名', namePinyin: '姓名拼音', gender: '性别', birthday: '出生日期', age: '年龄',
    idCard: '身份证号', nation: '民族', politicalStatus: '政治面貌', hometown: '籍贯',
    height: '身高', weight: '体重', phone: '手机号', email: '邮箱', wechat: '微信', qq: 'QQ',
    address: '现居地址', postalCode: '邮编', homepage: '主页', school: '学校', major: '专业',
    degree: '学历', degreeType: '学历类型', educationStart: '入学时间', graduationDate: '毕业时间',
    gpa: 'GPA', rank: '排名', schoolType: '学校类型', englishLevel: '英语水平', cetScore: '英语成绩',
    schoolExperience: '校园经历', expectedCity: '期望城市', expectedPosition: '期望岗位',
    expectedSalary: '期望薪资', availableDate: '可到岗时间', internTime: '可实习时间',
    jobType: '招聘类型', referrer: '内推', selfEvaluation: '自我评价', skills: '技能',
    awards: '获奖', projectExperience: '项目经历', internship: '实习经历', careerPlan: '职业规划',
    whyUs: '应聘原因'
  };
  QZ.jaf.labelOf = function (k) {
    for (var i = 0; i < (QZ.JAF_FIELDS || []).length; i++) {
      if (QZ.JAF_FIELDS[i][0] === k) return QZ.JAF_FIELDS[i][1];
    }
    return JAF_LABEL[k] || k;
  };

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** 从粘贴的简历文本识别档案字段（本机解析，不上传） */
  QZ.actions.jafParseResume = function (previewOnly) {
    try {
      var ta = document.getElementById('jafResume');
      var text = ta ? ta.value : '';
      if (!String(text || '').trim()) { QZ.toast('请先粘贴简历文本，或选择 .txt / .md / .docx 文件'); return; }
      var P = window.ResumeParser;
      if (!P || !P.parse) { QZ.toast('解析组件未加载，请刷新页面重试'); return; }
      var r = P.parse(text);
      if (!r || !r.count) { QZ.toast('没有识别到字段，确认粘贴的是完整简历文本'); return; }
      var keys = Object.keys(r.fields);
      QZ.jaf.lastParse = '<div class="note teal">识别到 <b>' + keys.length + '</b> 项（' +
        escHtml(keys.slice(0, 6).map(QZ.jaf.labelOf).join('、')) + (keys.length > 6 ? ' 等' : '') + '）</div>' +
        '<div class="table-wrap" style="margin-top:6px"><table style="min-width:420px"><thead><tr><th>字段</th><th>识别到的内容</th></tr></thead><tbody>' +
        keys.map(function (k) {
          return '<tr><td class="nowrap">' + escHtml(QZ.jaf.labelOf(k)) + '</td><td>' +
            escHtml(String(r.fields[k]).replace(/\n/g, ' ⏎ ').slice(0, 80)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      if (previewOnly) {
        QZ.render();
        QZ.toast('识别到 ' + keys.length + ' 项，点「识别并填入档案」写入');
        return;
      }
      var p = jafProfile();
      keys.forEach(function (k) { p[k] = r.fields[k]; });
      QZ.save();
      QZ.render();
      QZ.toast('已写入 ' + keys.length + ' 项档案，核对后点「同步档案到扩展」');
    } catch (e) { QZ.toast('识别失败：' + e.message); }
  };

  /** 选择简历文件（txt / md / docx）→ 读入文本框 */
  QZ.actions.jafResumeFile = function () {
    try {
      var f = document.getElementById('jafResumeFile');
      var file = f && f.files && f.files[0];
      if (!file) return;
      var P = window.ResumeParser;
      if (!P || !P.readFile) { QZ.toast('解析组件未加载，请刷新页面重试'); return; }
      P.readFile(file).then(function (t) {
        var ta = document.getElementById('jafResume');
        if (ta) ta.value = t;
        QZ.toast('已读取 ' + file.name + '（' + t.length + ' 字），点「识别并填入档案」');
      }).catch(function (e) {
        QZ.toast((e && e.message) || '读取失败，请把内容复制粘贴到文本框');
      });
    } catch (e) { QZ.toast('读取失败：' + e.message); }
  };

  /** 粘贴档案 JSON 导入（与扩展选项页「导入 JSON」同一份格式） */
  QZ.actions.jafImportProfile = function () {
    try {
      var el = document.getElementById('jafImportJson');
      var s = String((el && el.value) || '').trim();
      if (!s) { QZ.toast('先粘贴档案 JSON（或点「导出档案 JSON」看格式）'); return; }
      var obj;
      try { obj = JSON.parse(s); } catch (e1) { QZ.toast('JSON 解析失败：' + e1.message); return; }
      var p = (obj && obj.profile && typeof obj.profile === 'object') ? obj.profile : obj;
      if (!p || typeof p !== 'object') { QZ.toast('没找到档案内容'); return; }
      var cur = jafProfile(), n = 0;
      Object.keys(p).forEach(function (k) {
        if (k.charAt(0) === '_') return;
        var v = p[k];
        if (v == null || typeof v === 'object') return;
        var sv = String(v);
        if (!sv.trim()) return;        /* 留空的字段不动，避免覆盖已有内容 */
        cur[k] = sv;
        n++;
      });
      QZ.save();
      QZ.jaf.lastMsg = '已导入 ' + n + ' 项档案';
      QZ.render();
      QZ.toast('已导入 ' + n + ' 项，核对后可点「同步档案到扩展」');
    } catch (e) { QZ.toast('导入失败：' + e.message); }
  };

  /* ---------------- 岗位适配分析（v34） ---------------- */

  QZ.fit = { last: null, busy: false };

  function fitStore() {
    try {
      if (!QZ.data.fitReports || typeof QZ.data.fitReports !== 'object') QZ.data.fitReports = {};
    } catch (e) { QZ.data.fitReports = {}; }
    return QZ.data.fitReports;
  }
  QZ.fit.store = fitStore;

  function aiCfg() {
    try {
      if (!QZ.data.aiCfg || typeof QZ.data.aiCfg !== 'object') {
        QZ.data.aiCfg = { key: '', model: 'deepseek-chat', base: '', on: true };
      }
    } catch (e) { QZ.data.aiCfg = { key: '', model: 'deepseek-chat', base: '', on: true }; }
    return QZ.data.aiCfg;
  }
  QZ.fit.cfg = aiCfg;

  function fitJob(id) {
    var l = QZ.data.jobs || [];
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }

  function fitLevelChip(lv) {
    var cls = lv === '高度推荐' ? 'green' : (lv === '可以投递' ? 'blue' : (lv === '谨慎投递' ? 'yellow' : 'red'));
    return '<span class="chip ' + cls + '">' + QZ.esc(lv) + '</span>';
  }

  function fitScoreBar(score) {
    var c = score >= 80 ? '#1D9E75' : (score >= 65 ? '#3E7CC4' : (score >= 45 ? '#B8801F' : '#C0392B'));
    return '<div style="display:flex;align-items:center;gap:10px;margin:6px 0 2px">' +
      '<div style="flex:1;height:10px;border-radius:6px;background:var(--cream-2,#F1EFE8);overflow:hidden">' +
      '<div style="width:' + Math.max(2, Math.min(100, score)) + '%;height:100%;background:' + c + '"></div></div>' +
      '<b style="font-size:20px;color:' + c + '">' + score + '</b><span style="font-size:12px;color:var(--text-2)">/ 100</span></div>';
  }

  /** 分析结果 → HTML */
  function fitRecHtml(rec) {
    var h = '<div style="border:1px solid var(--border);border-radius:14px;padding:12px 14px;background:#FCFBF8;margin-top:10px">';
    h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<b style="font-size:14px">适配总分</b>' + fitLevelChip(rec.level) +
      '<span class="chip ' + (rec.mode === 'ai' ? 'blue' : 'gray') + '">' + (rec.mode === 'ai' ? 'AI 深度分析' : '离线关键词分析') + '</span>' +
      (rec.quality === 'weak' ? '<span class="chip yellow">JD 不全 · 方向级粗估</span>' : '<span class="chip green">JD 完整</span>') +
      (rec.track ? '<span class="chip gray">' + QZ.esc(rec.track) + '</span>' : '') +
      (rec.reqCount ? '<span class="chip gray">命中 ' + rec.hitCount + '/' + rec.reqCount + ' 项</span>' : '') +
      '<span class="chip gray">' + QZ.esc(rec.tsText || '') + '</span></div>';
    h += fitScoreBar(rec.score);
    if (rec.slim) h += '<div class="note yellow" style="margin-top:6px">这是<b>批量分析</b>生成的精简记录（只保留 3 条亮点 / 短板 / 建议）。想要完整版，就在上面的模式选择里点「开始适配分析」重新跑一次。</div>';
    if (rec.note) h += '<div class="note" style="margin-top:6px">' + QZ.esc(rec.note) + '</div>';

    if (rec.plain && rec.plain.text) {
      h += '<div style="margin-top:12px"><b style="font-size:13px">岗位通俗解读 · ' + QZ.esc(rec.plain.title || '') + '</b>' +
        '<div style="font-size:12.5px;line-height:1.7;color:var(--text-2);margin-top:4px">' + QZ.esc(rec.plain.text) + '</div>' +
        (rec.plain.bullets && rec.plain.bullets.length ? '<ul style="margin:6px 0 0 18px;font-size:12.5px;line-height:1.8;color:var(--text-2)">' +
          rec.plain.bullets.map(function (b) { return '<li>' + QZ.esc(b) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }
    if (rec.highlights && rec.highlights.length) {
      h += '<div style="margin-top:12px"><b style="font-size:13px">匹配亮点（简历里有的）</b><div class="list" style="margin-top:6px">' +
        rec.highlights.map(function (x) {
          return '<div class="list-item"><div class="li-main"><div class="li-title">' + QZ.esc(x.title) + '</div>' +
            '<div class="li-sub" style="font-size:12px;color:var(--text-2)">' + QZ.esc(x.evidence || '') + '</div></div></div>';
        }).join('') + '</div></div>';
    }
    if (rec.gaps && rec.gaps.length) {
      h += '<div style="margin-top:12px"><b style="font-size:13px">能力短板（JD 要但简历没体现）</b><div class="list" style="margin-top:6px">' +
        rec.gaps.map(function (x) {
          return '<div class="list-item"><div class="li-main"><div class="li-title">' + QZ.esc(x.title) + '</div>' +
            '<div class="li-sub" style="font-size:12px;color:var(--text-2)">' + QZ.esc(x.why || '') + '</div></div></div>';
        }).join('') + '</div></div>';
    }
    if (rec.transfer) {
      h += '<div style="margin-top:12px"><b style="font-size:13px">转行适配判断</b>' +
        '<div style="font-size:12.5px;line-height:1.7;color:var(--text-2);margin-top:4px">' + QZ.esc(rec.transfer) + '</div></div>';
    }
    if (rec.advice && rec.advice.length) {
      h += '<div style="margin-top:12px"><b style="font-size:13px">简历优化 & 面试准备建议</b><ol style="margin:6px 0 0 18px;font-size:12.5px;line-height:1.8;color:var(--text-2)">' +
        rec.advice.map(function (a) { return '<li>' + QZ.esc(a) + '</li>'; }).join('') + '</ol></div>';
    }
    return h + '</div>';
  }

  function fitHistoryHtml(id) {
    var list = fitStore()[id] || [];
    if (!list.length) return '<div class="note" style="margin-top:8px">还没有历史分析记录，点「开始适配分析」生成第一条。</div>';
    return '<div style="margin-top:10px"><b style="font-size:13px">历史分析记录（' + list.length + '）</b>' +
      '<div class="table-wrap" style="margin-top:6px"><table style="min-width:380px"><thead><tr><th>时间</th><th>模式</th><th>分数</th><th>评级</th><th>操作</th></tr></thead><tbody>' +
      list.map(function (r, i) {
        return '<tr><td class="nowrap">' + QZ.esc(r.tsText || '') + '</td>' +
          '<td>' + (r.mode === 'ai' ? 'AI' : '离线') + '</td>' +
          '<td><b>' + r.score + '</b></td><td>' + fitLevelChip(r.level) + '</td>' +
          '<td class="nowrap"><button class="btn btn-ghost btn-sm" data-actx="view:' + i + '">查看</button> ' +
          '<button class="btn btn-ghost btn-sm" data-actx="del:' + i + '">删除</button></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  /** 打开岗位适配分析弹窗 */
  QZ.actions = QZ.actions || {};
  QZ.actions.jobFit = function (id) {
    try {
      var job = fitJob(id);
      if (!job) { QZ.toast('没找到该岗位'); return; }
      var p = jafProfile();
      var filled = Object.keys(p).filter(function (k) { return String(p[k] || '').trim(); }).length;
      var cfg = aiCfg();
      var jdText = job.jd || (window.FitAnalyzer ? window.FitAnalyzer.jdDraft(job) : '');
      var last = (QZ.fit.last && QZ.fit.last.id === id) ? QZ.fit.last.rec : null;

      var html = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">' +
        '<span class="chip ' + (filled >= 6 ? 'green' : 'yellow') + '">简历档案已填 ' + filled + ' 项</span>' +
        '<span class="chip gray">' + QZ.esc(job.position || '') + '</span>' +
        '<span class="chip ' + (cfg.key && cfg.on !== false ? 'blue' : 'gray') + '">' +
        (cfg.key && cfg.on !== false ? 'AI 深度分析可用' : '离线兜底模式可用') + '</span>' +
        '<button class="btn btn-ghost btn-sm" onclick="QZ.closeModal();QZ.go(\'settings\')">补全简历档案</button></div>' +
        (filled < 4 ? '<div class="note" style="margin-bottom:8px">简历档案内容太少，分析结果会偏保守。建议先到设置中心用「从简历自动识别」或「导入档案 JSON」把档案填好。</div>' : '') +
        (window.FitAnalyzer && window.FitAnalyzer.jdQuality(jdText, job) === 'weak'
          ? '<div class="note yellow" style="margin-bottom:8px">这条岗位<b>没有录入 JD</b>，下面是系统按岗位名称生成的方向级草稿。粘贴真实 JD 后点「保存 JD」再分析，分数才精确到具体能力项；没 JD 时不会判「不匹配」，只会给方向级粗估。</div>' : '') +
        '<div style="font-size:12.5px;color:var(--text-2);margin-bottom:4px">岗位 JD（可手动修改，改完点「保存 JD」）</div>' +
        '<textarea id="fitJd" rows="7" style="width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:#FCFBF8;font-size:12.5px;line-height:1.6">' + QZ.esc(jdText) + '</textarea>' +
        '<div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">' +
        '<select id="fitMode" style="padding:7px 9px;border:1px solid var(--border);border-radius:10px;background:#fff;font-size:12.5px">' +
        '<option value="auto">自动（有 Key 走 AI，失败回落离线）</option>' +
        '<option value="ai">只用 AI 深度分析</option>' +
        '<option value="offline">只用离线关键词分析</option></select>' +
        '<button class="btn btn-primary btn-sm" data-actx="run">开始适配分析</button>' +
        '<button class="btn btn-soft btn-sm" data-actx="saveJd">保存 JD</button>' +
        '<span class="muted" style="font-size:12px">分析只用本机档案 + 你填的 JD；离线模式完全不出网</span></div>' +
        '<div id="fitOut">' + (last ? fitRecHtml(last) : '') + '</div>' +
        fitHistoryHtml(id);

      QZ.modal({
        title: '岗位适配分析 · ' + QZ.esc(job.company || ''),
        desc: '读取本机简历档案与岗位 JD，输出适配总分、匹配亮点、能力短板、岗位解读与投递建议',
        html: html,
        cancelText: '关闭',
        onExtra: function (actx, wrap) {
          try {
            var jdEl = wrap.querySelector('#fitJd');
            var jd = jdEl ? jdEl.value : '';
            var mdEl = wrap.querySelector('#fitMode');
            var mode = mdEl ? mdEl.value : 'auto';
            if (actx === 'run') { QZ.actions.jobFitRun(id, mode, jd); }
            else if (actx === 'saveJd') {
              var j2 = fitJob(id); if (!j2) return;
              j2.jd = jd; QZ.save(); QZ.toast('JD 已保存到该岗位'); QZ.render();
            } else if (actx.indexOf('view:') === 0) {
              var idx = parseInt(actx.slice(5), 10);
              var list = fitStore()[id] || [];
              if (list[idx]) { QZ.fit.last = { id: id, rec: list[idx] }; QZ.actions.jobFit(id); }
            } else if (actx.indexOf('del:') === 0) {
              var k = parseInt(actx.slice(4), 10);
              var arr = fitStore()[id] || [];
              arr.splice(k, 1);
              fitStore()[id] = arr;
              if (QZ.fit.last && QZ.fit.last.id === id && k === 0) QZ.fit.last = null;
              QZ.save(); QZ.actions.jobFit(id); QZ.toast('已删除该条记录');
            }
          } catch (e) { QZ.toast('操作失败：' + e.message); }
        }
      });
    } catch (e) { QZ.toast('打开分析面板失败：' + e.message); }
  };

  /** 执行分析（结果写进历史并重开弹窗展示） */
  QZ.actions.jobFitRun = function (id, mode, jdText) {
    try {
      var job = fitJob(id);
      if (!job) { QZ.toast('没找到该岗位'); return; }
      if (typeof jdText === 'string' && jdText.trim()) job.jd = jdText;
      var A = window.FitAnalyzer;
      if (!A || !A.analyze) { QZ.toast('分析组件未加载，请刷新页面重试'); return; }
      var rt = A.resumeText(jafProfile());
      var jd = job.jd || A.jdDraft(job);
      if (!String(rt).trim()) { QZ.toast('简历档案是空的，先到设置中心填写'); return; }
      QZ.toast('分析中…');
      A.profile = jafProfile();        /* 供「专业对口」判定使用 */
      A.analyze(rt, jd, job, aiCfg(), mode || 'auto').then(function (r) {
        var rec = r.data || {};
        var d = new Date();
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        rec.tsText = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        var arr = fitStore()[id] || [];
        arr.unshift(rec);
        fitStore()[id] = arr.slice(0, 20);
        QZ.fit.last = { id: id, rec: rec };
        QZ.save();
        QZ.actions.jobFit(id);
        QZ.render();
        if (r.used === 'offline' && r.err) QZ.toast('AI 分析失败（' + r.err + '），已用离线兜底出结果');
        else QZ.toast('分析完成：' + rec.score + ' 分 · ' + rec.level);
      }).catch(function (e) {
        QZ.toast('分析失败：' + ((e && e.message) || '未知错误'));
      });
    } catch (e) { QZ.toast('分析失败：' + e.message); }
  };

  /** 批量离线分析：对岗位页当前筛选出的岗位一次性跑离线分析（精简记录，节省本地空间） */
  QZ.actions.jobFitBatch = function () {
    try {
      var A = window.FitAnalyzer;
      if (!A || !A.offline) { QZ.toast('分析组件未加载，请刷新页面重试'); return; }
      var pf = jafProfile();
      var filled = Object.keys(pf).filter(function (k) { return String(pf[k] || '').trim(); }).length;
      if (filled < 3) { QZ.toast('简历档案内容太少，先到设置中心填好再批量分析'); return; }
      var list = QZ._jobsView || QZ.data.jobs || [];
      if (!list.length) { QZ.toast('没有可分析的岗位'); return; }
      QZ.toast('正在批量分析 ' + list.length + ' 条岗位…');
      setTimeout(function () {
        try {
          A.profile = pf;
          var rt = A.resumeText(pf);
          var st = fitStore(), n = 0, t0 = Date.now();
          var d = new Date(), pad = function (x) { return x < 10 ? '0' + x : '' + x; };
          var cut = function (s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
          var tsText = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
          list.forEach(function (job) {
            try {
              var r = A.offline(rt, job.jd || A.jdDraft(job), job);
              var rec = {
                mode: 'offline', slim: true, score: r.score, level: r.level,
                quality: r.quality, track: r.track, reqCount: r.reqCount, hitCount: r.hitCount,
                isNonIT: !!r.isNonIT, tsText: tsText, note: cut(r.note, 60),
                highlights: (r.highlights || []).slice(0, 3).map(function (x) { return { title: x.title, evidence: cut(x.evidence, 60) }; }),
                gaps: (r.gaps || []).slice(0, 3).map(function (x) { return { title: x.title, why: cut(x.why, 50) }; }),
                advice: (r.advice || []).slice(0, 2).map(function (s) { return cut(s, 80); })
              };
              var arr = st[job.id] || [];
              arr.unshift(rec);
              st[job.id] = arr.slice(0, 5);
              n++;
            } catch (e) { }
          });
          QZ.save(); QZ.render();
          QZ.toast('已批量分析 ' + n + ' 条（耗时 ' + ((Date.now() - t0) / 1000).toFixed(1) + 's），可用「适配分高→低」排序挑岗位');
        } catch (e) { QZ.toast('批量分析失败：' + e.message); }
      }, 30);
    } catch (e) { QZ.toast('批量分析失败：' + e.message); }
  };

  /** 清空全部岗位分析报告（释放本地空间） */
  QZ.actions.fitClear = function () {
    try {
      var st = fitStore();
      var n = Object.keys(st).reduce(function (a, k) { return a + ((st[k] || []).length); }, 0);
      if (!n) { QZ.toast('还没有任何分析报告'); return; }
      if (!window.confirm('确定清空全部 ' + n + ' 份岗位分析报告吗？简历档案不会被清除，重新分析即可再生成。')) return;
      QZ.data.fitReports = {};
      QZ.fit.last = null;
      QZ.save(); QZ.render();
      QZ.toast('已清空 ' + n + ' 份分析报告');
    } catch (e) { QZ.toast('清空失败：' + e.message); }
  };

  /** 切换图标模式：svg = 原创手绘（默认，零请求）；img = 先找 assets/icons/*.png */
  QZ.actions = QZ.actions || {};
  QZ.actions.setIconMode = function (m) {
    try {
      var v = QZ.iconMode(m);
      QZ.render();
      QZ.toast(v === 'img'
        ? '已切换为自定义图片模式：缺失的图标会自动回退原创手绘图标'
        : '已切换为原创手绘图标模式：不发任何图片请求，加载最快、不会闪');
    } catch (e) { QZ.toast('切换失败：' + e.message); }
  };

  QZ.actions = QZ.actions || {};
  QZ.actions.jafWriteback = function () {
    var el = document.getElementById('jafWB');
    var d = QZ.jaf.parseWriteback(el ? el.value : '');
    if (!d) { QZ.toast('回写串格式不对（应包含 QZRW1）'); return; }
    QZ.jaf.applyDone(d);
  };

  /* ---------------- 登录 ---------------- */
  function doLogin(u, p) {
    var user = QZ.data.users.filter(function (x) { return x.username === u && x.password === p; })[0];
    if (!user) { document.getElementById('loginErr').textContent = '账号或密码不正确'; return; }
    if (!user.active) { document.getElementById('loginErr').textContent = '该账号已被停用，请联系管理员'; return; }
    QZ.user = user;
    try { sessionStorage.setItem(SESSION, user.username); } catch (e) { }
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    QZ.render();
    QZ.maybeAutoSync();   // 每日首次登录自动同步飞书表格
    try { QZ.syncFromHash(); } catch (e) { }   // 支持带 #/模块 的链接直达
  }

  /* 登录提交：由表单 onsubmit 内联调用，避免脚本未就绪时表单回退刷新 */
  QZ.loginSubmit = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    doLogin(document.getElementById('loginUser').value.trim(), document.getElementById('loginPass').value);
    return false;
  };

  /* ---------------- 启动 ---------------- */
  QZ.act = function (a, id, extra) {
    var f = QZ.actions[a];
    if (f) f(id, extra);
  };
  QZ.actions = QZ.actions || {};   // 保留上方 jaf 模块已注册的动作

  document.addEventListener('DOMContentLoaded', function () {
    QZ.load();
    document.getElementById('loginIcon').innerHTML = QZ.shin('cap', 64);
    document.getElementById('brandIcon').innerHTML = QZ.shin('cap', 40);
    // 登录提交改由表单内联 onsubmit 调用 QZ.loginSubmit，去掉此处重复监听，避免重复登录
    document.getElementById('logoutBtn').addEventListener('click', function () {
      QZ.user = null;
      try { sessionStorage.removeItem(SESSION); } catch (e) { }
      document.getElementById('app').classList.add('hidden');
      document.getElementById('login').classList.remove('hidden');
      document.getElementById('loginErr').textContent = '';
    });
    document.getElementById('syncBtn').addEventListener('click', QZ.syncModal);
    document.getElementById('exportBtn').addEventListener('click', QZ.exportJson);
    document.getElementById('menuBtn').addEventListener('click', function () {
      var sb = document.getElementById('sidebar'), sc = document.getElementById('scrim');
      sb.classList.toggle('open');
      sc.style.display = sb.classList.contains('open') ? 'block' : 'none';
    });
    /* 侧边栏菜单切换：事件委托（点图标 / 文字 / 徽标都能命中，兼容移动端触摸点击） */
    /* 保险③：document 捕获阶段监听 —— 最先触发，任何 stopPropagation / 重渲染都无法绕过 */
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.getAttribute && t.getAttribute('data-page')) {
          e.__qzNav = 1;
          if (e.preventDefault) { try { e.preventDefault(); } catch (err) { } }
          QZ.go(t.getAttribute('data-page'));
          return;
        }
        t = t.parentNode;
      }
    }, true);
    document.getElementById('nav').addEventListener('click', function (e) {
      if (e && e.__qzNav) return;   // 已被按钮上的内联 onclick 处理，避免重复渲染
      var t = e.target;
      while (t && t !== this) {
        if (t.classList && t.classList.contains('nav-item')) {
          var id = t.getAttribute('data-page');
          if (id) { e.preventDefault(); QZ.go(id); }
          return;
        }
        t = t.parentNode;
      }
    });
    document.getElementById('scrim').addEventListener('click', function () {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').style.display = 'none';
    });
    // 与本机「飞书同步桥接扩展」握手，判断扩展是否已安装
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'qz-bridge-pong') {
        window.__QZ_BRIDGE_OK = true;
        window.__QZ_BRIDGE_TS = e.data.ts || Date.now();
        if (QZ.page === 'settings') QZ.render();
      }
    });
    window.postMessage({ type: 'qz-bridge-ping' }, '*');

    /* 与「网申自动填充助手」扩展握手（可选，装了才生效） */
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || !d.__qzjaf) return;                 // 只认本协议，不干扰飞书桥接
      try {
        if (d.type === 'pong') {
          QZ.jaf.ready = true;
          QZ.jaf.ver = d.v || '';
          QZ.jaf.ts = Date.now();
          if (QZ.page === 'settings') QZ.render();
        } else if (d.type === 'fillDone') {
          QZ.jaf.applyDone(d);
        } else if (d.type === 'profileAck') {
          QZ.jaf.lastMsg = '档案已同步到扩展 v' + (d.v || '') + '（' + QZ.jaf.now() + '）';
          QZ.toast('档案已同步到扩展');
          if (QZ.page === 'settings') QZ.render();
        }
      } catch (err) { }
    });
    QZ.jaf.ping();
    setInterval(function () { try { QZ.jaf.ping(); } catch (e) { } }, 20000);

    QZ.render();

    // 刷新后恢复登录态
    try {
      var last = sessionStorage.getItem(SESSION);
      if (last) {
        var u0 = QZ.data.users.filter(function (x) { return x.username === last && x.active; })[0];
        if (u0) {
          QZ.user = u0;
          document.getElementById('login').classList.add('hidden');
          document.getElementById('app').classList.remove('hidden');
          QZ.render();
          QZ.maybeAutoSync();   // 刷新后同样触发每日首次自动同步
        }
      }
    } catch (e) { }

    // 每 30 分钟检查一次：跨天则自动同步（页面常开场景）
    setInterval(function () { if (QZ.user) QZ.maybeAutoSync(); }, 30 * 60 * 1000);

    // PWA 安装提示
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferred = e;
      var b = document.getElementById('installBtn'); b.classList.remove('hidden');
      b.addEventListener('click', function () {
        deferred.prompt();
        deferred.userChoice.then(function () { b.classList.add('hidden'); });
      });
    });
  });

  global.QZ = QZ;
})(window);
