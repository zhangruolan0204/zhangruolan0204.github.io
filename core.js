/* =======================================================
   core.js · 框架内核：登录 / 权限 / 路由 / 存储 / 通用组件
   ======================================================= */
(function (global) {
  'use strict';

  var D = global.QZ_DATA;
  var KEY = 'qz2027_workbench_v3';
  var SESSION = 'qz2027_session_v3';

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
  QZ.go = function (id) {
    if (!id) return;
    QZ.page = id;
    try {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').style.display = 'none';
    } catch (e) { }
    QZ.render();
    try { window.scrollTo(0, 0); } catch (e) { }
  };

  /* 菜单点击入口（内联 onclick 走这条），打标记避免与事件委托重复渲染一次 */
  QZ.navGo = function (e, id) {
    if (e) {
      if (e.preventDefault) { try { e.preventDefault(); } catch (err) { } }
      e.__qzNav = 1;
    }
    QZ.go(id);
    return false;
  };

  QZ.render = function () {
    if (!QZ.user) return;
    var nav = document.getElementById('nav');
    nav.innerHTML = QZ.pages.map(function (p) {
      var badge = p.badge ? p.badge() : '';
      /* 双保险：内联 onclick + data-page 事件委托，任一可用都能切换模块 */
      return '<button class="nav-item' + (p.id === QZ.page ? ' active' : '') + '" data-page="' + p.id + '" onclick="QZ.navGo(event,\'' + p.id + '\')">' +
        QZ.shin(p.icon, 34) +
        '<span class="nav-text"><strong>' + p.name + '</strong><span>' + p.sub + '</span></span>' +
        (badge ? '<span class="nav-badge">' + badge + '</span>' : '') + '</button>';
    }).join('');

    if (!QZ.page && QZ.pages[0]) QZ.page = QZ.pages[0].id;   // 首次进入默认高亮第一个模块
    var p = QZ.pages.filter(function (x) { return x.id === QZ.page; })[0] || QZ.pages[0];
    document.getElementById('pageTitle').textContent = p.name;
    document.getElementById('pageDesc').textContent = p.sub;
    document.getElementById('content').innerHTML = p.render();

    var u = QZ.user;
    document.getElementById('roleChip').innerHTML = QZ.tiny(u.role === 'admin' ? 'shield' : 'user', 14) +
      (u.role === 'admin' ? '超级管理员' : '只读账号');
    document.getElementById('sideUser').innerHTML =
      QZ.shin(u.role === 'admin' ? 'shield' : 'user', 30) +
      '<div><div class="su-name">' + QZ.esc(u.name) + '</div><div class="su-role">' +
      (u.role === 'admin' ? '超级管理员 · 全站可管理' : '普通账号 · 仅查看') + '</div></div>';
    var fs = document.getElementById('footSync');
    if (fs) fs.textContent = QZ.data.sync.lastSync ? '最近同步：' + QZ.data.sync.lastSync : '尚未同步飞书文档';
  };

  /* ---------------- 飞书多维表格同步引擎 ---------------- */
  var DEFAULT_SOURCE = 'https://yal2at57cvq.feishu.cn/base/GtSLbyyR3aCENOsJYC6cdlsVnih?table=tblH4au5rnBcqHgJ&view=vew8PFC7nG';

  /* 字段映射：飞书多维表格列名 → 工作台标准字段（中英文/常见别名全覆盖） */
  var FIELD_MAP = {
    company: ['company', '企业名称', '企业', '公司', '公司名称', '单位名称', '招聘企业', '公司/单位'],
    position: ['position', '岗位名称', '岗位', '职位', '招聘职位', '岗位方向', '投递岗位'],
    category: ['category', '岗位类别', '方向', '类别', '岗位类型', '投递方向', '岗位大类'],
    city: ['city', '工作地点', '城市', '地点', '工作城市', 'base', '所在城市'],
    status: ['status', '投递状态', '状态', '当前状态', '进度', '流程状态'],
    channel: ['channel', '投递渠道', '渠道', '来源', '投递方式'],
    referrer: ['referrer', '内推人', '推荐人', '内推码', '内推', '内推链接'],
    link: ['link', '投递链接', '链接', '原文链接', '岗位链接', 'url', '详情链接'],
    appliedAt: ['appliedAt', '投递时间', '投递日期', '日期', '开始时间', '开放时间'],
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
    rows.forEach(function (r) {
      if (!(r.company || r.position || r.title || r.name || r.examAt)) return;
      var key = itemKeyOf(ckey, r);
      var exist = null;
      for (var i = 0; i < list.length; i++) {
        if (itemKeyOf(ckey, list[i]) === key) { exist = list[i]; break; }
      }
      var item = buildItem(ckey, r);
      if (exist) {
        if (mode === 'overwrite') {
          Object.keys(item).forEach(function (k) { exist[k] = item[k]; });
          exist.id = exist.id || item.id;
          updated++;
        }
      } else {
        list.push(item); added++;
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
    s.src = 'vendor/xlsx.full.min.js?v=22';
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
  QZ.actions = {};

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
