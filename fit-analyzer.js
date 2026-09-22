/**
 * fit-analyzer.js
 * ------------------------------------------------------------
 * 岗位适配分析引擎（v1.0.0，纯本地 + 可选在线 AI）
 *
 * 两种模式：
 *   1. offline —— 关键词权重匹配，完全离线，秒出结果（默认 / 无网兜底）
 *   2. ai      —— 调用用户自己填的大模型 API（默认 DeepSeek），失败自动回退 offline
 *
 * 输出结构统一：
 *   { mode, score, level, highlights:[{title,evidence}], gaps:[{title,why}],
 *     plain:{text, bullets:[]}, advice:[], transfer:'', isNonIT, ts }
 *
 * 简历只取自浏览器本地档案，不上传任何服务器（AI 模式下才把文本发给所选 API）
 * ------------------------------------------------------------
 */
(function (root) {
  'use strict';

  var A = { version: '1.0.0' };

  /* ---------------- 词典：技术/专业能力 ---------------- */
  var TECH = {
    'Python 编程': ['python'],
    'C / C++': ['c++', 'c语言', '嵌入式c', 'c 语言'],
    'Java': ['java'],
    'SQL / 数据库': ['sql', 'mysql', '数据库', 'oracle'],
    'Linux / Shell': ['linux', 'shell', '命令行'],
    '测试理论基础': ['测试用例', '测试点', '黑盒', '白盒', '边界值', '等价类', '测试流程', '缺陷管理', '测试报告', '回归测试'],
    '自动化测试': ['自动化测试', 'selenium', 'pytest', '接口自动化', 'ui 自动化', '自动化脚本'],
    '接口测试': ['接口测试', 'apifox', 'postman', 'http 接口'],
    '性能测试': ['性能测试', '压测', 'jmeter', 'loadrunner'],
    '机器学习 / 深度学习': ['深度学习', '机器学习', '神经网络', 'pytorch', 'tensorflow', '模型训练'],
    '计算机视觉 / 图像处理': ['计算机视觉', '图像处理', 'opencv', 'yolo', '目标检测', '语义分割', '图像识别', '视觉'],
    '模型部署 / 端侧推理': ['onnx', 'ncnn', '端侧', '模型转换', '推理框架', '模型部署', '量化'],
    '嵌入式 / 硬件': ['嵌入式', '单片机', 'stm32', '树莓派', '硬件', '示波器', '电路', 'arm', 'pcb'],
    '数据标注 / 数据处理': ['标注', 'labelme', 'labelimg', '数据增强', '数据清洗', '数据处理'],
    '网络 / 通信基础': ['tcp/ip', '网络协议', '通信原理', '4g', '5g', '北斗', 'gps', '串口'],
    '运维 / 云平台': ['docker', 'k8s', 'kubernetes', '运维', 'ci/cd', 'jenkins', '服务器', '监控告警'],
    '前端开发': ['javascript', 'vue', 'react', 'html', 'css', '前端'],
    '算法与数据结构': ['算法', '数据结构', '动态规划', 'leetcode'],
    '版本管理 / 工程规范': ['git', 'svn', '代码规范', 'code review']
  };

  /* ---------------- 词典：通用能力（非 IT 岗位转行评估用） ---------------- */
  var GENERAL = {
    '文档编写与表达': ['文档', '编写文档', '技术文档', '报告', '总结', '方案编写', '说明书', 'wps', 'excel', 'ppt'],
    '问题排查与定位': ['排查', '定位', '分析能力', '问题定位', '故障', '异常处理', '排错'],
    '数据整理与核对': ['数据整理', '数据校验', '数据统计', '表格', '台账', '核对'],
    '沟通与协作': ['沟通', '协作', '跨部门', '团队', '协调', '对接', '表达'],
    '项目落地与推进': ['项目', '落地', '推进', '交付', '上线', '统筹', '跟进', '排期'],
    '学习能力': ['学习能力', '快速上手', '自学', '主动性', '学习能力强'],
    '责任心与细致度': ['责任心', '抗压', '细致', '耐心', '认真', '踏实'],
    '客户 / 用户对接': ['客户', '用户', '现场', '售后', '支持', '服务'],
    '需求理解与分析': ['需求', '需求评审', '需求分析', '业务理解', '拆解'],
    '流程与规范意识': ['流程', '规范', '标准', '制度', 'sop']
  };

  /* ---------------- 岗位通俗解读模板 ---------------- */
  var PLAIN = [
    {
      k: ['测试', '质量', 'qa', 'qc'], title: '软件 / 硬件测试工程师',
      text: '你每天的工作是站在「挑毛病」的位置上：把产品需求拆成一条条测试点，写成用例，然后执行——点功能、造数据、看边界情况，发现缺陷就提单、跟踪开发修复、再回归验证。',
      bullets: ['核心产出：测试用例、缺陷单、测试报告', '协作对象：开发（撕缺陷）、产品（对需求）、项目经理（排期）',
        '常见难点：复现偶发问题、边界场景想不全、回归范围越来越大', '成长路径：功能测试 → 自动化/性能/测试开发 → 测试负责人']
    },
    {
      k: ['嵌入式', '单片机', '固件', '驱动'], title: '嵌入式工程师',
      text: '你写的代码跑在板子、设备、芯片里，不是跑在网页上。日常是看原理图、调驱动、写业务逻辑，用示波器/串口/log 抓现象，反复烧录验证，直到设备稳定工作。',
      bullets: ['核心产出：可运行的固件、调试记录、测试用例', '协作对象：硬件工程师（原理图/PCB）、结构、测试',
        '常见难点：现象难复现、软硬件边界难划分、资源受限（内存/算力）', '成长路径：模块开发 → 系统联调 → 架构/技术负责人']
    },
    {
      k: ['视觉', '图像', '算法', 'ai', '深度学习', '机器学习', '模型'], title: 'AI / 视觉算法工程师',
      text: '你的工作围绕「数据 → 模型 → 落地」：采集和标注数据、选网络结构训练、看指标调参、把模型转成能在端上跑起来的格式，最后接进真实业务里验证效果。',
      bullets: ['核心产出：数据集、训练好的模型、评测报告、部署方案', '协作对象：数据标注、后端/嵌入式（部署）、产品（定指标）',
        '常见难点：数据质量差、指标好看但实际场景翻车、端侧算力不够', '成长路径：复现论文 → 独立负责模块 → 端到端方案负责人']
    },
    {
      k: ['运维', '技术支持', '实施', '售后', 'sre'], title: '运维 / 技术支持工程师',
      text: '你是系统「别出问题、出问题能马上解决」的保障者：日常盯监控告警、处理客户报障、部署上线、写操作文档，有时需要轮班响应线上问题。',
      bullets: ['核心产出：稳定的系统、故障处理记录、部署与运维文档', '协作对象：开发（定位根因）、客户/销售（对接现场）',
        '常见难点：半夜告警、复现难、沟通成本高', '成长路径：一线支持 → 运维开发/SRE → 运维负责人']
    },
    {
      k: ['产品', '产品经理', '运营'], title: '产品 / 运营岗',
      text: '你负责把「用户要什么」变成「做成什么样」：写需求文档、画原型、跟设计开发推进上线，上线后看数据、做迭代方案。沟通占比很高。',
      bullets: ['核心产出：需求文档、原型、数据分析报告', '协作对象：开发、设计、运营、老板',
        '常见难点：需求反复改、各方意见不一致、效果难量化', '成长路径：产品助理 → 独立负责模块 → 产品负责人']
    },
    {
      k: ['硬件', '电子', '电路', '射频', 'fpga'], title: '硬件 / 电子工程师',
      text: '你在和电路、元器件、信号打交道：画原理图与 PCB、打样回来焊接调试、用仪器测信号、解决 EMC/功耗/稳定性问题，直到能批量生产。',
      bullets: ['核心产出：原理图、PCB、样机测试报告', '协作对象：结构、嵌入式软件、生产/供应链',
        '常见难点：调试周期长、问题定位靠经验、改板成本高', '成长路径：模块电路 → 整机设计 → 硬件负责人']
    },
    {
      k: ['数据', 'bi', '分析'], title: '数据分析 / 数据处理岗',
      text: '你把杂乱的数据变成能支撑决策的结论：取数、清洗、建指标、做报表与看板，偶尔做专题分析回答「为什么涨/为什么跌」。',
      bullets: ['核心产出：报表、看板、分析报告', '协作对象：业务方、开发（埋点与数仓）',
        '常见难点：口径不统一、数据脏、结论落地难', '成长路径：取数 → 专题分析 → 数据驱动业务']
    },
    {
      k: ['开发', '软件工程师', '后端', '前端', '研发'], title: '软件开发工程师',
      text: '你把需求变成可运行的功能：设计接口、写代码、自测、联调、修 bug、做 code review，上线后继续维护迭代。',
      bullets: ['核心产出：可运行的服务、接口文档、单测', '协作对象：产品、测试、前端、运维',
        '常见难点：需求变更、线上问题定位、历史包袱', '成长路径：模块开发 → 独立负责服务 → 架构']
    }
  ];

  function has(s, arr) {
    s = String(s || '').toLowerCase();
    for (var i = 0; i < arr.length; i++) if (s.indexOf(arr[i]) >= 0) return true;
    return false;
  }

  /** 从一段文本里截取包含关键词的证据片段 */
  function snippet(text, kw) {
    var t = String(text || '');
    var i = t.toLowerCase().indexOf(String(kw).toLowerCase());
    if (i < 0) return '';
    var a = Math.max(0, i - 26), b = Math.min(t.length, i + 46);
    return (a > 0 ? '…' : '') + t.slice(a, b).replace(/\s+/g, ' ').trim() + (b < t.length ? '…' : '');
  }

  /** 判断该要求是"核心要求"还是"加分项" */
  function weightOf(jd, kw) {
    var i = jd.toLowerCase().indexOf(String(kw).toLowerCase());
    if (i < 0) return 1;
    var seg = jd.slice(Math.max(0, i - 40), i + 40);
    if (/优先|加分|熟悉|精通|要求|负责|必须/.test(seg)) return 1;
    if (/了解|接触过|有.*经验者|会.*更好/.test(seg)) return 0.6;
    return 0.85;
  }

  /** 抽取 JD 里的要求项 */
  function pickReqs(jd) {
    var reqs = [], seen = {};
    Object.keys(TECH).forEach(function (name) {
      var kws = TECH[name];
      var hit = null;
      kws.forEach(function (k) { if (!hit && jd.toLowerCase().indexOf(k) >= 0) hit = k; });
      if (!hit || seen[name]) return;
      seen[name] = 1;
      reqs.push({ name: name, kw: hit, base: 3, w: 3 * weightOf(jd, hit), type: 'tech' });
    });
    Object.keys(GENERAL).forEach(function (name) {
      var kws = GENERAL[name];
      var hit = null;
      kws.forEach(function (k) { if (!hit && jd.toLowerCase().indexOf(k) >= 0) hit = k; });
      if (!hit || seen[name]) return;
      seen[name] = 1;
      reqs.push({ name: name, kw: hit, base: 2, w: 2 * weightOf(jd, hit), type: 'general' });
    });
    return reqs;
  }

  /** 简历档案 → 可检索的纯文本 */
  A.resumeText = function (p) {
    p = p || {};
    var keys = ['name', 'school', 'major', 'degree', 'rank', 'gpa', 'englishLevel', 'expectedPosition',
      'expectedCity', 'skills', 'projectExperience', 'internship', 'awards', 'schoolExperience',
      'selfEvaluation', 'careerPlan', 'certificate', 'homepage'];
    var parts = [];
    keys.forEach(function (k) { if (p[k]) parts.push(String(p[k])); });
    return parts.join('\n');
  };

  /** 岗位 → JD 草稿（没有 JD 时用已有字段拼出来） */
  A.jdDraft = function (job) {
    job = job || {};
    if (job.jd && String(job.jd).trim()) return String(job.jd);
    var lines = [];
    lines.push('【岗位】' + (job.company || '') + ' · ' + (job.position || ''));
    if (job.category) lines.push('【方向】' + job.category);
    if (job.city) lines.push('【城市】' + job.city);
    if (job.salary) lines.push('【薪资】' + job.salary);
    if (job.remark) lines.push('【备注】' + job.remark);
    lines.push('【说明】该岗位暂未录入完整 JD，可粘贴真实 JD 后重新分析，结果会更准。');
    return lines.join('\n');
  };

  function levelOf(score) {
    if (score >= 80) return '高度推荐';
    if (score >= 65) return '可以投递';
    if (score >= 45) return '谨慎投递';
    return '不匹配';
  }

  function plainTalk(job) {
    var s = String((job && (job.position || '') + ' ' + (job.category || '')) || '').toLowerCase();
    for (var i = 0; i < PLAIN.length; i++) {
      if (has(s, PLAIN[i].k)) {
        return { title: PLAIN[i].title, text: PLAIN[i].text, bullets: PLAIN[i].bullets.slice(0, 4) };
      }
    }
    return {
      title: '综合类岗位',
      text: '从岗位名称暂时判断不出明确的技术方向。这类岗位通常按流程与规范推进工作：接需求、拆解任务、协调资源、交付结果并复盘。',
      bullets: ['建议粘贴完整 JD 后再分析一次，解读会更具体', '核心产出：任务交付物与过程文档', '协作对象：上下游同事与需求方', '常见难点：目标口径不清晰、跨部门推进慢']
    };
  }

  function buildAdvice(gaps, isNonIT, job) {
    var adv = [];
    gaps.slice(0, 4).forEach(function (g) {
      adv.push('补「' + g.title + '」：简历的项目 / 实习描述里加一句具体做法与量化结果（例如"用 X 做了 Y，把 Z 从 A 降到 B"），没有真实经历就写"了解 + 学习路径"，不要编造。');
    });
    if (isNonIT) {
      adv.push('转行投递策略：把技术经历翻译成岗位语言——测试经历 = 流程意识 + 问题定位 + 文档产出；项目经历 = 从 0 到 1 落地 + 跨角色协调。');
      adv.push('简历开头放一段 3 行的「岗位匹配说明」，直接说明为什么从原方向转过来、可迁移的能力是什么。');
      adv.push('准备一个 1 分钟自我介绍，重点讲"我做过什么 → 怎么迁移到这个岗位 → 我能马上干什么"。');
    } else {
      adv.push('针对 JD 改简历动词：把"参与/负责"换成 JD 里的原词（如"编写测试用例""接口校验""模型部署"），HR 筛简历看关键词命中。');
      adv.push('准备 2 个 STAR 案例（最难的一个 bug / 最有成就感的一个项目），面试 80% 会追问细节。');
    }
    adv.push('面试前刷一遍该公司近半年产品动态与岗位所在业务线，准备 2 个反问问题（团队分工、新人成长路径）。');
    adv.push('投递前核对：岗位编号记录到备注、简历版本与岗位方向一致、内推优先于官网投递。');
    return adv;
  }

  /* ---------------- 离线分析 ---------------- */

  A.offline = function (resumeText, jdText, job) {
    var rt = String(resumeText || '');
    var jd = String(jdText || '');
    var reqs = pickReqs(jd);
    var techHit = 0, got = 0, total = 0;
    var highlights = [], gaps = [];

    reqs.forEach(function (r) {
      total += r.w;
      var kws = (r.type === 'tech' ? TECH[r.name] : GENERAL[r.name]);
      var hitKw = null;
      kws.forEach(function (k) { if (!hitKw && rt.toLowerCase().indexOf(k) >= 0) hitKw = k; });
      if (hitKw) {
        got += r.w;
        if (r.type === 'tech') techHit++;
        highlights.push({ title: r.name, evidence: snippet(rt, hitKw) || ('简历中含「' + hitKw + '」') });
      } else {
        gaps.push({ title: r.name, why: (r.type === 'tech' ? '技术 / 专业能力' : '通用能力') + '：JD 提到「' + r.kw + '」，简历里没检索到' });
      }
    });

    /* JD 信息不足时的兜底：用岗位名与简历方向的重合度估一个分 */
    var score, note = '';
    if (!reqs.length) {
      var pos = String((job && job.position) || '').toLowerCase();
      var rp = String((job && '') || '') + rt.toLowerCase();
      var overlap = 0;
      ['测试', '嵌入式', '视觉', '算法', '运维', '产品', '硬件', '数据', '开发'].forEach(function (w) {
        if (pos.indexOf(w) >= 0 && rp.indexOf(w) >= 0) overlap++;
      });
      score = overlap ? Math.min(72, 48 + overlap * 8) : 50;
      note = 'JD 里没检索到明确的能力关键词（可能只填了备注），当前分数是按「岗位方向 vs 简历方向」粗估的，粘贴完整 JD 后更准。';
    } else {
      score = Math.round(got / total * 100);
      /* 方向一致额外加分：期望岗位与岗位名有共同关键词 */
      var ep = String((job && job.expectedPosition) || '');
      var pos2 = String((job && job.position) || '');
      var same = 0;
      ['测试', '嵌入式', '视觉', 'AI', '算法', '运维', '产品', '硬件', '数据'].forEach(function (w) {
        if (pos2.indexOf(w) >= 0 && (ep.indexOf(w) >= 0 || rt.indexOf(w) >= 0)) same++;
      });
      if (same) score = Math.min(100, score + Math.min(8, same * 3));
      if (/本科/.test(rt) && /本科|应届|校招/.test(jd)) score = Math.min(100, score + 2);
    }

    var isNonIT = reqs.length > 0 && techHit <= 1;
    if (isNonIT) {
      /* 非 IT 岗位：通用能力权重更高，重新加权 */
      var g = 0, t2 = 0;
      reqs.forEach(function (r) {
        var w = r.type === 'general' ? r.w * 1.6 : r.w * 0.7;
        t2 += w;
        var kws = (r.type === 'tech' ? TECH[r.name] : GENERAL[r.name]);
        var hit = false;
        kws.forEach(function (k) { if (rt.toLowerCase().indexOf(k) >= 0) hit = true; });
        if (hit) g += w;
      });
      if (t2) score = Math.round(g / t2 * 100);
    }

    highlights.sort(function (a, b) { return 0; });
    gaps.sort(function (a, b) { return (b.why.length - a.why.length); });

    var plain = plainTalk(job);
    var transfer = '';
    if (isNonIT) {
      var mig = [];
      reqs.forEach(function (r) {
        if (r.type === 'general' && highlights.some(function (h) { return h.title === r.name; })) mig.push(r.name);
      });
      transfer = mig.length
        ? '可迁移能力：' + mig.slice(0, 5).join('、') + '。你原来的技术经历可以翻译成这些通用能力来用——比如做项目 = 从 0 到 1 落地 + 跨角色推进；做测试 = 流程意识 + 问题定位 + 文档产出。转行可行性中等偏上，建议在简历开头写明转岗动机。'
        : '可迁移能力：暂未在该岗位 JD 里检索到与你简历明确重合的通用能力，建议先看 JD 里反复出现的动词（如"整理""对接""跟进""排查"），把你的经历用同样的动词重写一遍。';
    }

    return {
      mode: 'offline',
      score: score, level: levelOf(score),
      highlights: highlights.slice(0, 8),
      gaps: gaps.slice(0, 6),
      plain: plain,
      advice: buildAdvice(gaps, isNonIT, job),
      transfer: transfer,
      isNonIT: isNonIT,
      note: note,
      ts: Date.now()
    };
  };

  /* ---------------- 在线 AI 深度分析 ---------------- */

  var SYS = '你是资深校招招聘官兼技术面试官，擅长把一份应届生简历和一份 JD 做匹配分析。' +
    '只输出 JSON，不要任何解释文字、不要 markdown 代码块标记。JSON 结构：' +
    '{"score":0-100的整数,"level":"高度推荐|可以投递|谨慎投递|不匹配","highlights":[{"title":"能力名","evidence":"简历里的依据"}],' +
    '"gaps":[{"title":"缺失能力","why":"为什么重要"}],"plain":{"title":"岗位名","text":"通俗解释这个岗位每天做什么","bullets":["要点1","要点2","要点3"]},' +
    '"advice":["建议1","建议2","建议3"],"transfer":"非技术岗时给转行适配判断，技术岗填空字符串"}';

  function extractJson(s) {
    var t = String(s || '').trim();
    var m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) t = m[1].trim();
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) t = t.slice(a, b + 1);
    return JSON.parse(t);
  }

  function norm(o, job) {
    var r = o || {};
    var score = Math.max(0, Math.min(100, parseInt(r.score, 10) || 0));
    var lv = r.level || levelOf(score);
    if (['高度推荐', '可以投递', '谨慎投递', '不匹配'].indexOf(lv) < 0) lv = levelOf(score);
    var hl = Array.isArray(r.highlights) ? r.highlights : [];
    var gp = Array.isArray(r.gaps) ? r.gaps : [];
    return {
      mode: 'ai',
      score: score, level: lv,
      highlights: hl.filter(function (x) { return x && x.title; }).slice(0, 10).map(function (x) {
        return { title: String(x.title), evidence: String(x.evidence || '') };
      }),
      gaps: gp.filter(function (x) { return x && x.title; }).slice(0, 8).map(function (x) {
        return { title: String(x.title), why: String(x.why || '') };
      }),
      plain: {
        title: (r.plain && r.plain.title) || (job && job.position) || '岗位解读',
        text: (r.plain && r.plain.text) || '',
        bullets: (r.plain && Array.isArray(r.plain.bullets) ? r.plain.bullets : []).slice(0, 5).map(String)
      },
      advice: (Array.isArray(r.advice) ? r.advice : []).slice(0, 8).map(String),
      transfer: String(r.transfer || ''),
      isNonIT: false,
      note: '',
      ts: Date.now()
    };
  }

  /**
   * @param {string} resumeText @param {string} jdText @param {object} job @param {object} cfg {key, model, base}
   * @returns {Promise<{ok:boolean, data?:object, err?:string}>}
   */
  A.online = async function (resumeText, jdText, job, cfg) {
    cfg = cfg || {};
    if (!cfg.key) return { ok: false, err: '未配置 API Key' };
    var base = cfg.base || 'https://api.deepseek.com/chat/completions';
    var model = cfg.model || 'deepseek-chat';
    var user = '【目标岗位】' + ((job && job.company) || '') + ' · ' + ((job && job.position) || '') +
      (job && job.category ? '（方向：' + job.category + '）' : '') + '\n\n' +
      '【岗位 JD】\n' + String(jdText || '').slice(0, 4000) + '\n\n' +
      '【我的简历档案】\n' + String(resumeText || '').slice(0, 6000);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { try { ctrl.abort(); } catch (e) { } }, 60000);
    try {
      var res = await fetch(base, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
        body: JSON.stringify({
          model: model, temperature: 0.3, stream: false,
          messages: [{ role: 'system', content: SYS }, { role: 'user', content: user }]
        })
      });
      clearTimeout(timer);
      if (!res.ok) return { ok: false, err: '接口返回 ' + res.status };
      var j = await res.json();
      var content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
      return { ok: true, data: norm(extractJson(content), job) };
    } catch (e) {
      clearTimeout(timer);
      return { ok: false, err: (e && e.name === 'AbortError') ? '请求超时（60 秒）' : ((e && e.message) || '网络错误') };
    }
  };

  /**
   * 统一入口：mode = 'auto' | 'ai' | 'offline'
   * @returns {Promise<{data:object, used:string, err?:string}>}
   */
  A.analyze = async function (resumeText, jdText, job, cfg, mode) {
    mode = mode || 'auto';
    if (mode !== 'offline' && cfg && cfg.key && cfg.on !== false) {
      var r = await A.online(resumeText, jdText, job, cfg);
      if (r.ok) return { data: r.data, used: 'ai' };
      return { data: A.offline(resumeText, jdText, job), used: 'offline', err: r.err };
    }
    return { data: A.offline(resumeText, jdText, job), used: 'offline' };
  };

  root.FitAnalyzer = A;
})(typeof window !== 'undefined' ? window : this);
