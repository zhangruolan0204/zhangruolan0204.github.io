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

  var A = { version: '1.1.0' };

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

  /** 简历档案 → 可检索的纯文本（v1.1.0：纳入全部非空字段，AI 模式下带字段名） */
  /* ---------------- v1.1.0：赛道词典（岗位没有 JD 时，按岗位名/备注判断方向） ---------------- */
  var TRACK = [
    {
      name: '电气 / 电力 / 能源', k: ['电气', '电力', '电网', '发电', '变电', '输电', '继电', '高电压', '能源', '新能源', '储能', '光伏', '风电', '核电', '动力', '供电', '输配电'],
      reqs: [['电路与电气基础', ['电路', '电气', '模电', '数电', '电机', '继电保护', '电力系统']],
      ['自动控制 / PLC', ['plc', '自动控制', '自动化', '控制理论', 'pid', '单片机']],
      ['绘图与仿真工具', ['cad', 'autocad', 'matlab', 'simulink', '仿真', 'eplan']],
      ['现场调试与安全规范', ['现场', '调试', '安全规范', '操作规程', '巡检', '运维']],
      ['文档编写与表达', ['文档', '报告', '方案编写', '技术文档', '说明书']],
      ['项目落地与推进', ['项目', '落地', '推进', '交付', '跟进']]]
    },
    {
      name: '机械 / 制造 / 工艺', k: ['机械', '制造', '工艺', '结构', '模具', '生产', '装配', '数控', '车辆', '汽车', '航空', '航天', '材料成型'],
      reqs: [['机械设计与制图', ['机械设计', '制图', 'cad', 'solidworks', 'catia', 'ug', '三维']],
      ['力学与有限元分析', ['力学', '有限元', 'ansys', '强度', '仿真', 'cae']],
      ['工艺与生产现场', ['工艺', '产线', '生产', '装配', '现场', '工装']],
      ['质量控制与检测', ['质量', '检测', '检验', '尺寸', '不良率', 'iso']],
      ['文档编写与表达', ['文档', '报告', '工艺文件', '技术文档']],
      ['项目落地与推进', ['项目', '落地', '推进', '交付', '排期']]]
    },
    {
      name: '硬件 / 电子 / 半导体', k: ['硬件', '电子', '半导体', '芯片', '电路', '射频', 'fpga', 'pcb', '集成电路', '嵌入式', '元器件', '光电'],
      reqs: [['电路与硬件基础', ['电路', '模电', '数电', '原理图', 'pcb', '元器件', '信号']],
      ['嵌入式开发', ['嵌入式', '单片机', 'stm32', 'c语言', 'arm', '驱动', '固件']],
      ['仪器使用与调试', ['示波器', '万用表', '频谱仪', '焊接', '调试', '测试']],
      ['EDA 工具', ['altium', 'cadence', 'eda', 'verilog', 'vivado', 'quartus']],
      ['文档编写与表达', ['文档', '报告', '设计文档', '技术文档']],
      ['项目落地与推进', ['项目', '落地', '推进', '交付']]]
    },
    {
      name: '软件 / 计算机 / AI', k: ['软件', '计算机', '开发', '程序', 'java', '前端', '后端', '算法', '人工智能', '机器学习', '大模型', '数据', 'ai', '互联网', 'it', '研发工程师'],
      reqs: [['编程基础', ['python', 'java', 'c++', '编程', '代码', '开发', '算法', '数据结构']],
      ['计算机基础', ['操作系统', '计算机网络', '数据结构', '数据库', 'sql', '计算机']],
      ['项目 / 实习经历', ['项目', '实习', '经历', '开发经验', '落地']],
      ['工程协作工具', ['git', 'linux', 'docker', '版本管理', 'code review']],
      ['学习能力', ['学习能力', '自学', '快速上手', '主动性']],
      ['沟通与协作', ['沟通', '协作', '团队', '对接']]]
    },
    {
      name: '通信 / 网络', k: ['通信', '网络', '无线', '5g', '协议', '基站', '光通信', '信号处理', '信息工程'],
      reqs: [['通信原理与协议', ['通信原理', '信号与系统', 'tcp/ip', '协议', '调制', '信道', '5g']],
      ['信号处理与仿真', ['信号处理', 'matlab', 'dsp', '仿真', '滤波']],
      ['网络与设备调试', ['网络', '路由', '交换机', '基站', '调试', '抓包']],
      ['文档编写与表达', ['文档', '报告', '方案', '技术文档']],
      ['项目落地与推进', ['项目', '落地', '推进', '交付']]]
    },
    {
      name: '测试 / 质量', k: ['测试', '质量', 'qa', 'qc', '验证', '可靠性'],
      reqs: [['测试理论基础', ['测试用例', '测试点', '黑盒', '白盒', '边界值', '等价类', '测试流程', '缺陷', '测试报告']],
      ['编程与脚本', ['python', 'java', 'shell', '脚本', '编程']],
      ['自动化 / 接口测试', ['自动化', 'selenium', 'pytest', '接口', 'postman', 'apifox']],
      ['Linux 与数据库', ['linux', 'sql', 'mysql', '数据库', '命令行']],
      ['问题排查与定位', ['排查', '定位', '复现', '日志', '分析']],
      ['文档编写与表达', ['文档', '报告', '用例', '总结']]]
    },
    {
      name: '化工 / 材料 / 检测', k: ['化工', '化学', '材料', '催化剂', '涂料', '检测', '环境', '环保', '食品', '制药工程'],
      reqs: [['化学 / 材料基础', ['化学', '材料', '化工', '高分子', '无机', '有机']],
      ['实验与检测能力', ['实验', '检测', '分析', '实验室', '仪器', '滴定', '色谱']],
      ['数据处理与报告', ['数据', '报告', 'excel', '统计', '整理']],
      ['安全与规范意识', ['安全', '规范', '危化', '环保', 'sop', '标准']],
      ['文档编写与表达', ['文档', '报告', '记录', '方案']]]
    },
    {
      name: '医药 / 生物 / 医疗', k: ['医药', '生物', '制药', '临床', '医疗', '器械', '检验', '药物', '细胞', '基因'],
      reqs: [['专业基础知识', ['生物', '医药', '药理', '临床', '解剖', '细胞', '分子']],
      ['实验 / 检测操作', ['实验', '检测', '检验', '采样', '仪器', '操作']],
      ['法规与质量体系', ['gmp', 'gcp', '法规', '质量体系', '注册', '合规']],
      ['数据处理与报告', ['数据', '统计', '报告', 'excel', '整理']],
      ['沟通与协作', ['沟通', '协作', '对接', '医生', '客户']]]
    },
    {
      name: '金融 / 财务 / 审计', k: ['金融', '财务', '会计', '审计', '税务', '风控', '银行', '投资', '证券', '保险', '精算', '资金'],
      reqs: [['财务 / 金融基础', ['财务', '会计', '金融', '审计', '税务', '报表', '估值']],
      ['数据处理与表格', ['excel', '数据', '统计', '报表', '数据透视', 'vlookup']],
      ['数据分析工具', ['sql', 'python', 'bi', 'wind', '数据分析']],
      ['细致度与责任心', ['细致', '认真', '责任心', '耐心', '严谨']],
      ['沟通与协作', ['沟通', '协作', '对接', '客户', '汇报']]]
    },
    {
      name: '市场 / 销售 / 运营', k: ['市场', '销售', '营销', '商务', '运营', '客户', '渠道', '品牌', '电商', '直播'],
      reqs: [['沟通表达与谈判', ['沟通', '表达', '谈判', '说服', '演讲']],
      ['客户 / 用户洞察', ['客户', '用户', '需求', '洞察', '调研', '画像']],
      ['数据整理与分析', ['数据', '报表', 'excel', '分析', '复盘']],
      ['项目落地与推进', ['项目', '活动', '落地', '推进', '执行', '复盘']],
      ['抗压与目标感', ['抗压', '目标', '业绩', '自驱', '结果导向']]]
    },
    {
      name: '供应链 / 物流 / 采购', k: ['供应链', '物流', '采购', '仓储', '运输', '计划', '报关', '关务', '配送'],
      reqs: [['流程与计划能力', ['计划', '排程', '流程', '库存', '交期', '交付']],
      ['数据整理与核对', ['数据', '台账', 'excel', '核对', '报表', '统计']],
      ['沟通与协调', ['沟通', '协调', '对接', '供应商', '跨部门']],
      ['问题排查与异常处理', ['异常', '处理', '排查', '跟进', '闭环']],
      ['责任心与细致度', ['责任心', '细致', '耐心', '踏实']]]
    },
    {
      name: '职能（人力 / 行政 / 法务）', k: ['人力', 'hr', '招聘', '行政', '法务', '合规', '文秘', '党建', '后勤', '培训'],
      reqs: [['文档编写与表达', ['文档', '公文', '写作', '报告', '方案', '通知']],
      ['沟通与协调', ['沟通', '协调', '对接', '组织', '接待']],
      ['办公软件', ['excel', 'ppt', 'word', 'wps', '办公软件']],
      ['流程与规范意识', ['流程', '制度', '规范', 'sop', '标准']],
      ['责任心与细致度', ['责任心', '细致', '耐心', '保密']]]
    },
    {
      name: '教育 / 培训', k: ['教育', '教师', '培训', '教研', '讲师', '辅导', '学科'],
      reqs: [['学科专业基础', ['学科', '专业', '知识', '课程', '教学']],
      ['表达与授课', ['表达', '授课', '讲解', '演讲', '课堂']],
      ['沟通与耐心', ['沟通', '耐心', '亲和力', '家长', '学生']],
      ['文档与课件', ['课件', 'ppt', '教案', '文档', '总结']]]
    },
    {
      name: '管培生 / 综合岗', k: ['管培生', '管理培训生', '培训生', '储备干部', '专业不限', '不限专业', '综合岗', '见习生', '储备人才'],
      reqs: [['学习与适应能力', ['学习', '自学', '快速上手', '适应', '成长']],
      ['沟通表达与协作', ['沟通', '表达', '协作', '团队', '汇报']],
      ['数据整理与文档', ['数据', '整理', 'excel', '文档', '报告', 'ppt']],
      ['项目 / 活动落地', ['项目', '活动', '落地', '推进', '执行', '复盘']],
      ['责任心与抗压', ['责任心', '抗压', '自驱', '踏实', '主动']],
      ['逻辑与问题分析', ['逻辑', '分析', '问题', '解决', '思考']]]
    },
    {
      name: '设计 / 传媒 / 内容', k: ['设计', 'ui', '平面', '视觉设计', '工业设计', '传媒', '编导', '文案', '新媒体', '摄影', '剪辑'],
      reqs: [['设计软件与工具', ['ps', 'ai', 'photoshop', 'illustrator', 'figma', 'cad', 'pr', 'ae']],
      ['作品集与审美', ['作品集', '审美', '排版', '配色', '创意']],
      ['内容表达与文案', ['文案', '写作', '表达', '脚本', '内容']],
      ['沟通与需求理解', ['沟通', '需求', '理解', '改稿', '协作']]]
    }
  ];

  /** 按岗位名 / 备注 / 行业判断赛道 */
  function trackOf(job) {
    job = job || {};
    var pos = String(job.position || '').toLowerCase();
    var rmk = String(job.remark || '').toLowerCase();
    var cat = String(job.category || '').toLowerCase();
    if (!(pos + rmk + cat).trim()) return null;
    var best = null, bestN = 0;
    TRACK.forEach(function (t) {
      var n = 0;
      t.k.forEach(function (w) {
        if (pos.indexOf(w) >= 0) n += 3;        /* 岗位名权重最高 */
        if (rmk.indexOf(w) >= 0) n += 1;
        if (cat.indexOf(w) >= 0) n += 1;
      });
      if (n > bestN) { bestN = n; best = t; }
    });
    return bestN ? best : null;
  }
  A.trackOf = trackOf;

  A.resumeText = function (p) {
    p = p || {};
    var order = ['name','school','major','degree','degreeType','educationStart','graduationDate','rank','gpa','englishLevel',
      'expectedPosition','jobType','expectedCity','expectedSalary','skills','certificate','projectExperience','internship',
      'schoolExperience','awards','selfEvaluation','careerPlan','homepage','remark'];
    var skip = {'qq':1,'wechat':1,'idCard':1,'phone':1,'email':1,'address':1,'postalCode':1,'emergencyContact':1,'emergencyPhone':1,'_ver':1};
    var parts = [], used = {};
    order.forEach(function (k) { if (p[k] && String(p[k]).trim()) { parts.push(String(p[k])); used[k]=1; } });
    Object.keys(p).forEach(function (k) {
      if (used[k] || skip[k] || k.charAt(0) === '_') return;
      var v = String(p[k] || '').trim();
      if (v && v.length < 3000) parts.push(v);
    });
    return parts.join(String.fromCharCode(10));
  };

  /** 岗位 → JD 草稿（没有 JD 时用字段 + 赛道典型要求拼出来） */
  A.jdDraft = function (job) {
    job = job || {};
    if (job.jd && String(job.jd).trim()) return String(job.jd);
    var lines = [];
    lines.push('【岗位】' + (job.company || '') + ' · ' + (job.position || ''));
    if (job.category) lines.push('【行业 / 方向】' + job.category);
    if (job.city) lines.push('【城市】' + job.city);
    if (job.salary) lines.push('【薪资】' + job.salary);
    if (job.remark) lines.push('【备注】' + job.remark);
    var tr = trackOf(job);
    if (tr) {
      lines.push('【方向判断】' + tr.name);
      lines.push('【该方向常见要求】' + tr.reqs.map(function (r) { return r[0]; }).join('；'));
    }
    lines.push('【说明】该岗位暂未录入完整 JD，以上为系统按岗位名称生成的典型要求参考，粘贴真实 JD 后重新分析会更准。');
    return lines.join('\n');
  };

  /** JD 完整度：full = 有真实 JD；weak = 只有岗位元信息 */
  function jdQuality(jd, job) {
    var t = String(jd || '');
    t = t.replace(/【(岗位|行业 \/ 方向|城市|薪资|备注|方向判断|该方向常见要求|说明)】[^\n]*/g, '');
    var real = t.replace(/[\s\u3000]/g, '');
    return real.length >= 60 ? 'full' : 'weak';
  }
  A.jdQuality = jdQuality;

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

  /* ---------------- 离线分析（v1.1.0：评分曲线 + JD 完整度分级） ---------------- */

  function kwsOf(r) {
    if (r.type === 'track') return r.kws;
    return (r.type === 'tech' ? TECH[r.name] : GENERAL[r.name]) || [];
  }

  function hitOf(rt, r) {
    var kws = kwsOf(r), hit = null;
    kws.forEach(function (k) { if (!hit && rt.indexOf(String(k).toLowerCase()) >= 0) hit = k; });
    return hit;
  }

  /** 专业对口判定：岗位文本里出现简历专业名（或去掉"工程/技术/科学/学院"后的词根）即算对口 */
  function majorMatch(job, profile) {
    try {
      var mj = String((profile || {}).major || '').trim();
      if (!mj) return '';
      var pos = String((job && (job.position + ' ' + (job.remark || '') + ' ' + (job.category || ''))) || '');
      if (!pos.trim()) return '';
      if (pos.indexOf(mj) >= 0) return '岗位明确写了「' + mj + '」';
      var root = mj.replace(/(工程|技术|科学|学院|专业|系|与|及其|方向)$/g, '').trim();
      if (root.length >= 2 && pos.indexOf(root) >= 0) return '岗位提到的专业方向含「' + root + '」，与你的「' + mj + '」接近';
      /* 「智能科学与技术」→ 也算「计算机类/电子信息类/人工智能」 */
      var cls = { '智能': ['人工智能', '智能科学', '计算机', '电子信息'], '计算机': ['计算机', '软件', '智能', '信息技术'], '电子信息': ['电子信息', '通信', '电子', '计算机'], '自动化': ['自动化', '控制', '电气', '机械'], '软件': ['软件', '计算机', '信息技术'] };
      for (var k in cls) {
        if (mj.indexOf(k) < 0) continue;
        for (var i = 0; i < cls[k].length; i++) {
          if (pos.indexOf(cls[k][i]) >= 0) return '岗位方向「' + cls[k][i] + '」与你的「' + mj + '」同属一个专业大类';
        }
      }
      return '';
    } catch (e) { return ''; }
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  A.offline = function (resumeText, jdText, job) {
    var rt = String(resumeText || '').toLowerCase();
    var jd = String(jdText || '');
    var job_ = job || {};
    var quality = jdQuality(jd, job_);
    var tr = trackOf(job_);

    /* 1) 组装要求项：真实 JD 用关键词扫描；JD 不全时补上赛道典型要求 */
    var reqs = pickReqs(jd);
    if (quality === 'weak' && tr) {
      var seen = {};
      reqs.forEach(function (r) { seen[r.name] = 1; });
      tr.reqs.forEach(function (r) {
        if (seen[r[0]]) return;
        seen[r[0]] = 1;
        reqs.push({ name: r[0], kw: r[1][0], w: 2, type: 'track', kws: r[1] });
      });
    }

    /* 2) 逐项比对 */
    var techHit = 0, genHit = 0, got = 0, total = 0;
    var highlights = [], gaps = [];
    reqs.forEach(function (r) {
      total += r.w;
      var hitKw = hitOf(rt, r);
      if (hitKw) {
        got += r.w;
        if (r.type === 'tech') techHit++; else genHit++;
        highlights.push({ title: r.name, evidence: snippet(String(resumeText || ''), hitKw) || ('简历中含「' + hitKw + '」') });
      } else {
        gaps.push({
          title: r.name,
          why: (r.type === 'tech' ? '技术 / 专业能力' : (r.type === 'track' ? '该方向常见要求' : '通用能力')) +
            '：JD 提到「' + r.kw + '」，简历里没检索到'
        });
      }
    });
    var ratio = total ? got / total : 0;

    /* 3) 评分
       校招场景 JD 普遍列 10+ 条要求，应届生命中 30% 已属可投，
       所以不再用线性比例（命中 3/10 = 30 分→不匹配），改为带基础分的曲线映射。 */
    var score, note = '';
    if (!reqs.length) {
      score = 50;
      note = 'JD 里没检索到任何能力关键词，也没有识别出岗位方向，当前 50 分是中性估值。粘贴真实 JD 后重新分析才有参考价值。';
    } else if (quality === 'weak') {
      /* JD 不全：只做方向级粗估，不下「不匹配」这种强结论，分数限制在 42~70 */
      score = Math.round(40 + 34 * Math.pow(ratio, 0.7));
      var pos = String((job_.position || '') + ' ' + (job_.category || '') + ' ' + (job_.remark || '')).toLowerCase();
      var same = 0;
      ['测试', '嵌入式', '视觉', '算法', '运维', '产品', '硬件', '数据', '开发', '人工智能', '通信', '软件', '计算机'].forEach(function (w) {
        if (pos.indexOf(w) >= 0 && rt.indexOf(w) >= 0) same++;
      });
      if (same) score += Math.min(6, same * 2);
      var mj = majorMatch(job_, A.profile);
      if (mj) { score += 5; highlights.unshift({ title: '专业对口', evidence: mj }); }
      score = clamp(score, 45, 75);   /* JD 不全时不判「不匹配」，也不给「高度推荐」 */
      note = '该岗位没有录入完整 JD，' + (tr ? '当前按「' + tr.name + '」方向的常见要求粗估' : '当前只能按岗位名称粗估') +
        '，因此不给出「不匹配」结论。把真实 JD 粘进上面的文本框并点「保存 JD」后再分析，分数会精确到具体能力项。';
    } else {
      score = Math.round(32 + 60 * Math.pow(ratio, 0.85));
      var coreMiss = 0;
      reqs.forEach(function (r) { if (r.w >= 2 && !hitOf(rt, r)) coreMiss++; });
      score -= Math.min(12, coreMiss * 3);          /* 核心要求没命中才真扣分 */
      var dirWords = ['测试', '嵌入式', '视觉', '算法', '运维', '产品', '硬件', '数据', '开发', '通信', '电气', '机械', '财务', '销售', '供应链'];
      var dirInJd = dirWords.filter(function (w) { return jd.indexOf(w) >= 0; });
      if (dirInJd.length && dirInJd.every(function (w) { return rt.indexOf(w) < 0; })) score -= 5;
      var pos2 = String((job_.position || '') + ' ' + (job_.category || '')).toLowerCase();
      var same2 = 0;
      ['测试', '嵌入式', '视觉', '算法', '运维', '产品', '硬件', '数据', '开发', '人工智能', '通信'].forEach(function (w) {
        if (pos2.indexOf(w) >= 0 && rt.indexOf(w) >= 0) same2++;
      });
      if (same2) score += Math.min(8, same2 * 3);
      if (/本科|硕士/.test(rt) && /本科|硕士|应届|校招|2027|2026/.test(jd)) score += 2;
      var mj = majorMatch(job_, A.profile);
      if (mj) { score += 5; highlights.unshift({ title: '专业对口', evidence: mj }); }
      score = clamp(score, 0, 100);
      note = '按 JD 中 ' + reqs.length + ' 项要求比对，命中 ' + highlights.length + ' 项（命中率 ' + Math.round(ratio * 100) + '%）。';
    }

    /* 4) 非 IT / 跨方向岗位：通用能力权重更高 */
    var isNonIT = reqs.length > 0 && techHit <= 1 && genHit >= 1;
    if (isNonIT) {
      var g = 0, t2 = 0;
      reqs.forEach(function (r) {
        var w = (r.type === 'track' || r.type === 'general') ? r.w * 1.6 : r.w * 0.7;
        t2 += w;
        if (hitOf(rt, r)) g += w;
      });
      if (t2) {
        var s2 = Math.round(g / t2 * 100);
        score = quality === 'weak'
          ? clamp(Math.round(s2 * 0.52 + 26), 45, 75)
          : clamp(Math.round(score * 0.4 + (32 + 60 * Math.pow(g / t2, 0.85)) * 0.6), 0, 100);
      }
    }

    var plain = plainTalk(job_);
    var transfer = '';
    if (isNonIT || quality === 'weak') {
      var mig = [];
      highlights.forEach(function (h) {
        var r = null;
        reqs.forEach(function (x) { if (x.name === h.title) r = x; });
        if (r && r.type !== 'tech') mig.push(h.title);
      });
      transfer = mig.length
        ? '可迁移能力：' + mig.slice(0, 5).join('、') + '。你原来的技术经历可以翻译成这些通用能力——做项目 = 从 0 到 1 落地 + 跨角色推进；做测试/调试 = 流程意识 + 问题定位 + 文档产出。建议在简历开头用 3 行写明转岗动机。'
        : '可迁移能力：暂未检索到与该岗位明显重合的通用能力。建议先看 JD / 岗位描述里反复出现的动词（如"整理""对接""跟进""排查""编写"），把你的经历用同样的动词重写一遍，命中率会明显上升。';
    }

    return {
      mode: 'offline',
      score: score, level: levelOf(score),
      highlights: highlights.slice(0, 8),
      gaps: gaps.slice(0, 6),
      plain: plain,
      advice: buildAdvice(gaps, isNonIT, job_),
      transfer: transfer,
      isNonIT: isNonIT,
      quality: quality,
      track: tr ? tr.name : '',
      reqCount: reqs.length,
      hitCount: highlights.length,
      ratio: Math.round(ratio * 100),
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
      '【我的简历档案】\n' + String(resumeText || '').slice(0, 6000) +
      (jdQuality(jdText, job) === 'weak' ? '\n\n【重要】这份 JD 不完整，只有岗位名称与行业等元信息，没有具体职责和任职要求。请据此做方向级保守估计：分数控制在 45~75 区间，不要给极端值，并在 transfer 字段里说明还需要补充哪些 JD 信息才能准确判断。' : '');
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
      if (r.ok) {
        var d = r.data;
        d.quality = jdQuality(jdText, job);
        var t2 = trackOf(job);
        d.track = t2 ? t2.name : '';
        if (!d.note) d.note = d.quality === 'weak'
          ? 'AI 也只拿到了岗位名称级别的 JD，分数为方向级估计，补全真实 JD 后会更准。'
          : 'AI 深度分析结果。';
        return { data: d, used: 'ai' };
      }
      return { data: A.offline(resumeText, jdText, job), used: 'offline', err: r.err };
    }
    return { data: A.offline(resumeText, jdText, job), used: 'offline' };
  };

  root.FitAnalyzer = A;
})(typeof window !== 'undefined' ? window : this);
