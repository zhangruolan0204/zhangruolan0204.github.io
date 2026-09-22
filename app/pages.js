/* =======================================================
   pages.js · 侧边栏 10 大模块页面 + 数据集合定义
   ======================================================= */
(function (g) {
  'use strict';
  var QZ = g.QZ, D = g.QZ_DATA;
  var esc = QZ.esc, shin = QZ.shin, tiny = QZ.tiny;

  /* =============== 集合定义（字段 / 表单） =============== */
  var CHANNELS = ['官网投递', '内推', '宣讲会', '校园招聘会', '招聘APP', '其他'];

  QZ.collections = {
    jobs: {
      key: 'jobs', name: '岗位投递', tip: '记录每一个投递对象，支持后续标记进度与筛选',
      fields: [
        { key: 'company', label: '企业名称*', ph: '如：华为技术有限公司' },
        { key: 'position', label: '岗位名称*', ph: '如：软件测试工程师' },
        { key: 'category', label: '岗位类别', type: 'select', options: D.CATEGORIES },
        { key: 'city', label: '工作城市', ph: '如：成都' },
        { key: 'channel', label: '投递渠道', type: 'select', options: CHANNELS },
        { key: 'referrer', label: '内推人', ph: '如：学长 李明' },
        { key: 'appliedAt', label: '投递时间', type: 'date' },
        { key: 'status', label: '当前状态', type: 'select', options: D.JOB_STATUS, def: '已投递' },
        { key: 'salary', label: '薪资范围', ph: '如：16K×15' },
        { key: 'link', label: '投递链接', ph: 'https://' },
        { key: 'remark', label: '备注 / 跟进要点', type: 'textarea', full: true }
      ],
      defaults: function () { return { appliedAt: QZ.today(), status: '已投递', category: '软件测试' }; }
    },
    exams: {
      key: 'exams', name: '笔试场次', tip: '账号密码、准考证、真题链接集中管理，避免临场手忙脚乱',
      fields: [
        { key: 'company', label: '企业*' },
        { key: 'position', label: '岗位' },
        { key: 'examAt', label: '笔试时间', ph: '2026-09-22 19:00' },
        { key: 'platform', label: '考试平台', ph: '牛客网 / 赛码 / 智鼎' },
        { key: 'account', label: '登录账号' },
        { key: 'password', label: '登录密码' },
        { key: 'admission', label: '准考证信息' },
        { key: 'room', label: '考场 / 形式', ph: '线上（摄像头监考）' },
        { key: 'status', label: '状态', type: 'select', options: ['待参加', '已完成', '已错过'], def: '待参加' },
        { key: 'realLink', label: '真题 / 入口链接' },
        { key: 'prepare', label: '备考记录', type: 'textarea', full: true },
        { key: 'notes', label: '错题笔记', type: 'textarea', full: true }
      ],
      defaults: function () { return { status: '待参加' }; }
    },
    interviews: {
      key: 'interviews', name: '面试记录', tip: '轮次、面试官、复盘与高频问题一条链追踪',
      fields: [
        { key: 'company', label: '企业*' },
        { key: 'position', label: '岗位' },
        { key: 'round', label: '轮次', ph: '如：二面（主管面）' },
        { key: 'time', label: '面试时间', ph: '2026-09-21 15:00' },
        { key: 'mode', label: '形式', type: 'select', options: ['线上', '线下', '电话'], def: '线上' },
        { key: 'status', label: '状态', type: 'select', options: ['待参加', '已完成', '已结束'], def: '待参加' },
        { key: 'interviewer', label: '面试官' },
        { key: 'contact', label: '联系方式 / 会议号' },
        { key: 'place', label: '地点 / 平台' },
        { key: 'result', label: '结果', type: 'select', options: ['待进行', '通过', '未通过', '待复盘'], def: '待进行' },
        { key: 'review', label: '面试复盘', type: 'textarea', full: true },
        { key: 'questions', label: '高频问题记录（用 | 分隔）', type: 'textarea', full: true }
      ],
      defaults: function () { return { status: '待参加', mode: '线上' }; }
    },
    resumes: {
      key: 'resumes', name: '简历版本', tip: '一岗一版，记录每次修改与适配方向',
      fields: [
        { key: 'name', label: '版本名称*', ph: '如：V2 · 软件测试专项版' },
        { key: 'target', label: '适配岗位方向' },
        { key: 'version', label: '版本号', ph: 'v2.3' },
        { key: 'updatedAt', label: '更新日期', type: 'date' },
        { key: 'link', label: '网盘 / 在线链接' },
        { key: 'highlight', label: '核心亮点', type: 'textarea', full: true },
        { key: 'note', label: '优化备注', type: 'textarea', full: true }
      ],
      defaults: function () { return { updatedAt: QZ.today() }; }
    },
    questions: {
      key: 'questions', name: '题目', tip: '按方向分类维护，标记掌握状态与错题',
      fields: [
        { key: 'category', label: '分类', type: 'select', options: ['软件测试', '算法', '计算机基础', '专业基础', '面试真题', '运维/技术支持'], def: '软件测试' },
        { key: 'difficulty', label: '难度', type: 'select', options: ['简单', '中等', '困难'], def: '中等' },
        { key: 'title', label: '题目*', type: 'textarea', full: true },
        { key: 'answer', label: '参考答案 / 思路', type: 'textarea', full: true },
        { key: 'note', label: '错因 / 拓展', type: 'textarea', full: true }
      ],
      defaults: function () { return { difficulty: '中等', category: '软件测试' }; }
    },
    offers: {
      key: 'offers', name: 'Offer', tip: '多维度打分，横向对比后再做决定',
      fields: [
        { key: 'company', label: '企业*' },
        { key: 'position', label: '岗位' },
        { key: 'city', label: '城市' },
        { key: 'salary', label: '薪资包', ph: '16K×15薪' },
        { key: 'workHour', label: '工时/强度' },
        { key: 'hukou', label: '落户政策' },
        { key: 'penalty', label: '违约金' },
        { key: 'onboardAt', label: '入职时间', type: 'date' },
        { key: 'score.salary', label: '薪资评分(0-10)', type: 'number' },
        { key: 'score.city', label: '城市评分(0-10)', type: 'number' },
        { key: 'score.hour', label: '工时评分(0-10)', type: 'number' },
        { key: 'score.hukou', label: '落户评分(0-10)', type: 'number' },
        { key: 'score.growth', label: '成长评分(0-10)', type: 'number' },
        { key: 'score.welfare', label: '福利评分(0-10)', type: 'number' },
        { key: 'welfare', label: '福利待遇', type: 'textarea', full: true },
        { key: 'growth', label: '发展空间', type: 'textarea', full: true },
        { key: 'pros', label: '优势', type: 'textarea', full: true },
        { key: 'cons', label: '劣势 / 风险', type: 'textarea', full: true }
      ],
      defaults: function () { return {}; },
      expand: function (it) {
        var o = {}; Object.keys(it).forEach(function (k) { o[k] = it[k]; });
        ['salary', 'city', 'hour', 'hukou', 'growth', 'welfare'].forEach(function (k) {
          o['score.' + k] = (it.score && it.score[k]) || 0;
        });
        return o;
      },
      build: function (v) {
        var o = {}; Object.keys(v).forEach(function (k) { o[k] = v[k]; });
        o.score = {
          salary: +v['score.salary'] || 0, city: +v['score.city'] || 0, hour: +v['score.hour'] || 0,
          hukou: +v['score.hukou'] || 0, growth: +v['score.growth'] || 0, welfare: +v['score.welfare'] || 0
        };
        ['score.salary', 'score.city', 'score.hour', 'score.hukou', 'score.growth', 'score.welfare'].forEach(function (k) { delete o[k]; });
        return o;
      }
    },
    todos: {
      key: 'todos', name: '待办事项', tip: '所有秋招动作收进一个清单，按优先级推进',
      fields: [
        { key: 'title', label: '事项*' },
        { key: 'deadline', label: '截止时间', type: 'date' },
        { key: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'], def: '中' },
        { key: 'type', label: '类型', type: 'select', options: ['投递', '笔试', '面试', '简历', '资源', '同步', '学习', '其他'], def: '其他' },
        { key: 'note', label: '备注', type: 'textarea', full: true }
      ],
      defaults: function () { return { deadline: QZ.today(), priority: '中' }; }
    },
    resources: {
      key: 'resources', name: '资源', tip: '内推、官网、学习资料、工具与面经统一存档',
      fields: [
        { key: 'name', label: '资源名称*' },
        { key: 'category', label: '分类', type: 'select', options: ['内推渠道', '招聘官网', '学习资料', '工具链接', '面试经验', '转行资源'], def: '学习资料' },
        { key: 'url', label: '链接' },
        { key: 'tag', label: '标签' },
        { key: 'desc', label: '说明', type: 'textarea', full: true }
      ],
      defaults: function () { return { category: '学习资料' }; }
    }
  };

  /* =============== 通用动作 =============== */
  QZ.setFilter = function (page, key, val) {
    QZ.filters[page] = QZ.filters[page] || {};
    QZ.filters[page][key] = val;
    QZ.render();
  };
  QZ.actions.jobStatus = function (id, val) {
    if (!QZ.canEdit()) { QZ.toast('只读账号不可修改'); QZ.render(); return; }
    var it = QZ.data.jobs.filter(function (x) { return x.id === id; })[0];
    if (it) { it.status = val; QZ.save(); QZ.render(); QZ.toast('状态已更新为「' + val + '」'); }
  };
  QZ.actions.todoToggle = function (id) {
    if (!QZ.canEdit()) { QZ.toast('只读账号不可修改'); QZ.render(); return; }
    QZ.toggle('todos', id, 'done');
  };
  QZ.actions.qMaster = function (id) {
    if (!QZ.canEdit()) { QZ.toast('只读账号不可修改'); QZ.render(); return; }
    QZ.toggle('questions', id, 'mastered');
  };
  QZ.actions.qWrong = function (id) {
    if (!QZ.canEdit()) { QZ.toast('只读账号不可修改'); QZ.render(); return; }
    QZ.toggle('questions', id, 'wrong');
  };

  function editBtn(c, id) {
    return '<button class="btn btn-ghost btn-sm" onclick="QZ.openEdit(\'' + c + '\',\'' + id + '\')">' + tiny('edit', 13) + '编辑</button>';
  }
  function delBtn(c, id) {
    return '<button class="btn btn-danger btn-sm" onclick="QZ.remove(\'' + c + '\',\'' + id + '\')">' + tiny('trash', 13) + '删除</button>';
  }
  function addBtn(c, text) {
    return '<button class="btn btn-primary btn-sm" onclick="QZ.openCreate(\'' + c + '\')">' + tiny('plus', 13) + (text || '新增') + '</button>';
  }
  function statusChip(s) {
    var cls = { '已Offer': 'green', '面试中': 'blue', '笔试中': 'yellow', '简历筛选': '', '已投递': '', '待投递': 'gray', '已结束': 'red' }[s] || 'gray';
    return '<span class="chip ' + cls + '">' + esc(s) + '</span>';
  }
  function priChip(p) {
    var cls = p === '高' ? 'red' : (p === '中' ? 'yellow' : 'gray');
    return '<span class="chip ' + cls + '">' + esc(p) + '</span>';
  }
  function linkBtn(url) {
    if (!url) return '<span style="color:var(--muted)">—</span>';
    return '<a class="btn btn-soft btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + tiny('link', 13) + '打开</a>';
  }

  /* =============== 1. 首页总览 =============== */
  function pageDashboard() {
    var j = QZ.data.jobs, e = QZ.data.exams, iv = QZ.data.interviews, t = QZ.data.todos, o = QZ.data.offers;
    var doing = j.filter(function (x) { return ['已投递', '简历筛选', '笔试中', '面试中'].indexOf(x.status) >= 0; });
    var undone = t.filter(function (x) { return !x.done; });
    var examTodo = e.filter(function (x) { return x.status === '待参加'; });
    var ivTodo = iv.filter(function (x) { return x.status === '待参加'; });

    // 倒计时
    var events = [];
    examTodo.forEach(function (x) { events.push({ t: x.examAt, type: '笔试', name: x.company + ' · ' + x.position, icon: 'exam' }); });
    ivTodo.forEach(function (x) { events.push({ t: x.time, type: '面试', name: x.company + ' · ' + x.round, icon: 'interview' }); });
    undone.forEach(function (x) { events.push({ t: x.deadline, type: '待办', name: x.title, icon: 'todo' }); });
    events = events.filter(function (x) { return x.t; }).map(function (x) {
      x.d = QZ.daysLeft(x.t); return x;
    }).filter(function (x) { return x.d !== null && x.d >= -1; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 6);

    // 状态分布
    var dist = {};
    D.JOB_STATUS.forEach(function (s) { dist[s] = j.filter(function (x) { return x.status === s; }).length; });

    // 类别分布
    var cat = {};
    j.forEach(function (x) { cat[x.category] = (cat[x.category] || 0) + 1; });

    // 近期动态
    var feed = [];
    j.forEach(function (x) { if (x.appliedAt) feed.push({ t: x.appliedAt, txt: '投递 ' + x.company + ' · ' + x.position, tag: x.status, icon: 'job' }); });
    iv.forEach(function (x) { if (x.time) feed.push({ t: x.time.slice(0, 10), txt: x.company + ' ' + x.round + '（' + x.result + '）', tag: x.status, icon: 'interview' }); });
    e.forEach(function (x) { if (x.examAt) feed.push({ t: x.examAt.slice(0, 10), txt: x.company + ' 在线笔试', tag: x.status, icon: 'exam' }); });
    o.forEach(function (x) { feed.push({ t: x.onboardAt ? x.onboardAt.slice(0, 10) : '', txt: x.company + ' Offer（' + x.salary + '）', tag: '已Offer', icon: 'offer' }); });
    feed = feed.filter(function (x) { return x.t; }).sort(function (a, b) { return a.t < b.t ? 1 : -1; }).slice(0, 8);

    // 智能建议
    var tips = [];
    var soon = events.filter(function (x) { return x.d >= 0 && x.d <= 3; });
    if (soon.length) tips.push('未来 3 天有 ' + soon.length + ' 项安排（' + soon[0].type + '：' + soon[0].name + '），优先准备，别再铺新投递。');
    else tips.push('近 3 天无紧急安排，是补充投递的窗口期：建议每天新增 2~3 个岗位，主攻软件测试 + 电子信息类。');
    var needReview = iv.filter(function (x) { return x.result === '待复盘' || (x.status === '已完成' && !x.review); });
    if (needReview.length) tips.push('有 ' + needReview.length + ' 场面试尚未复盘，48 小时内补齐复盘，否则问题会重复踩。');
    var wrong = QZ.data.questions.filter(function (x) { return x.wrong; });
    if (wrong.length) tips.push('题库中 ' + wrong.length + ' 道错题待消化，本周目标：错题重做一遍，重点攻克 ' + (wrong[0] ? wrong[0].title.slice(0, 14) : '') + '…');
    if (dist['待投递'] > 0) tips.push('还有 ' + dist['待投递'] + ' 个岗位处于「待投递」，简历切换对应版本后尽快投出。');

    var html = '<div class="grid grid-4" style="margin-bottom:14px">' +
      QZ.statCard(j.length, '累计投递岗位', '进行中 ' + doing.length + ' 个 · Offer ' + o.length + ' 个', 'job') +
      QZ.statCard(examTodo.length, '待参加笔试', '共收录 ' + e.length + ' 场笔试安排', 'exam') +
      QZ.statCard(ivTodo.length, '待参加面试', '共记录 ' + iv.length + ' 场面试', 'interview') +
      QZ.statCard(undone.length, '未完成待办', '今日需处理 ' + undone.filter(function (x) { return QZ.daysLeft(x.deadline) === 0; }).length + ' 项', 'todo') +
      '</div>';

    html += '<div class="grid grid-2" style="margin-bottom:14px">';
    // 倒计时卡片
    html += QZ.card({
      icon: 'clock', title: '待办倒计时', desc: '笔试、面试与待办按截止时间排序，临近 3 天内红色预警',
      body: events.length ? '<div class="list">' + events.map(function (x) {
        return '<div class="list-item"><div style="flex:0 0 34px">' + shin(x.icon, 34) + '</div>' +
          '<div class="li-main"><div class="li-title">' + esc(x.name) + ' ' + QZ.ddl(x.t) + '</div>' +
          '<div class="li-sub">' + x.type + ' · ' + esc(x.t) + '</div></div></div>';
      }).join('') + '</div>' : QZ.empty('暂无临近安排')
    });
    // 状态分布
    html += QZ.card({
      icon: 'chart', title: '投递状态分布', desc: '一眼看清每个阶段的岗位数量，避免卡在某一环',
      body: '<div class="list">' + D.JOB_STATUS.map(function (s) {
        var n = dist[s], pct = j.length ? Math.round(n / j.length * 100) : 0;
        return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px">' +
          '<span>' + s + '</span><b style="color:var(--teal-dark)">' + n + ' 个 · ' + pct + '%</b></div>' +
          '<div class="progress"><i style="width:' + pct + '%"></i></div></div>';
      }).join('') + '</div>'
    });
    html += '</div>';

    html += '<div class="grid grid-2" style="margin-bottom:14px">';
    html += QZ.card({
      icon: 'flag', title: '近期动态', desc: '按时间倒序汇总投递、笔试、面试与 Offer 进展',
      body: '<div class="timeline">' + feed.map(function (x) {
        return '<div class="tl-item"><div class="tl-title">' + esc(x.txt) + ' ' + statusChip(x.tag) + '</div>' +
          '<div class="tl-sub">' + esc(x.t) + '</div></div>';
      }).join('') + '</div>'
    });
    html += QZ.card({
      icon: 'target', title: '本周行动建议', desc: '根据当前数据自动生成，照着执行即可',
      body: '<div class="list">' + tips.map(function (t, i) {
        return '<div class="list-item"><div style="flex:0 0 28px;color:var(--teal-dark);font-weight:700">' + (i + 1) + '</div>' +
          '<div class="li-main"><div class="li-sub" style="color:var(--text-2);font-size:12.5px">' + esc(t) + '</div></div></div>';
      }).join('') + '</div>' +
        '<div class="note">电子信息类同学转软件测试的核心打法：把「硬件测试/可靠性实验」包装成测试思维，用 pytest/JMeter 项目补齐工程能力，简历与面试都讲这条主线。</div>'
    });
    html += '</div>';

    html += QZ.card({
      icon: 'route', title: '投递方向分布', desc: '主攻软件测试，兼顾电子信息类本专业与转行适配岗位',
      body: '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">' +
        Object.keys(cat).map(function (k) {
          return '<div class="sub-card"><div style="display:flex;align-items:center;gap:8px">' + shin(k === '软件测试' ? 'exam' : (k === '电子信息类' ? 'target' : 'route'), 30) +
            '<div><div style="font-size:13px;font-weight:600">' + esc(k) + '</div><div style="font-size:11.5px;color:var(--muted)">' + cat[k] + ' 个岗位</div></div></div></div>';
        }).join('') + '</div>'
    });
    return html;
  }

  /* =============== 2. 岗位投递库 =============== */
  function pageJobs() {
    var f = QZ.filters.jobs || (QZ.filters.jobs = { status: '', category: '', kw: '' });
    var list = QZ.data.jobs.filter(function (x) {
      if (f.status && x.status !== f.status) return false;
      if (f.category && x.category !== f.category) return false;
      if (f.kw && (x.company + x.position + x.city + (x.remark || '')).indexOf(f.kw) < 0) return false;
      return true;
    });
    var n = QZ.data.jobs.length;
    var cnt = function (s) { return QZ.data.jobs.filter(function (x) { return x.status === s; }).length; };

    var html = '<div class="grid grid-4" style="margin-bottom:14px">' +
      QZ.statCard(n, '投递总数', '覆盖 ' + new Set(QZ.data.jobs.map(function (x) { return x.company; })).size + ' 家企业', 'job') +
      QZ.statCard(cnt('笔试中') + cnt('面试中'), '流程推进中', '笔试 ' + cnt('笔试中') + ' · 面试 ' + cnt('面试中'), 'sync') +
      QZ.statCard(cnt('已Offer'), '已获 Offer', OfferSalary(), 'offer') +
      QZ.statCard(cnt('已结束') + cnt('待投递'), '待投 / 结束', '及时补投，保持每日 2 个', 'flag') +
      '</div>';

    html += QZ.card({
      icon: 'job', title: '岗位投递库', desc: '企业、岗位、方向、渠道、内推、状态全字段记录，支持筛选与进度标记',
      tools: addBtn('jobs', '新增岗位'),
      body: '<div class="filters" style="margin-bottom:12px">' +
        '<label>状态</label><select onchange="QZ.setFilter(\'jobs\',\'status\',this.value)">' +
        '<option value="">全部</option>' + D.JOB_STATUS.map(function (s) {
          return '<option' + (f.status === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('') + '</select>' +
        '<label>方向</label><select onchange="QZ.setFilter(\'jobs\',\'category\',this.value)">' +
        '<option value="">全部</option>' + D.CATEGORIES.map(function (s) {
          return '<option' + (f.category === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('') + '</select>' +
        '<input placeholder="搜索企业 / 岗位 / 城市" value="' + esc(f.kw) + '" onchange="QZ.setFilter(\'jobs\',\'kw\',this.value)">' +
        '<span class="chip">共 ' + list.length + ' 条</span></div>' +
        QZ.table(['企业', '岗位 / 方向', '城市', '渠道 / 内推', '投递时间', '状态（可切换）', '薪资', '备注', '操作'],
          list.map(function (x) {
            return '<tr><td class="nowrap"><b>' + esc(x.company) + '</b><br>' + linkBtn(x.link) + '</td>' +
              '<td>' + esc(x.position) + '<br><span class="tag">' + esc(x.category) + '</span></td>' +
              '<td class="nowrap">' + esc(x.city) + '</td>' +
              '<td>' + esc(x.channel) + (x.referrer ? '<br><span class="tag">内推：' + esc(x.referrer) + '</span>' : '') + '</td>' +
              '<td class="nowrap">' + esc(x.appliedAt) + '</td>' +
              '<td><select class="chip" style="border:1px solid var(--border);background:#fff" onchange="QZ.act(\'jobStatus\',\'' + x.id + '\',this.value)">' +
              D.JOB_STATUS.map(function (s) { return '<option' + (x.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
              '<td class="nowrap">' + esc(x.salary || '—') + '</td>' +
              '<td style="max-width:220px">' + esc(x.remark || '—') + '</td>' +
              '<td class="nowrap">' + editBtn('jobs', x.id) + ' ' + delBtn('jobs', x.id) + '</td></tr>';
          }))
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'route', title: '投递渠道优先级模板', desc: '内推 > 宣讲会 > 官网 > APP，效率差异明显',
        body: '<div class="list">' +
          ['内推（最优先）：学长学姐 / 脉脉 / 牛客内推码，简历直达 HR，可查进度',
            '宣讲会 & 校园招聘会：当场投简历，部分企业免简历筛选直通笔试',
            '官网投递：信息最全、JD 权威，注意记录岗位编号便于后续查询',
            '招聘 APP（BOSS 直聘 / 猎聘）：适合中小厂，注意核验公司资质'].map(function (t, i) {
              return '<div class="list-item"><div style="flex:0 0 26px;color:var(--teal-dark);font-weight:700">' + (i + 1) + '</div>' +
                '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) +
      QZ.card({
        icon: 'target', title: '状态流转说明', desc: '统一口径，避免统计混乱',
        body: '<div class="timeline">' +
          ['待投递', '已投递', '简历筛选', '笔试中', '面试中', '已Offer', '已结束'].map(function (s, i, arr) {
            return '<div class="tl-item"><div class="tl-title">' + statusChip(s) + '</div>' +
              '<div class="tl-sub">' + ['已锁定目标，等待投出', '简历已提交，等待筛选', 'HR 已查看简历', '收到笔试通知', '进入面试轮次', '拿到意向书', '流程终止（挂/主动放弃）'][i] + '</div></div>';
          }).join('') + '</div>'
      }) + '</div>';
    return html;
  }
  function OfferSalary() {
    var o = QZ.data.offers;
    return o.length ? '最高 ' + (o.map(function (x) { return x.salary; })[0] || '—') : '继续加油';
  }

  /* =============== 3. 笔试管理 =============== */
  function pageExams() {
    var list = QZ.data.exams.slice().sort(function (a, b) { return (a.examAt || '') < (b.examAt || '') ? -1 : 1; });
    var todo = list.filter(function (x) { return x.status === '待参加'; }).length;

    var html = '<div class="grid grid-3" style="margin-bottom:14px">' +
      QZ.statCard(list.length, '笔试场次', '待参加 ' + todo + ' 场', 'exam') +
      QZ.statCard((function () {
        var d = list.filter(function (x) { return x.status === '待参加'; }).map(function (x) { return QZ.daysLeft(x.examAt); }).filter(function (x) { return x !== null && x >= 0; });
        return d.length ? Math.min.apply(null, d) : '—';
      })(), '最近笔试倒计时（天）', '提前 15 分钟调试环境', 'clock') +
      QZ.statCard(list.filter(function (x) { return x.notes && x.notes.trim(); }).length, '已整理错题笔记', '考前必看重做一遍', 'book') +
      '</div>';

    html += QZ.card({
      icon: 'exam', title: '笔试场次管理', desc: '时间、平台、账号密码、准考证、真题链接与错题笔记一站收纳',
      tools: addBtn('exams', '新增笔试'),
      body: '<div class="grid grid-2">' + list.map(function (x) {
        return '<div class="sub-card" style="background:#fff;border:1px solid var(--border)">' +
          '<div style="display:flex;align-items:flex-start;gap:10px">' + shin('exam', 40) +
          '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">' + esc(x.company) + ' · ' + esc(x.position) + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:2px">' + esc(x.examAt) + ' · ' + esc(x.platform) + '</div></div>' +
          '<div>' + QZ.ddl(x.examAt) + '</div></div>' +
          '<dl class="kv" style="margin:10px 0 6px">' +
          '<dt>账号</dt><dd>' + esc(x.account || '—') + '</dd>' +
          '<dt>密码</dt><dd>' + esc(x.password || '—') + '</dd>' +
          '<dt>准考证</dt><dd>' + esc(x.admission || '—') + '</dd>' +
          '<dt>考场</dt><dd>' + esc(x.room || '—') + '</dd></dl>' +
          '<div style="font-size:12px;color:var(--text-2)"><b>备考：</b>' + esc(x.prepare || '—') + '</div>' +
          (x.notes ? '<div style="font-size:12px;color:var(--text-2);margin-top:4px"><b>错题笔记：</b>' + esc(x.notes) + '</div>' : '') +
          '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' + linkBtn(x.realLink) + editBtn('exams', x.id) + delBtn('exams', x.id) + '</div>' +
          '</div>';
      }).join('') + '</div>' + (list.length ? '' : QZ.empty('暂无笔试记录'))
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'check', title: '考前检查清单（每场照做）', desc: '减少非技术性失误',
        body: '<div class="list">' +
          ['提前 24h：确认平台账号可登录，密码复制到剪贴板',
            '提前 15min：打开监考客户端/摄像头，测试网络（建议有线或 5G 热点备用）',
            '环境：桌面只留浏览器与答题页，手机静音，准备身份证与学生证',
            '策略：先易后难，选择题不超过 40 秒/题，编程题先写思路注释再补实现',
            '结束后 30min：立刻录入错题笔记，趁记忆新鲜'].map(function (t) {
              return '<div class="list-item">' + tiny('check', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) +
      QZ.card({
        icon: 'book', title: '常见笔试平台与题型', desc: '按平台针对性准备',
        body: QZ.table(['平台', '常见题型', '注意点'], [
          '<tr><td>牛客网</td><td>选择题 + 算法编程（ACM 模式）</td><td>需处理输入输出，注意用例边界</td></tr>',
          '<tr><td>赛码网</td><td>行测 + 专业基础 + 编程</td><td>需提前调试编程环境</td></tr>',
          '<tr><td>智鼎 / 北森</td><td>性格测评 + 行测</td><td>答案前后一致，避免极端选项</td></tr>',
          '<tr><td>企业自建（华为/腾讯）</td><td>专业 + 性格 + 英语</td><td>邮件与短信双通道确认时间</td></tr>'
        ])
      }) + '</div>';
    return html;
  }

  /* =============== 4. 面试管理 =============== */
  function pageInterviews() {
    var list = QZ.data.interviews;
    var todo = list.filter(function (x) { return x.status === '待参加'; }).length;
    var qs = [];
    list.forEach(function (x) {
      (x.questions || '').split('|').forEach(function (q) { if (q.trim()) qs.push({ q: q.trim(), c: x.company }); });
    });
    var qTop = [];
    qs.forEach(function (x) { if (!qTop.filter(function (y) { return y.q === x.q; }).length) qTop.push(x); });

    var html = '<div class="grid grid-3" style="margin-bottom:14px">' +
      QZ.statCard(list.length, '面试场次', '待参加 ' + todo + ' 场', 'interview') +
      QZ.statCard(list.filter(function (x) { return x.result === '通过'; }).length, '已通过轮次', '未通过 ' + list.filter(function (x) { return x.result === '未通过'; }).length + ' 场，正常', 'check') +
      QZ.statCard(qTop.length, '高频问题沉淀', '来自 ' + list.length + ' 场面试记录', 'question') +
      '</div>';

    html += QZ.card({
      icon: 'interview', title: '面试进度追踪', desc: '轮次、时间、形式、面试官与结果全链路记录',
      tools: addBtn('interviews', '新增面试'),
      body: '<div class="grid grid-2">' + list.map(function (x) {
        return '<div class="sub-card" style="background:#fff;border:1px solid var(--border)">' +
          '<div style="display:flex;align-items:flex-start;gap:10px">' + shin('interview', 40) +
          '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">' + esc(x.company) + ' · ' + esc(x.round) + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:2px">' + esc(x.position) + ' · ' + esc(x.time) + '</div></div>' +
          '<div>' + QZ.ddl(x.time) + '</div></div>' +
          '<dl class="kv" style="margin:10px 0 6px">' +
          '<dt>形式</dt><dd>' + esc(x.mode) + ' · ' + esc(x.place || '—') + '</dd>' +
          '<dt>面试官</dt><dd>' + esc(x.interviewer || '—') + '</dd>' +
          '<dt>会议号</dt><dd>' + esc(x.contact || '—') + '</dd>' +
          '<dt>结果</dt><dd>' + statusChip(x.result) + ' ' + statusChip(x.status) + '</dd></dl>' +
          '<div style="font-size:12px;color:var(--text-2)"><b>复盘：</b>' + esc(x.review || '—') + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:10px">' + editBtn('interviews', x.id) + delBtn('interviews', x.id) + '</div>' +
          '</div>';
      }).join('') + '</div>' + (list.length ? '' : QZ.empty('暂无面试记录'))
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'question', title: '高频面试问题沉淀', desc: '从各场面试记录中自动汇总，按出现频率复习',
        body: qTop.length ? '<div class="list">' + qTop.map(function (x) {
          return '<div class="list-item">' + tiny('question', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text)">' + esc(x.q) + '</div>' +
            '<div class="li-sub">来源：' + esc(x.c) + '</div></div></div>';
        }).join('') + '</div>' : QZ.empty('暂无问题记录')
      }) +
      QZ.card({
        icon: 'star', title: '面试通用准备模板', desc: '每场面试前 30 分钟过一遍',
        body: '<div class="list">' +
          ['自我介绍（2 分钟）：学业背景 → 核心项目 → 为什么是这个岗位 → 为什么是你',
            '项目深挖（5 分钟）：背景、我的职责、技术难点、量化结果、复盘改进',
            '岗位认知：测试流程、缺陷管理、自动化框架，能讲出自己做过的落地细节',
            '反问环节（3 个）：团队技术栈？新人培养机制？转正考核标准？',
            '结束 1 小时内：填写复盘 + 录入高频问题，形成个人题库'].map(function (t, i) {
              return '<div class="list-item"><div style="flex:0 0 26px;color:var(--teal-dark);font-weight:700">' + (i + 1) + '</div>' +
                '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) + '</div>';
    return html;
  }

  /* =============== 5. 简历版本库 =============== */
  function pageResumes() {
    var list = QZ.data.resumes;
    var html = '<div class="grid grid-3" style="margin-bottom:14px">' +
      QZ.statCard(list.length, '简历版本', '一岗一版，避免一份简历投所有', 'resume') +
      QZ.statCard(list[0] ? list[0].version : '—', '主推版本号', list[0] ? list[0].name : '', 'star') +
      QZ.statCard(list.filter(function (x) { return (x.updatedAt || '') >= QZ.today().slice(0, 8) + '01'; }).length, '本月更新次数', '建议每周迭代一次', 'refresh') +
      '</div>';

    html += QZ.card({
      icon: 'resume', title: '多版本简历存档', desc: '不同岗位方向使用不同版本，记录每次优化点',
      tools: addBtn('resumes', '新增版本'),
      body: '<div class="grid grid-2">' + list.map(function (x) {
        return '<div class="sub-card" style="background:#fff;border:1px solid var(--border)">' +
          '<div style="display:flex;align-items:flex-start;gap:10px">' + shin('resume', 40) +
          '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">' + esc(x.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:2px">适配方向：' + esc(x.target) + ' · 更新于 ' + esc(x.updatedAt) + '</div></div></div>' +
          '<div style="font-size:12px;color:var(--text-2);margin-top:8px"><b>核心亮点：</b>' + esc(x.highlight || '—') + '</div>' +
          '<div style="font-size:12px;color:var(--text-2);margin-top:4px"><b>使用场景：</b>' + esc(x.note || '—') + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' + linkBtn(x.link) + editBtn('resumes', x.id) + delBtn('resumes', x.id) + '</div>' +
          '</div>';
      }).join('') + '</div>'
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'target', title: '岗位方向 × 简历版本 对照表', desc: '投递前查这张表，选对版本再投',
        body: QZ.table(['求职方向', '推荐版本', '简历重点'], [
          '<tr><td>软件测试 / 测试开发</td><td>V2 专项版 / V3 加强版</td><td>pytest 自动化、接口测试、缺陷管理、量化用例数</td></tr>',
          '<tr><td>电子信息类（硬件测试）</td><td>V1 通用版</td><td>电路与嵌入式课程设计、示波器、可靠性实验</td></tr>',
          '<tr><td>运维 / 技术支持</td><td>V1 + Linux 补充</td><td>Linux 命令、排障流程、Shell 脚本、沟通能力</td></tr>',
          '<tr><td>产品助理 / 数据助理</td><td>V4 转行版</td><td>需求分析、竞品调研、Axure 原型、Excel/数据处理</td></tr>'
        ])
      }) +
      QZ.card({
        icon: 'check', title: '简历自检清单（投出前必查）', desc: '10 条逐项打勾',
        body: '<div class="list">' +
          ['一页纸内，重点在上半页；PDF 格式，文件名「姓名-岗位-电话」',
            '所有经历 STAR 化（背景-任务-动作-结果），结果必须有数字',
            '岗位 JD 关键词覆盖：测试、自动化、pytest、接口、缺陷、性能',
            '不写「精通」，写「熟悉/掌握」并给出证据链接',
            '项目经历 2 个即可，与投递方向强相关',
            '技能栏前置，放在教育背景之前（应届生）',
            '检查错别字、时间线、联系方式是否正确',
            'PDF 文本可选中（非图片），ATS 系统可解析'].map(function (t) {
              return '<div class="list-item">' + tiny('check', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) + '</div>';
    return html;
  }

  /* =============== 6. 笔面试题库 =============== */
  function pageQuestions() {
    var f = QZ.filters.questions || (QZ.filters.questions = { cat: '' });
    var all = QZ.data.questions;
    var cats = ['软件测试', '算法', '计算机基础', '专业基础', '面试真题', '运维/技术支持'];
    var list = all.filter(function (x) { return !f.cat || x.category === f.cat; });
    var mastered = all.filter(function (x) { return x.mastered; }).length;
    var wrongs = all.filter(function (x) { return x.wrong; });

    var html = '<div class="grid grid-4" style="margin-bottom:14px">' +
      QZ.statCard(all.length, '题目总数', '已掌握 ' + mastered + ' 题（' + Math.round(mastered / all.length * 100) + '%）', 'question') +
      QZ.statCard(wrongs.length, '错题待消化', '本周目标：错题重做一遍', 'refresh') +
      QZ.statCard(all.filter(function (x) { return x.category === '算法'; }).length, '算法题', '每日 1 题，保持手感', 'target') +
      QZ.statCard(all.filter(function (x) { return x.category === '软件测试'; }).length, '软件测试题', '主攻方向，重点覆盖', 'exam') +
      '</div>';

    html += '<div class="grid grid-q" style="margin-bottom:14px">';
    html += QZ.card({
      icon: 'book', title: '笔面试题库', desc: '覆盖算法、计算机基础、专业基础、软件测试与真题，支持掌握/错题标记',
      tools: addBtn('questions', '新增题目'),
      body: '<div class="filters" style="margin-bottom:12px">' +
        '<button class="btn ' + (f.cat ? 'btn-ghost' : 'btn-primary') + ' btn-sm" onclick="QZ.setFilter(\'questions\',\'cat\',\'\')">全部</button>' +
        cats.map(function (c) {
          return '<button class="btn ' + (f.cat === c ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.setFilter(\'questions\',\'cat\',\'' + c + '\')">' + c + '</button>';
        }).join('') + '</div>' +
        '<div class="list">' + list.map(function (x) {
          return '<div class="sub-card" style="background:#fff;border:1px solid var(--border);padding:12px">' +
            '<div style="display:flex;gap:10px;align-items:flex-start">' + shin(x.category === '算法' ? 'target' : (x.category === '软件测试' ? 'exam' : 'question'), 36) +
            '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">' + esc(x.title) + '</div>' +
            '<div style="margin-top:4px">' + statusChip(x.category) + ' ' + statusChip(x.difficulty) +
            (x.mastered ? ' <span class="chip green">已掌握</span>' : '') + (x.wrong ? ' <span class="chip red">错题</span>' : '') + '</div></div>' +
            '<div style="display:flex;flex-direction:column;gap:4px">' +
            '<button class="btn ' + (x.mastered ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.act(\'qMaster\',\'' + x.id + '\')">掌握</button>' +
            '<button class="btn ' + (x.wrong ? 'btn-danger' : 'btn-ghost') + ' btn-sm" onclick="QZ.act(\'qWrong\',\'' + x.id + '\')">错题</button>' +
            '</div></div>' +
            '<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:var(--teal-dark)">查看参考答案 / 思路</summary>' +
            '<div style="font-size:12.5px;color:var(--text-2);line-height:1.9;padding-top:6px">' + esc(x.answer || '待补充') +
            (x.note ? '<br><b>备注：</b>' + esc(x.note) : '') + '</div></details>' +
            '<div style="display:flex;gap:6px;margin-top:8px">' + editBtn('questions', x.id) + delBtn('questions', x.id) + '</div>' +
            '</div>';
        }).join('') + '</div>' + (list.length ? '' : QZ.empty('该分类暂无题目'))
    });
    html += QZ.card({
      icon: 'refresh', title: '错题本', desc: '标记过的错题集中在这里，考前必看',
      body: wrongs.length ? '<div class="list">' + wrongs.map(function (x) {
        return '<div class="list-item">' + tiny('flag', 14, '#E4725F') + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text)">' + esc(x.title) + '</div>' +
          '<div class="li-sub">' + esc(x.category) + ' · ' + esc(x.note || '待补充错因') + '</div></div></div>';
      }).join('') + '</div>' : QZ.empty('暂无错题，保持！')
    });
    html += '</div>';

    html += QZ.card({
      icon: 'calendar', title: '每日刷题记录模板', desc: '复制下方格式，每天填一行到待办页，形成刷题节奏',
      body: '<div style="overflow-x:auto"><table style="min-width:560px"><thead><tr><th>日期</th><th>算法题</th><th>测试专业题</th><th>错题重做</th><th>用时</th><th>复盘一句话</th></tr></thead><tbody>' +
        ['2026-09-17|最长无重复子串|缺陷等级划分|LIS 二分|60min|DP 状态转移要写清楚',
          '2026-09-18|编辑距离|pytest fixture|TCP 握手状态|55min|错因：边界条件漏判',
          '2026-09-19|——|登录用例设计|数据库索引失效|40min|安全维度要主动补充'].map(function (r) {
            return '<tr>' + r.split('|').map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>' +
        '<div class="note">建议节奏：算法 1 题 + 专业 1 题，控制在 60 分钟内；错题每周日统一重做一次。</div>'
    });
    return html;
  }

  /* =============== 7. Offer 对比表 =============== */
  function pageOffers() {
    var list = QZ.data.offers;
    var dims = [['salary', '薪资'], ['city', '城市'], ['hour', '工时'], ['hukou', '落户'], ['growth', '成长'], ['welfare', '福利']];
    function total(x) {
      var s = x.score || {}, sum = 0;
      dims.forEach(function (d) { sum += (+s[d[0]] || 0); });
      return (sum / dims.length).toFixed(1);
    }
    var best = list.slice().sort(function (a, b) { return total(b) - total(a); })[0];

    var html = '<div class="grid grid-3" style="margin-bottom:14px">' +
      QZ.statCard(list.length, 'Offer 数量', '建议 3~4 个再决策', 'offer') +
      QZ.statCard(best ? total(best) : '—', '最高综合评分', best ? best.company : '暂无', 'star') +
      QZ.statCard(list.filter(function (x) { return x.city === '成都'; }).length, '成都本地 Offer', '优先本地，生活成本可控', 'pin') +
      '</div>';

    html += QZ.card({
      icon: 'offer', title: 'Offer 多维度对比', desc: '薪资、地点、工时、落户、违约金、福利、发展、入职时间横向对比',
      tools: addBtn('offers', '新增 Offer'),
      body: QZ.table(['对比维度'].concat(list.map(function (x) { return esc(x.company) + '<br>' + esc(x.position); })),
        [
          '<tr><td><b>综合评分</b></td>' + list.map(function (x) { return '<td><b style="color:var(--teal-dark);font-size:15px">' + total(x) + '</b> /10</td>'; }).join('') + '</tr>',
          '<tr><td>城市</td>' + list.map(function (x) { return '<td>' + esc(x.city) + '</td>'; }).join('') + '</tr>',
          '<tr><td>薪资包</td>' + list.map(function (x) { return '<td>' + esc(x.salary) + '</td>'; }).join('') + '</tr>',
          '<tr><td>工时 / 强度</td>' + list.map(function (x) { return '<td>' + esc(x.workHour) + '</td>'; }).join('') + '</tr>',
          '<tr><td>落户</td>' + list.map(function (x) { return '<td>' + esc(x.hukou) + '</td>'; }).join('') + '</tr>',
          '<tr><td>违约金</td>' + list.map(function (x) { return '<td>' + esc(x.penalty) + '</td>'; }).join('') + '</tr>',
          '<tr><td>福利</td>' + list.map(function (x) { return '<td>' + esc(x.welfare) + '</td>'; }).join('') + '</tr>',
          '<tr><td>发展空间</td>' + list.map(function (x) { return '<td>' + esc(x.growth) + '</td>'; }).join('') + '</tr>',
          '<tr><td>入职时间</td>' + list.map(function (x) { return '<td>' + esc(x.onboardAt) + '</td>'; }).join('') + '</tr>',
          '<tr><td>优势</td>' + list.map(function (x) { return '<td>' + esc(x.pros) + '</td>'; }).join('') + '</tr>',
          '<tr><td>劣势 / 风险</td>' + list.map(function (x) { return '<td>' + esc(x.cons) + '</td>'; }).join('') + '</tr>',
          '<tr><td>操作</td>' + list.map(function (x) { return '<td class="nowrap">' + editBtn('offers', x.id) + ' ' + delBtn('offers', x.id) + '</td>'; }).join('') + '</tr>'
        ])
    });

    html += '<div class="grid grid-2" style="margin-top:14px">';
    html += '<div class="grid" style="gap:14px">' + list.map(function (x) {
      return QZ.card({
        icon: 'star', title: x.company + ' · ' + total(x) + ' 分', desc: x.position + ' · ' + x.city + ' · ' + x.salary,
        body: dims.map(function (d) {
          var v = +((x.score || {})[d[0]] || 0);
          return '<div class="score-row"><span class="sr-name">' + d[1] + '</span><span class="sr-bar"><i style="width:' + (v * 10) + '%"></i></span><span class="sr-val">' + v + '</span></div>';
        }).join('') + '<div style="font-size:12px;color:var(--text-2);margin-top:8px"><b>优势：</b>' + esc(x.pros) + '</div>' +
          '<div style="font-size:12px;color:var(--text-2);margin-top:4px"><b>风险：</b>' + esc(x.cons) + '</div>'
      });
    }).join('') + '</div>';

    html += '<div class="grid" style="gap:14px">' +
      QZ.card({
        icon: 'target', title: '打分评估模板', desc: '每个维度 0-10 分，按个人权重换算总分',
        body: '<div class="list">' +
          ['薪资权重 25%：月包 + 年终 + 涨幅空间，别只看月薪',
            '城市权重 20%：是否成都本地、生活成本、离家距离',
            '工时权重 15%：常态加班强度、是否倒班、调休机制',
            '落户权重 10%：落户难度与人才补贴',
            '成长权重 20%：技术栈是否成体系、能否转测试开发',
            '福利权重 10%：五险一金基数、餐补住宿、违约金'].map(function (t) {
              return '<div class="list-item">' + tiny('star', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>' +
          '<div class="note">评分只是辅助，最终决策回到三个问题：① 三年后这份经历值多少钱？② 我能否接受它的工作节奏？③ 违约成本我承担得起吗？</div>'
      }) +
      QZ.card({
        icon: 'shield', title: '三方与违约注意事项', desc: '签字前逐条确认',
        body: '<div class="list">' +
          ['三方协议违约金一般在 3000~10000 元，签约前确认金额与解约流程',
            '确认薪资结构：月薪 × 发薪月数，年终是否保底，试用期是否打折',
            '确认工作地点与部门，避免「集团招聘、地方分配」的落差',
            '确认户口/档案/社保办理责任方与时间节点',
            'offer 邮件务必留存，作为后续凭证'].map(function (t) {
              return '<div class="list-item">' + tiny('check', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) + '</div>';
    html += '</div>';
    return html;
  }

  /* =============== 8. 日程待办 =============== */
  function pageTodos() {
    var f = QZ.filters.todos || (QZ.filters.todos = { view: 'all' });
    var all = QZ.data.todos;
    var list = all.filter(function (x) {
      if (f.view === 'todo') return !x.done;
      if (f.view === 'done') return x.done;
      if (f.view === 'today') { var d = QZ.daysLeft(x.deadline); return !x.done && d !== null && d <= 0; }
      if (f.view === 'week') { var w = QZ.daysLeft(x.deadline); return !x.done && w !== null && w <= 7; }
      return true;
    }).sort(function (a, b) {
      var pa = { '高': 0, '中': 1, '低': 2 }[a.priority], pb = { '高': 0, '中': 1, '低': 2 }[b.priority];
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (pa !== pb) return pa - pb;
      return (a.deadline || '') < (b.deadline || '') ? -1 : 1;
    });
    var undone = all.filter(function (x) { return !x.done; });
    var overdue = undone.filter(function (x) { var d = QZ.daysLeft(x.deadline); return d !== null && d < 0; });

    var html = '<div class="grid grid-4" style="margin-bottom:14px">' +
      QZ.statCard(all.length, '待办总数', '已完成 ' + (all.length - undone.length) + ' 项', 'todo') +
      QZ.statCard(undone.length, '未完成', '今日到期 ' + undone.filter(function (x) { return QZ.daysLeft(x.deadline) === 0; }).length + ' 项', 'flag') +
      QZ.statCard(overdue.length, '已逾期', '优先清理，避免滚雪球', 'bell') +
      QZ.statCard(all.length ? Math.round((all.length - undone.length) / all.length * 100) : 0, '完成率（%）', '保持每日清空当日清单', 'chart') +
      '</div>';

    html += QZ.card({
      icon: 'todo', title: '秋招全部待办', desc: '截止时间、优先级与完成情况统一追踪',
      tools: addBtn('todos', '新增待办'),
      body: '<div class="filters" style="margin-bottom:12px">' +
        [['all', '全部'], ['today', '今日'], ['week', '本周'], ['todo', '未完成'], ['done', '已完成']].map(function (v) {
          return '<button class="btn ' + (f.view === v[0] ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.setFilter(\'todos\',\'view\',\'' + v[0] + '\')">' + v[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="list">' + list.map(function (x) {
          return '<div class="list-item' + (x.done ? ' done' : '') + '">' +
            '<input type="checkbox" style="width:18px;height:18px;margin-top:2px" ' + (x.done ? 'checked' : '') + ' onchange="QZ.act(\'todoToggle\',\'' + x.id + '\')">' +
            '<div class="li-main"><div class="li-title">' + esc(x.title) + ' ' + priChip(x.priority) + ' <span class="tag">' + esc(x.type) + '</span> ' + QZ.ddl(x.deadline) + '</div>' +
            '<div class="li-sub">截止：' + esc(x.deadline) + (x.note ? ' · ' + esc(x.note) : '') + '</div></div>' +
            '<div style="display:flex;gap:4px">' + editBtn('todos', x.id) + delBtn('todos', x.id) + '</div></div>';
        }).join('') + '</div>' + (list.length ? '' : QZ.empty('该视图下暂无事项'))
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'calendar', title: '每日待办清单模板', desc: '每天早上 5 分钟排一次，照着执行',
        body: QZ.table(['时间段', '动作', '目标'], [
          '<tr><td>08:30</td><td>查看昨日状态变化（投递进度/新通知）</td><td>10 分钟，更新投递库状态</td></tr>',
          '<tr><td>09:00</td><td>新增投递 2~3 个岗位（内推优先）</td><td>保持每日投递量</td></tr>',
          '<tr><td>14:00</td><td>刷题：算法 1 题 + 专业 1 题</td><td>60 分钟内，错题录入题库</td></tr>',
          '<tr><td>19:30</td><td>笔试 / 面试（按日程）</td><td>提前 15 分钟进场</td></tr>',
          '<tr><td>21:30</td><td>复盘：填写面试复盘 + 明日计划</td><td>不留到第二天</td></tr>'
        ])
      }) +
      QZ.card({
        icon: 'bell', title: '待办管理原则', desc: '秋招是长跑，靠节奏不靠爆发',
        body: '<div class="list">' +
          ['优先级只分三档，高优先级每天不超过 3 条，否则等于没有优先级',
            '一件事预计 10 分钟内能做完的，立刻做，不进清单',
            '逾期事项要么当天补做，要么明确取消，不要一直挂着',
            '每周日晚上做一次周复盘：投递数、笔面数、转化率',
            '所有临时想法先进待办，避免打断当前任务'].map(function (t) {
              return '<div class="list-item">' + tiny('flag', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) + '</div>';
    return html;
  }

  /* =============== 9. 资源收藏夹 =============== */
  function pageResources() {
    var f = QZ.filters.resources || (QZ.filters.resources = { cat: '' });
    var cats = ['内推渠道', '招聘官网', '学习资料', '工具链接', '面试经验', '转行资源'];
    var list = QZ.data.resources.filter(function (x) { return !f.cat || x.category === f.cat; });

    var html = '<div class="grid grid-6" style="margin-bottom:14px">' +
      cats.map(function (c) {
        var n = QZ.data.resources.filter(function (x) { return x.category === c; }).length;
        return QZ.statCard(n, c, '点击查看', c === '内推渠道' ? 'team' : (c === '招聘官网' ? 'job' : (c === '学习资料' ? 'book' : (c === '工具链接' ? 'setting' : (c === '面试经验' ? 'star' : 'route')))));
      }).join('') + '</div>';

    html += QZ.card({
      icon: 'resource', title: '资源收藏夹', desc: '内推渠道、招聘官网、学习资料、工具链接、面经与转行资源分类存档',
      tools: addBtn('resources', '新增资源'),
      body: '<div class="filters" style="margin-bottom:12px">' +
        '<button class="btn ' + (f.cat ? 'btn-ghost' : 'btn-primary') + ' btn-sm" onclick="QZ.setFilter(\'resources\',\'cat\',\'\')">全部</button>' +
        cats.map(function (c) {
          return '<button class="btn ' + (f.cat === c ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.setFilter(\'resources\',\'cat\',\'' + c + '\')">' + c + '</button>';
        }).join('') + '</div>' +
        '<div class="grid grid-3">' + list.map(function (x) {
          return '<div class="sub-card" style="background:#fff;border:1px solid var(--border)">' +
            '<div style="display:flex;gap:9px;align-items:flex-start">' + shin(x.category === '内推渠道' ? 'team' : (x.category === '招聘官网' ? 'job' : (x.category === '学习资料' ? 'book' : (x.category === '工具链接' ? 'setting' : (x.category === '面试经验' ? 'star' : 'route')))), 36) +
            '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">' + esc(x.name) + '</div>' +
            '<div style="margin-top:3px">' + statusChip(x.category) + (x.tag ? ' <span class="tag">' + esc(x.tag) + '</span>' : '') + '</div></div></div>' +
            '<div style="font-size:12px;color:var(--text-2);margin-top:8px">' + esc(x.desc || '—') + '</div>' +
            '<div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap">' + linkBtn(x.url) + editBtn('resources', x.id) + delBtn('resources', x.id) + '</div>' +
            '</div>';
        }).join('') + '</div>' + (list.length ? '' : QZ.empty('该分类暂无资源'))
    });

    html += '<div class="grid grid-2" style="margin-top:14px">' +
      QZ.card({
        icon: 'team', title: '内推话术模板', desc: '礼貌、简短、降低对方成本',
        body: '<div class="note teal" style="line-height:1.9">学长/学姐您好，我是 XX 大学 27 届电子信息工程专业的小 X，看到您在 XX 公司做测试开发，想请教下贵司校招是否有内推名额。<br>我的简历已附上（一页 PDF），项目做过 pytest 接口自动化与 JMeter 性能测试，与 JD 中的自动化测试要求比较匹配。<br>如果您方便的话，能否帮我内推一下？不方便也没关系，非常感谢！</div>'
      }) +
      QZ.card({
        icon: 'cloud', title: '飞书共享文档协作', desc: '同学共建岗位表，每天同步一次',
        body: '<div class="list">' +
          ['飞书表格字段建议：企业 / 岗位 / 方向 / 城市 / 投递链接 / 截止时间 / 内推码 / 备注',
            '由 1 位同学维护，其他人只读评论，避免数据污染',
            '分享时开启「互联网上获得链接的人可阅读」，工作台才能自动拉取',
            '每天早上在设置中心点一次「飞书同步」，增量更新本地数据'].map(function (t) {
              return '<div class="list-item">' + tiny('sync', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">' + t + '</div></div></div>';
            }).join('') + '</div>'
      }) + '</div>';
    return html;
  }

  /* =============== 10. 设置中心 =============== */
  function pageSettings() {
    var u = QZ.user, s = QZ.data.sync;

    var accountCard = QZ.card({
      icon: 'lock', title: '账号与密码', desc: '当前登录：' + esc(u.name) + '（' + u.username + '）· ' + (u.role === 'admin' ? '超级管理员' : '普通只读账号'),
      body: '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-primary btn-sm" onclick="QZ.actions.changePwd()">修改我的密码</button>' +
        '<button class="btn btn-soft btn-sm" onclick="QZ.actions.logout()">退出登录</button>' +
        '</div>' +
        '<div class="note" style="margin-top:10px">密码保存在本机浏览器（localStorage），属于演示级前端鉴权；部署到公开环境时请务必修改默认密码。</div>'
    });

    var usersCard = QZ.card({
      icon: 'team', title: '超级管理员 · 账号权限面板', desc: '管理子账号、查看权限、控制同步权限（仅管理员可见可操作）',
      tools: QZ.canManage() ? '<button class="btn btn-primary btn-sm" onclick="QZ.actions.addUser()">新增子账号</button>' : '<span class="chip gray">只读</span>',
      body: QZ.table(['账号', '名称', '角色', '状态', '创建时间', '说明', '操作'],
        QZ.data.users.map(function (x) {
          return '<tr><td class="nowrap"><b>' + esc(x.username) + '</b></td><td>' + esc(x.name) + '</td>' +
            '<td>' + (x.role === 'admin' ? '<span class="chip">超级管理员</span>' : '<span class="chip gray">普通账号</span>') + '</td>' +
            '<td>' + (x.active ? '<span class="chip green">启用</span>' : '<span class="chip red">停用</span>') + '</td>' +
            '<td class="nowrap">' + esc(x.createdAt) + '</td><td>' + esc(x.note) + '</td>' +
            '<td class="nowrap">' + (QZ.canManage() ?
              '<button class="btn btn-ghost btn-sm" onclick="QZ.actions.toggleUser(\'' + x.username + '\')">' + (x.active ? '停用' : '启用') + '</button> ' +
              (x.username !== 'admin' ? '<button class="btn btn-danger btn-sm" onclick="QZ.actions.delUser(\'' + x.username + '\')">删除</button>' : '') : '—') + '</td></tr>';
        }))
    });

    var iconCard = QZ.card({
      icon: 'star', title: '图标风格与自定义资源', desc: '全站统一使用原创手绘卡通图标：马卡龙低饱和配色、圆角饱满、线条柔和，无 IP 版权风险、可直接商用',
      tools: '<button class="btn btn-primary btn-sm" onclick="QZ.actions.checkIcons()">检测图标状态</button>',
      body: '<div class="note teal">当前图标为<b>原创绘制</b>（非任何 IP 形象、非通用线性图标、非系统默认图标），共 40 个图标位，覆盖侧边栏入口、卡片、按钮、标签；风格统一：100% 圆角、块面饱满、低饱和马卡龙浅色系 + 柔和青灰描边，零版权风险，可直接商用。<br>如需替换为其他可商用开源图标库（如 OpenMoji / Twemoji 等 CC0 / MIT 授权资源），把图片按 <b>图标位.png</b> 命名放入 <b>assets/icons/</b>，刷新即全站生效，无需改代码。</div>' +
        '<div id="iconStatus" style="margin-top:10px">' + (QZ._iconCheck || '<div class="empty">点击右上角「检测图标状态」查看 40 个图标位的自定义图片是否就位</div>') + '</div>' +
        '<div class="note" style="margin-top:10px">未放入自定义图片时，全部图标位显示原创手绘卡通图标，保证全站风格零差异、无空白、无缺图。</div>'
    });

    var logs = (s.logs || []).slice(0, 6);
    var syncCard = QZ.card({
      icon: 'sync', title: '飞书多维表格数据同步', desc: '固定对接「27届秋招 / 春招 / 实习汇总表」，他人共享表格只读拉取，一键导入 + 每日自动同步',
      tools: '<button class="btn btn-primary btn-sm" onclick="QZ.actions.syncNow()">飞书表格一键同步</button>' +
        '<button class="btn btn-primary btn-sm" onclick="QZ.actions.importCsv()">导入 Excel / CSV</button>' +
        '<a class="btn btn-soft btn-sm" href="feishu-bridge/README.md" target="_blank" rel="noopener">扩展说明（对本表不适用）</a>' +
        '<button class="btn btn-soft btn-sm" onclick="QZ.actions.importGuide()">导入引导</button>' +
        '<button class="btn btn-soft btn-sm" onclick="QZ.actions.copyExportScript()">复制页面采集脚本</button>' +
        '<button class="btn btn-soft btn-sm" onclick="QZ.syncModal()">粘贴 / 配置</button>',
      body: '<dl class="kv">' +
        '<dt>数据源</dt><dd>' + esc(s.sourceName || '飞书多维表格') + '</dd>' +
        '<dt>表格链接</dt><dd style="word-break:break-all">' + esc(s.sourceUrl || '未配置') + '</dd>' +
        '<dt>同步方式</dt><dd><select class="chip" style="border:1px solid var(--border);background:#fff" onchange="QZ.actions.syncSet(\'mode\',this.value)">' +
        '<option value="overwrite"' + (s.mode === 'overwrite' ? ' selected' : '') + '>覆盖更新（表格为准）</option>' +
        '<option value="incremental"' + (s.mode === 'incremental' ? ' selected' : '') + '>增量更新（只补新岗位）</option></select></dd>' +
        '<dt>每日自动</dt><dd><button class="btn ' + (s.auto ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.actions.syncToggle(\'auto\')">' + (s.auto ? '已开启 · 每天自动拉取' : '已关闭') + '</button></dd>' +
        '<dt>代理抓取</dt><dd><button class="btn ' + (s.useProxy ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="QZ.actions.syncToggle(\'useProxy\')">' + (s.useProxy ? '已开启（绕过跨域）' : '已关闭（直连）') + '</button></dd>' +
        '<dt>最近同步</dt><dd>' + esc(s.lastSync || '尚未同步') + '</dd>' +
        '<dt>同步结果</dt><dd>' + esc(s.lastResult || '—') + '</dd></dl>' +
        (logs.length ? '<div style="font-size:12.5px;font-weight:600;margin-top:6px">同步日志（最近 ' + logs.length + ' 条）</div><div class="table-wrap"><table style="min-width:420px"><thead><tr><th>时间</th><th>来源</th><th>方式</th><th>新增</th><th>更新</th></tr></thead><tbody>' +
          logs.map(function (l) {
            return '<tr><td class="nowrap">' + esc(l.time) + '</td><td>' + esc(l.from) + '</td><td>' + (l.mode === 'overwrite' ? '覆盖' : '增量') + '</td><td>' + l.added + '</td><td>' + l.updated + '</td></tr>';
          }).join('') + '</tbody></table></div>' : '') +
        '<div class="note teal" style="margin-top:10px">自动归类规则：含「笔试时间」→ 笔试管理；含「面试时间/轮次」→ 面试管理；企业+岗位 → 岗位投递库；仅资料链接 → 资源收藏夹；仅事项+截止 → 日程待办。列名支持中英文自动映射（企业名称/company、岗位名称/position…）。</div>' +
        '<div class="note" style="margin-top:10px"><b>浏览器端直读限制（已实测确认）</b>：飞书多维表格采用 <b>canvas 画布渲染 + 二进制协议传输</b>，页面 DOM 中没有表格文字、接口也不返回 JSON，因此<b>任何网页脚本 / 浏览器扩展都无法自动读取本表数据</b>（实测诊断：canvas 2 个、DOM 行 0、JSON 响应 0、页面文本仅 272 字且只有界面框架）。可直接使用的通道：<br>① <b>官方 API</b>（见下方进阶方案，你创建应用并授权一次即可，<b>不需要表格所有者改权限</b>）<br>② 表格所有者导出 CSV / 开启可复制权限后，用本页「粘贴」或「导入 CSV 文件」<br>③ 截图后整理为 CSV 导入（最省事，不依赖任何权限）</div>' +
        '<div class="note" style="margin-top:8px">飞书多维表格是网页应用，浏览器直读受登录态与跨域限制：<b>最稳的方式</b>是在飞书里「导出 / 全选复制」表格内容，粘贴到同步窗口一键导入；也可让表格维护者提供一个公开的 CSV/JSON 直链填入表格链接，即可实现全自动每日同步。样例数据保留在页面中，首次同步成功后会自动替换为表格最新数据。</div>'
    });

    var oa = s.oauth || {};
    var oauthCard = QZ.card({
      icon: 'cloud', title: '进阶方案 · 飞书开放平台 OAuth + 后端定时 API',
      desc: '官方 Base API 拉取，预留架构配置位：可作为项目迭代方向与毕设技术亮点对比方案',
      tools: '<button class="btn btn-soft btn-sm" onclick="QZ.actions.copySyncCmd()">复制同步命令</button>' +
        '<a class="btn btn-soft btn-sm" href="sync-server/README.md" target="_blank" rel="noopener">方案文档</a>',
      body: '<dl class="kv">' +
        '<dt>app_token</dt><dd>' + esc(oa.appToken || '—') + '</dd>' +
        '<dt>table_id</dt><dd>' + esc(oa.tableId || '—') + '</dd>' +
        '<dt>view_id</dt><dd>' + esc(oa.viewId || '—') + '</dd>' +
        '<dt>app_id</dt><dd><input style="width:100%;padding:6px 9px;border:1px solid var(--border);border-radius:9px" value="' + esc(oa.appId || '') + '" placeholder="cli_xxxxxxxx" onchange="QZ.actions.oauthSet(\'appId\',this.value)"></dd>' +
        '<dt>app_secret</dt><dd><input type="password" style="width:100%;padding:6px 9px;border:1px solid var(--border);border-radius:9px" value="' + esc(oa.appSecret || '') + '" placeholder="应用密钥" onchange="QZ.actions.oauthSet(\'appSecret\',this.value)"></dd></dl>' +
        '<div class="note teal" style="margin-top:10px">架构：飞书 Base 表 → 后端同步脚本（<code>sync-server/feishu_sync.py</code>，仅用标准库）→ 输出 rows.csv / rows.json → 工作台导入。可挂 cron / 任务计划实现每天自动跑，与浏览器是否打开无关。</div>' +
        '<div class="note" style="margin-top:8px">安全提醒：app_secret 等同密码，仅保存在本机浏览器且不要提交到公开仓库；该方案只做只读拉取，不会写入你的飞书表格。授权方式支持 tenant_access_token（应用加为表格协作者）与 OAuth user_access_token（用户授权一次，无需表格所有者操作）。</div>'
    });

    var pwaCard = QZ.card({
      icon: 'phone', title: 'PWA 添加到手机主屏幕', desc: '全屏打开、无地址栏、桌面图标启动、离线可访问',
      body: '<div class="timeline">' +
        '<div class="tl-item"><div class="tl-title">iPhone（Safari）</div><div class="tl-sub">打开本页 → 底部「分享」按钮 → 向下找到「添加到主屏幕」→ 确认添加。之后从桌面图标进入即为全屏 App 形态。</div></div>' +
        '<div class="tl-item"><div class="tl-title">Android（Chrome / Edge）</div><div class="tl-sub">右上角菜单 → 「添加到主屏幕 / 安装应用」→ 确认。部分浏览器会在页面右下角出现「添加到手机主屏幕」按钮，直接点击即可。</div></div>' +
        '<div class="tl-item"><div class="tl-title">电脑端（Chrome / Edge）</div><div class="tl-sub">地址栏右侧安装图标 → 「安装 WorkBuddy 秋招工作台」，可像桌面软件一样独立窗口打开。</div></div>' +
        '<div class="tl-item"><div class="tl-title">离线访问</div><div class="tl-sub">已缓存页面骨架与静态资源，断网时仍可打开工作台并查看本机已保存数据；联网后同步功能自动恢复。</div></div>' +
        '</div>'
    });

    var dataCard = QZ.card({
      icon: 'doc', title: '数据管理与样式重置', desc: '导出备份、导入数据、恢复初始样例数据',
      tools: '<button class="btn btn-soft btn-sm" onclick="QZ.exportJson()">导出备份</button>' +
        '<button class="btn btn-soft btn-sm" onclick="QZ.actions.importJson()">导入数据</button>',
      body: '<div class="list">' +
        '<div class="mini-stat"><span>岗位投递</span><b>' + QZ.data.jobs.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>笔试场次</span><b>' + QZ.data.exams.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>面试记录</span><b>' + QZ.data.interviews.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>简历版本</span><b>' + QZ.data.resumes.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>题库</span><b>' + QZ.data.questions.length + ' 题</b></div>' +
        '<div class="mini-stat"><span>Offer</span><b>' + QZ.data.offers.length + ' 个</b></div>' +
        '<div class="mini-stat"><span>待办</span><b>' + QZ.data.todos.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>资源</span><b>' + QZ.data.resources.length + ' 条</b></div>' +
        '<div class="mini-stat"><span>最近更新</span><b>' + esc(QZ.data.updatedAt) + '</b></div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="btn btn-ghost btn-sm" onclick="QZ.actions.resetData()">恢复初始样例数据</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="QZ.actions.clearData()">清空全部数据</button></div>' +
        '<div class="note" style="margin-top:10px">全站配色固定为「浅青主色 + 米白背景 + 纯白卡片」方案（B 方案），图标统一原创手绘卡通马卡龙风格，如需调整样式可修改 styles.css 顶部的 CSS 变量。</div>'
    });

    var aboutCard = QZ.card({
      icon: 'star', title: '使用说明与隐私', desc: '数据归属与访问方式',
      body: '<div class="list">' +
        '<div class="list-item">' + tiny('lock', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">全站密码保护，未登录无法访问任何页面内容。</div></div></div>' +
        '<div class="list-item">' + tiny('user', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">超级管理员可管理全站数据与账号；普通账号仅查看，不可增删改。</div></div></div>' +
        '<div class="list-item">' + tiny('cloud', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">数据默认保存在本机浏览器，不上传服务器；换设备请使用导出/导入迁移。</div></div></div>' +
        '<div class="list-item">' + tiny('phone', 14) + '<div class="li-main"><div class="li-sub" style="font-size:12.5px;color:var(--text-2)">电脑端与手机端为同一套布局（左侧固定侧边栏 + 右侧内容区），手机端侧边栏收窄为图标栏常驻。</div></div></div>' +
        '</div>'
    });

    return '<div class="grid grid-2" style="margin-bottom:14px">' + accountCard + usersCard + '</div>' +
      '<div class="grid" style="margin-bottom:14px">' + iconCard + '</div>' +
      '<div class="grid" style="margin-bottom:14px">' + oauthCard + '</div>' +
      '<div class="grid grid-2" style="margin-bottom:14px">' + syncCard + pwaCard + '</div>' +
      '<div class="grid grid-2">' + dataCard + aboutCard + '</div>';
  }

  /* ---- 设置中心动作 ---- */
  Object.assign(QZ.actions, {
    syncNow: function () { QZ.runSync({}); },
    importCsv: function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.xlsx,.xlsm,.xlsb,.xls,.csv,.tsv,.txt,.json,.md';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        QZ.importFileObject(f);
      };
      inp.click();
    },
    syncToggle: function (key) {
      var s = QZ.data.sync;
      s[key] = !s[key];
      QZ.save(); QZ.render();
      QZ.toast(key === 'auto' ? (s[key] ? '已开启每日自动同步' : '已关闭自动同步') : (s[key] ? '已开启代理抓取' : '已关闭代理'));
    },
    syncSet: function (key, val) {
      QZ.data.sync[key] = val; QZ.save(); QZ.render(); QZ.toast('已保存设置');
    },
    oauthSet: function (key, val) {
      QZ.data.sync.oauth = QZ.data.sync.oauth || {};
      QZ.data.sync.oauth[key] = val; QZ.save(); QZ.toast('已保存（本地）');
    },
    copySyncCmd: function () {
      var oa = QZ.data.sync.oauth || {};
      var cmd = 'python sync-server/feishu_sync.py --app-id ' + (oa.appId || 'cli_xxxx') +
        ' --app-secret ' + (oa.appSecret || 'xxxx') +
        ' --app-token ' + (oa.appToken || '') + ' --table-id ' + (oa.tableId || '') +
        ' --view-id ' + (oa.viewId || '') + ' --out rows.csv --format csv';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(function () { QZ.toast('命令已复制，粘贴到终端运行'); },
          function () { QZ.modal({ title: '后端同步命令', html: '<pre style="white-space:pre-wrap;font-size:12px">' + QZ.esc(cmd) + '</pre>' }); });
      } else {
        QZ.modal({ title: '后端同步命令', html: '<pre style="white-space:pre-wrap;font-size:12px">' + QZ.esc(cmd) + '</pre>' });
      }
    },
    importGuide: function () {
      var step = function (t, arr) {
        return '<div class="tl-item"><div class="tl-title">' + t + '</div><div class="tl-sub">' +
          arr.map(function (s, i) { return (i + 1) + '. ' + s; }).join('<br>') + '</div></div>';
      };
      QZ.modal({
        title: '飞书数据导入引导',
        desc: '三种方式任选其一，推荐先用「方式一」，30 秒即可完成',
        html: '<div class="timeline">' +
          step('方式一 · Excel / CSV 文件导入（表格能导出时优先用这个）', [
            '飞书表格右上角「⋯ 更多」→ 导出 / 下载 → 选择 Excel 或 CSV',
            '工作台设置中心 → 飞书多维表格数据同步 → 点「导入 Excel / CSV」',
            '选中刚下载的文件；若 Excel 有多个工作表，会弹出让你选择要导入哪一个',
            '等待提示「同步完成：新增 X 条 / 更新 X 条」即可，数据自动归类到各模块'
          ]) +
          step('方式二 · 复制粘贴（无法导出但能复制时试这个）', [
            '浏览器打开飞书表格链接，确保已登录且有访问权限',
            '点击表格内任意单元格 → Ctrl+A 全选 → Ctrl+C 复制（若只复制了一部分，请改用方式一导出）',
            '回到工作台 → 设置中心 → 飞书多维表格数据同步 → 点「粘贴 / 配置」',
            '把内容粘贴进文本框 → 同步方式选「覆盖更新」→ 点「开始同步」',
            '看到提示「同步完成：新增 X 条 / 更新 X 条」即成功，数据已自动归类到各模块'
          ]) +
          step('方式三 · 页面采集脚本（表格禁止复制 / 禁止导出时用这个）', [
            '打开飞书表格页，数据可见即可（不需要复制权限）',
            '按 F12 → Console（控制台）',
            '回到本卡片点「复制页面采集脚本」→ 粘贴到控制台 → 回车',
            '脚本自动滚动加载全部行，完成后自动下载 feishu_table.csv',
            '点「导入 CSV 文件」选中该 CSV 即可'
          ]) +
          step('方式四 · 扩展全自动（实验性，当前有限制）', [
            'Chrome/Edge 打开 chrome://extensions → 开启「开发者模式」',
            '点「加载已解压的扩展程序」→ 选择 F:\\秋招工作台\\dist\\feishu-bridge',
            '刷新工作台页面，设置中心显示「✅ 扩展已连接」即握手成功',
            '注意：飞书多维表格为 Canvas 渲染，扩展目前无法读取单元格数据，仅作连接演示；如需全自动请用官方 API 通道'
          ]) +
          '</div>' +
          '<div class="note teal" style="margin-top:10px">导入前建议先点顶部「导出备份」保存一份当前数据；任何导入失败都不会清空已有记录，可放心操作。</div>'
      });
    },
    copyExportScript: function () {
      var url = 'tools/feishu-dom-export.js?v=13';
      var show = function (txt) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () {
            QZ.toast('脚本已复制：飞书页面按 F12 → Console 粘贴运行');
            QZ.modal({
              title: '采集脚本已复制 · 使用步骤',
              desc: '适用于表格禁止复制 / 禁止导出的情况',
              html: '<div class="timeline">' +
                '<div class="tl-item"><div class="tl-title">1. 打开飞书表格页</div><div class="tl-sub">登录并确认数据正常显示</div></div>' +
                '<div class="tl-item"><div class="tl-title">2. 按 F12 → Console</div><div class="tl-sub">在控制台粘贴（Ctrl+V）刚刚复制的脚本，回车运行</div></div>' +
                '<div class="tl-item"><div class="tl-title">3. 等待自动滚动采集</div><div class="tl-sub">控制台会打印「共采集到行数」，完成后自动下载 feishu_table.csv</div></div>' +
                '<div class="tl-item"><div class="tl-title">4. 回到工作台导入</div><div class="tl-sub">设置中心 →「导入 CSV 文件」→ 选中 feishu_table.csv</div></div>' +
                '</div><div class="note teal" style="margin-top:10px">脚本只读取你本机页面内容，不联网、不上传任何数据。</div>'
            });
          }, function () { fallback(txt); });
        } else fallback(txt);
      };
      var fallback = function (txt) {
        QZ.modal({
          title: '页面采集脚本（请手动全选复制）',
          html: '<textarea style="width:100%;height:280px;font-size:11px" readonly>' + QZ.esc(txt) + '</textarea>' +
            '<div class="note teal" style="margin-top:8px">也可直接打开 tools/feishu-dom-export.js 复制全文。</div>'
        });
      };
      fetch(url).then(function (r) { return r.text(); }).then(show).catch(function () {
        QZ.toast('脚本读取失败，请打开 tools/feishu-dom-export.js 手动复制');
      });
    },
    logout: function () { document.getElementById('logoutBtn').click(); },
    changePwd: function () {
      QZ.modal({
        title: '修改密码', desc: '当前账号：' + QZ.user.username,
        fields: [
          { key: 'old', label: '原密码', type: 'password' },
          { key: 'pwd', label: '新密码', type: 'password' },
          { key: 'pwd2', label: '确认新密码', type: 'password' }
        ],
        onSubmit: function (v) {
          if (v.old !== QZ.user.password) { QZ.toast('原密码不正确'); return false; }
          if (!v.pwd || v.pwd !== v.pwd2) { QZ.toast('两次输入的新密码不一致'); return false; }
          QZ.user.password = v.pwd; QZ.save(); QZ.toast('密码已修改，请牢记');
        }
      });
    },
    addUser: function () {
      if (!QZ.canManage()) { QZ.toast('仅超级管理员可新增账号'); return; }
      QZ.modal({
        title: '新增子账号', desc: '可为家人/同学开设只读或管理账号',
        fields: [
          { key: 'username', label: '登录账号*' },
          { key: 'name', label: '显示名称' },
          { key: 'password', label: '密码*', type: 'password' },
          { key: 'role', label: '角色', type: 'select', options: ['user', 'admin'] },
          { key: 'note', label: '备注', type: 'textarea', full: true }
        ],
        onSubmit: function (v) {
          if (!v.username || !v.password) { QZ.toast('账号与密码必填'); return false; }
          if (QZ.data.users.filter(function (x) { return x.username === v.username; }).length) { QZ.toast('账号已存在'); return false; }
          QZ.data.users.push({ username: v.username, password: v.password, name: v.name || v.username, role: v.role, note: v.note, active: true, createdAt: QZ.today() });
          QZ.save(); QZ.render(); QZ.toast('账号已创建');
        }
      });
    },
    toggleUser: function (username) {
      var u = QZ.data.users.filter(function (x) { return x.username === username; })[0];
      if (!u) return;
      if (u.username === 'admin') { QZ.toast('默认管理员不可停用'); return; }
      u.active = !u.active; QZ.save(); QZ.render(); QZ.toast(u.active ? '已启用' : '已停用');
    },
    delUser: function (username) {
      QZ.confirm('确定删除账号「' + username + '」？', function () {
        QZ.data.users = QZ.data.users.filter(function (x) { return x.username !== username; });
        QZ.save(); QZ.render(); QZ.toast('已删除');
      });
    },
    importJson: function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var obj = JSON.parse(r.result);
            Object.keys(QZ.data).forEach(function (k) { if (obj[k] !== undefined) QZ.data[k] = obj[k]; });
            QZ.save(); QZ.render(); QZ.toast('导入成功');
          } catch (e) { QZ.toast('文件格式错误，需为导出的 JSON'); }
        };
        r.readAsText(f);
      };
      inp.click();
    },
    resetData: function () {
      QZ.confirm('将清空当前数据并恢复为初始样例数据（软件测试岗真实样例），确定继续？', function () {
        QZ.resetData(); QZ.render(); QZ.toast('已恢复初始样例数据');
      });
    },
    clearData: function () {
      QZ.confirm('将清空全部业务数据（保留账号与设置），确定继续？', function () {
        ['jobs', 'exams', 'interviews', 'resumes', 'questions', 'offers', 'todos', 'resources'].forEach(function (k) { QZ.data[k] = []; });
        QZ.save(); QZ.render(); QZ.toast('已清空业务数据');
      });
    },
    checkIcons: function () {
      var keys = D.ICON_KEYS || [];
      var labels = {
        dashboard: '首页总览', job: '岗位投递库', exam: '笔试管理', interview: '面试管理', resume: '简历版本库',
        question: '笔面试题库', offer: 'Offer 对比表', todo: '日程待办', resource: '资源收藏夹', setting: '设置中心',
        plus: '新增按钮', edit: '编辑按钮', trash: '删除按钮', sync: '同步按钮', link: '链接按钮',
        clock: '时间/倒计时', lock: '密码/安全', user: '账号', shield: '超级管理员', chart: '统计',
        filter: '筛选', download: '导出', upload: '导入', check: '完成/清单', star: '评分/收藏',
        calendar: '日程', pin: '地点', book: '学习资料', target: '目标方向', cloud: '云端同步',
        phone: '手机/PWA', team: '内推/团队', flag: '标记', bell: '提醒', refresh: '刷新/重做',
        doc: '文档', wallet: '薪资', route: '转行路线', key: '权限', cap: '毕业/学位'
      };
      var host = document.getElementById('iconStatus');
      if (!host) return;
      host.innerHTML = '<div class="empty">检测中…（共 ' + keys.length + ' 个图标位）</div>';
      var pending = keys.length, res = [];
      keys.forEach(function (k) {
        var img = new Image();
        img.onload = function () { res.push([k, true]); tick(); };
        img.onerror = function () { res.push([k, false]); tick(); };
        img.src = (D.ICON_DIR || 'assets/icons/') + k + '.png?t=' + Date.now();
      });
      function tick() {
        if (--pending > 0) return;
        var ok = res.filter(function (r) { return r[1]; }).length;
        res.sort(function (a, b) { return (b[1] ? 1 : 0) - (a[1] ? 1 : 0); });
        var html = '<div class="note teal">自定义图片已就位 <b>' + ok + ' / ' + keys.length + '</b> 个图标位；其余图标位当前显示原创手绘卡通图标。</div>' +
          '<div class="table-wrap" style="margin-top:8px"><table style="min-width:440px"><thead><tr><th>图标位</th><th>文件名</th><th>状态</th></tr></thead><tbody>' +
          res.map(function (r) {
            return '<tr><td>' + esc(labels[r[0]] || r[0]) + '</td><td>assets/icons/' + r[0] + '.png</td>' +
              '<td>' + (r[1] ? '<span class="chip green">自定义图片已生效</span>' : '<span class="chip gray">使用原创卡通图标</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
        QZ._iconCheck = html;
        host.innerHTML = html;
      }
    }
  });

  /* =============== 页面清单（侧边栏 10 个入口） =============== */
  QZ.pages = [
    { id: 'dashboard', name: '首页总览', sub: '秋招全局数据看板', icon: 'dashboard', render: pageDashboard, badge: function () { return QZ.data.todos.filter(function (x) { return !x.done; }).length || ''; } },
    { id: 'jobs', name: '岗位投递库', sub: '投递进度与状态追踪', icon: 'job', render: pageJobs, badge: function () { return QZ.data.jobs.filter(function (x) { return ['笔试中', '面试中'].indexOf(x.status) >= 0; }).length || ''; } },
    { id: 'exams', name: '笔试管理', sub: '场次 / 账号 / 错题笔记', icon: 'exam', render: pageExams, badge: function () { return QZ.data.exams.filter(function (x) { return x.status === '待参加'; }).length || ''; } },
    { id: 'interviews', name: '面试管理', sub: '轮次 / 复盘 / 高频问题', icon: 'interview', render: pageInterviews, badge: function () { return QZ.data.interviews.filter(function (x) { return x.status === '待参加'; }).length || ''; } },
    { id: 'resumes', name: '简历版本库', sub: '多版本存档与适配对照', icon: 'resume', render: pageResumes },
    { id: 'questions', name: '笔面试题库', sub: '算法 / 基础 / 真题 / 错题', icon: 'question', render: pageQuestions },
    { id: 'offers', name: 'Offer 对比表', sub: '多维度打分与决策', icon: 'offer', render: pageOffers },
    { id: 'todos', name: '日程待办', sub: '每日清单与优先级', icon: 'todo', render: pageTodos },
    { id: 'resources', name: '资源收藏夹', sub: '内推 / 官网 / 资料 / 工具', icon: 'resource', render: pageResources },
    { id: 'settings', name: '设置中心', sub: '账号 / 权限 / 同步 / PWA', icon: 'setting', render: pageSettings }
  ];
})(window);
