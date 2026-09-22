/**
 * resume-parser.js
 * ------------------------------------------------------------
 * 简历文本 → 档案字段 的纯本地抽取引擎（v1.3.0）
 *
 * 设计原则：
 *  1. 完全本地运行，不联网、不上传任何内容
 *  2. 只做「高置信度」抽取：宁可留空让你自己填，也不猜错
 *  3. 所有规则都是 try/catch 包裹，任何一步出错不影响其余字段
 *
 * 通用命名空间 root.ResumeParser，扩展 options 页与秋招工作台共用同一份文件
 * ------------------------------------------------------------
 */
(function (root) {
  'use strict';

  const P = { version: '1.3.0' };

  /* ---------------- 基础工具 ---------------- */

  function flat(t) { return String(t || '').replace(/\r/g, '').replace(/[ \t\u00a0]+/g, ' '); }

  function lines(t) {
    return String(t || '').replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  /** 就近取值：取关键词所在行、关键词之后的第一段（遇到 2 个以上空格或竖线即停） */
  function near(t, kwRe, valRe) {
    let m;
    try { m = t.match(kwRe); } catch (e) { return ''; }
    if (!m) return '';
    let seg = t.slice(m.index + m[0].length);
    const nl = seg.indexOf('\n');
    if (nl >= 0) seg = seg.slice(0, nl);
    seg = seg.split(/\s{2,}|\s*\|\s*/)[0];
    seg = cutNextField(seg);
    let v;
    try { v = seg.match(valRe); } catch (e) { return ''; }
    return v ? String(v[1] || '').trim() : '';
  }

  /** 一行里连着写多个字段时（"籍贯：X 现居：Y"），只保留第一个字段的值 */
  const NEXT_FIELD = /(?:籍贯|生源地|户口所在地|户籍|现居(?:住)?(?:地址)?|通讯地址|居住地址|家庭住址|住址|地址|电话|手机|邮箱|微信|QQ|qq|邮编|邮政编码|政治面貌|民族|出生(?:日期|年月)?|生日|性别|年龄|身高|体重|学校|院校|就读院校|毕业院校|所学专业|专业名称|专业|学历|GPA|绩点|平均学分绩|排名|专业排名|英语|求职意向|意向岗位|应聘岗位|期望(?:城市|岗位|职位|薪资|薪酬|工作)?|到岗时间|可实习时间|实习时长)/;
  function cutNextField(s) {
    try {
      const re = new RegExp('\\s+(?:' + NEXT_FIELD.source + ')[：:]', 'g');
      const m = re.exec(s);
      return m ? s.slice(0, m.index) : s;
    } catch (e) { return s; }
  }

  function clean(s, max) {
    s = String(s == null ? '' : s).replace(/^[\s:：、,，.。\-—|]+/, '').replace(/[\s,，;；]+$/, '').trim();
    if (max && s.length > max) s = s.slice(0, max);
    return s;
  }

  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) : s; }

  /* ---------------- 常见专业名（命中即采信） ---------------- */
  const MAJOR_HINT = [
    '计算机科学与技术', '软件工程', '电子信息工程', '电子科学与技术', '通信工程', '自动化',
    '人工智能', '数据科学与大数据技术', '大数据管理与应用', '网络工程', '信息安全', '物联网工程',
    '机械设计制造及其自动化', '机械工程', '车辆工程', '电气工程及其自动化', '测控技术与仪器',
    '土木工程', '工程管理', '工程造价', '建筑学', '城乡规划',
    '会计学', '财务管理', '金融学', '国际经济与贸易', '市场营销', '工商管理', '人力资源管理',
    '行政管理', '法学', '汉语言文学', '新闻学', '广告学', '英语', '日语', '数学与应用数学',
    '统计学', '应用统计学', '物理学', '化学', '生物科学', '药学', '临床医学', '护理学',
    '材料科学与工程', '化学工程与工艺', '环境工程', '食品科学与工程', '工业设计', '视觉传达设计'
  ];

  /* ---------------- 字段抽取 ---------------- */

  function pickName(t, ls) {
    let v = near(t, /姓名[：:\s]*/, /([一-龥]{2,6}|[A-Za-z .]{3,20})(?=[^\u4e00-\u9fa5A-Za-z]|$)/);
    if (v) return clean(v, 10);
    for (let i = 0; i < Math.min(6, ls.length); i++) {
      const s = ls[i];
      if (/简历|个人|求职|应聘|电话|手机|邮箱|@|大学|学院|专业|男|女|20\d{2}/.test(s)) continue;
      if (/^[一-龥]{2,4}$/.test(s)) return s;
      const m = s.match(/^[一-龥]{2,4}(?=[\s|｜])/);
      if (m) return m[0];
    }
    return '';
  }

  function pickIdCard(t) {
    const m = t.match(/(?<!\d)\d{17}[\dXx](?!\d)/);
    return m ? m[0].toUpperCase() : '';
  }

  function fromId(id) {
    const out = {};
    if (!/^\d{17}[\dXx]$/.test(id)) return out;
    out.birthday = id.slice(6, 10) + '-' + id.slice(10, 12) + '-' + id.slice(12, 14);
    const n = parseInt(id.slice(16, 17), 10);
    if (!isNaN(n)) out.gender = (n % 2 === 1) ? '男' : '女';
    return out;
  }

  function pickSchool(t, ls) {
    let v = near(t, /(?:学校|院校|就读院校|毕业院校|所在院校)[：:\s]*/, /([^\n，,；;。]{2,30})/);
    if (v && /大学|学院|学校/.test(v)) return clean(v, 30);
    for (const s of ls) {
      if (/专业|实习|项目|获奖/.test(s) && !/大学|学院/.test(s)) continue;
      const m = s.match(/([一-龥A-Za-z]{2,18}(?:大学|学院))/);
      if (m && !/^(?:计算机|软件|电子|信息|机械|管理|经济|外语|艺术|理学|工学|文学)/.test(m[1])) return m[1];
    }
    return '';
  }

  function pickMajor(t, ls) {
    let v = near(t, /(?:所学专业|专业名称|专业)[：:]\s*/, /([^\n，,；;。|]{2,30})/);
    if (v && !/技能|排名|课程|证书|方向/.test(v)) return clean(v, 30);
    for (const mj of MAJOR_HINT) if (t.indexOf(mj) >= 0) return mj;
    return '';
  }

  function pickDegree(t) {
    if (/博士(研究生)?/.test(t)) return '博士';
    if (/硕士|研究生/.test(t)) return '硕士';
    if (/本科|学士/.test(t)) return '本科';
    if (/专科|大专/.test(t)) return '大专';
    return '';
  }

  function pickEduRange(t) {
    const out = {};
    let m = t.match(/(20\d{2})\s*[.\-\/年]\s*(0?[1-9]|1[0-2])\s*月?\s*[-~—至到]\s*(20\d{2})\s*[.\-\/年]\s*(0?[1-9]|1[0-2])/);
    if (m) {
      out.educationStart = m[1] + '-' + ('0' + m[2]).slice(-2);
      out.graduationDate = m[3] + '-' + ('0' + m[4]).slice(-2);
      return out;
    }
    m = t.match(/(20\d{2})\s*[.\-\/年]\s*(0?[1-9]|1[0-2])\s*月?\s*[-~—至到]\s*(?:(20\d{2})\s*[.\-\/年]\s*)?(0?[1-9]|1[0-2])/);
    if (m) {
      out.educationStart = m[1] + '-' + ('0' + m[2]).slice(-2);
      out.graduationDate = (m[3] || m[1]) + '-' + ('0' + m[4]).slice(-2);
      return out;
    }
    let g = near(t, /(?:毕业时间|毕业年份|预计毕业)[：:\s]*/, /((?:20\d{2})\s*[.\-\/年]\s*(?:0?[1-9]|1[0-2])?)/);
    if (g) out.graduationDate = g.replace(/[年\/.]/g, '-').replace(/-$/, '').replace(/-(\d)$/, '-0$1');
    return out;
  }

  /** 段落抽取：命中标题行后一直取到下一个标题 */
  function section(ls, keys, maxLen) {
    let start = -1;
    for (let i = 0; i < ls.length; i++) {
      const s = ls[i];
      if (s.length > 26) continue;
      if (keys.some(k => s.indexOf(k) >= 0)) { start = i; break; }
    }
    if (start < 0) return '';
    const buf = [];
    for (let i = start + 1; i < ls.length; i++) {
      const s = ls[i];
      if (isTitle(s)) break;
      buf.push(s);
    }
    const text = buf.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return text.slice(0, maxLen || 1500);
  }

  function isTitle(s) {
    if (s.length > 24) return false;
    if (/[。；;]/.test(s)) return false;
    return /^(?:[一二三四五六七八九十]、)?(?:个人(?:信息|简介|概况)|基本(?:信息|情况)|教育(?:背景|经历)|(?:专业|核心)?技能|技能(?:特长|清单)?|(?:实习|工作|项目|校园|社会)?经历|项目(?:经验)?|获奖(?:情况|荣誉)?|荣誉(?:奖项)?|证书|自我评价|个人评价|个人总结|求职意向|意向岗位|应聘岗位|附件|作品集|其他)/.test(s);
  }

  /* ---------------- 主入口 ---------------- */

  /**
   * @param {string} text 简历纯文本
   * @returns {{fields:Object, count:number}} 只含识别到的字段
   */
  P.parse = function (text) {
    const t = flat(text);
    const ls = lines(text);
    const out = {};
    const put = (k, v) => { try { const s = clean(v, 2000); if (s) out[k] = s; } catch (e) { } };

    try {
      const name = pickName(t, ls); put('name', name);

      const phone = (t.match(/(?:\+?86[-\s]?)?(1[3-9]\d{9})(?!\d)/) || [])[1] || '';
      put('phone', phone);

      const email = (t.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/) || [])[0] || '';
      put('email', email);
      if (email && !out.namePinyin) {
        const pre = email.split('@')[0] || '';
        if (/^[a-z]{2,}(\.[a-z]{2,})?$/i.test(pre)) {
          out.namePinyin = pre.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }

      const id = pickIdCard(t);
      put('idCard', id);
      if (id) {
        const d = fromId(id);
        if (d.birthday) put('birthday', d.birthday);
        if (d.gender) put('gender', d.gender);
      }

      if (!out.gender) put('gender', near(t, /性别[：:\s]*/, /(男|女)/));
      if (!out.gender) {
        const g = t.slice(0, 260).match(/(?:^|[|｜\s\/,，、])([男女])(?=[|｜\s\/,，、]|$)/);
        if (g) out.gender = g[1];
      }
      if (!out.birthday) {
        let b = near(t, /(?:出生(?:日期|年月)?|生日)[：:\s]*/, /((?:19|20)\d{2}\s*[.\-\/年]\s*(?:0?[1-9]|1[0-2])\s*[.\-\/月]?\s*(?:0?[1-9]|[12]\d|3[01])?)/);
        if (!b) {
          const b2 = t.slice(0, 300).match(/((?:19|20)\d{2})[-\/.年](\d{1,2})[-\/.月](\d{1,2})/);
          if (b2) b = b2[1] + '-' + ('0' + b2[2]).slice(-2) + '-' + ('0' + b2[3]).slice(-2);
        }
        if (b) put('birthday', b.replace(/[年\/.]/g, '-').replace(/[月]/g, '-').replace(/-+/g, '-').replace(/-$/, ''));
      }
      if (out.birthday) {
        const y = parseInt(out.birthday.slice(0, 4), 10);
        if (y > 1970) put('age', String(new Date().getFullYear() - y));
      }

      put('nation', near(t, /民族[：:\s]*/, /([一-龥]{1,8}族)/));
      if (!out.nation) {
        const nt = t.match(/([一-龥]{1,4}族)(?!.*?族.*?族)/);
        if (nt && nt[1] !== '民族') out.nation = nt[1];
      }
      put('politicalStatus', (t.match(/(中共党员|中共预备党员|共青团员|群众|入党积极分子)/) || [])[1] || '');
      put('hometown', near(t, /(?:籍贯|生源地|户口所在地|户籍)[：:\s]*/, /([^\n，,；;。|]{2,25})/));

      put('wechat', near(t, /(?:微信|WeChat|wechat)[号：:\s]*/, /([A-Za-z][\w-]{4,19})/));
      put('qq', near(t, /(?:QQ|qq|Q\s*Q)[号：:\s]*/, /(\d{5,12})/));
      put('address', near(t, /(?:现居(?:住)?(?:地址)?|通讯地址|居住地址|家庭住址|住址|地址)[：:\s]*/, /([^\n，,；;。|]{4,50})/));
      put('postalCode', near(t, /(?:邮编|邮政编码)[：:\s]*/, /(\d{6})/));
      put('homepage', (t.match(/https?:\/\/(?:github\.com|gitee\.com|juejin\.cn|blog\.csdn\.net|zhihu\.com|[\w.-]+\.(?:com|cn|io|me|net))\/[\w.\/-]*/) || [])[0] || '');

      put('school', pickSchool(t, ls));
      put('major', pickMajor(t, ls));
      put('degree', pickDegree(t));
      if (/全日制/.test(t)) out.degreeType = '全日制';
      if (/985/.test(t)) out.schoolType = '985';
      else if (/211/.test(t)) out.schoolType = '211';
      else if (/双一流/.test(t)) out.schoolType = '双一流';

      const rg = pickEduRange(t);
      if (rg.educationStart) out.educationStart = rg.educationStart;
      if (rg.graduationDate) out.graduationDate = rg.graduationDate;

      let gpa = near(t, /(?:GPA|绩点|平均学分绩)[：:\s]*/, /([\d.]{2,6}(?:\s*\/?\s*[\d.]{1,6})?)/);
      if (gpa) put('gpa', gpa.replace(/\s+/g, ''));
      else {
        const g2 = t.match(/(?:^|[^\d])(\d\.\d{1,2})\s*\/\s*(?:4\.0|4\b|5\.0|5\b)/);
        if (g2) put('gpa', g2[1] + '/4.0');
      }
      put('rank', near(t, /(?:排名|专业排名|成绩排名)[：:\s]*/, /([^\n，,；;。]{1,20})/));

      const eng = (t.match(/(CET[-\s]?6|CET[-\s]?4|英语六级|英语四级|六级|四级|雅思\s*[\d.]+|托福\s*\d+|IELTS\s*[\d.]+|TOEFL\s*\d+)/i) || [])[1] || '';
      if (eng) {
        put('englishLevel', /6|六/.test(eng) ? (/(CET|级)/i.test(eng) ? 'CET-6' : eng) : (/四级|CET[-\s]?4/.test(eng) ? 'CET-4' : eng));
        const sc = t.match(/(?:六级|四级|CET[-\s]?6|CET[-\s]?4)[^\d]{0,6}(\d{3})/);
        if (sc) put('cetScore', (/6|六/.test(eng) ? '六级 ' : '四级 ') + sc[1] + ' 分');
      }

      put('expectedPosition', near(t, /(?:应聘岗位|意向岗位|求职意向|目标岗位|期望(?:职位|岗位)|申请岗位)[：:\s]*/, /([^\n，,；;。|]{2,25})/));
      put('expectedCity', near(t, /(?:期望城市|意向城市|期望工作(?:城市|地点)|工作地点|意向工作地)[：:\s]*/, /([^\n，,；;。|]{2,25})/));
      put('expectedSalary', near(t, /(?:期望薪资|期望薪酬|薪资要求)[：:\s]*/, /([^\n，,；;。|]{1,20})/));
      put('internTime', near(t, /(?:可实习时间|实习时长|可到岗时间|到岗时间)[：:\s]*/, /([^\n，,；;。|]{2,30})/));
      put('height', near(t, /身高[：:\s]*/, /(\d{2,3})\s*(?:cm|CM|厘米)?/));
      put('weight', near(t, /体重[：:\s]*/, /(\d{2,3})\s*(?:kg|KG|公斤)?/));

      put('skills', section(ls, ['专业技能', '核心技能', '技能特长', '技能清单', '技能'], 1200));
      put('projectExperience', section(ls, ['项目经历', '项目经验', '项目'], 1800));
      put('internship', section(ls, ['实习经历', '工作经历', '实习经验', '工作经验'], 1500));
      put('awards', section(ls, ['获奖情况', '荣誉奖项', '获奖荣誉', '奖项荣誉', '所获荣誉', '获奖'], 1000));
      put('schoolExperience', section(ls, ['校园经历', '学生工作', '社团经历', '校内经历'], 1000));
      put('selfEvaluation', section(ls, ['自我评价', '个人评价', '个人总结', '自我评价与总结'], 1200));
    } catch (e) {
      /* 单字段失败不影响整体 */
    }

    return { fields: out, count: Object.keys(out).length };
  };

  /* ---------------- 文件读取 ---------------- */

  /** 极简 ZIP 解包：只取 word/document.xml（.docx） */
  async function docxText(file) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const dv = new DataView(buf.buffer);
    for (let i = 0; i + 30 < buf.length; i++) {
      if (buf[i] !== 0x50 || buf[i + 1] !== 0x4b || buf[i + 2] !== 0x03 || buf[i + 3] !== 0x04) continue;
      const method = dv.getUint16(i + 8, true);
      const csize = dv.getUint32(i + 18, true);
      const nlen = dv.getUint16(i + 26, true);
      const elen = dv.getUint16(i + 28, true);
      const name = new TextDecoder().decode(buf.subarray(i + 30, i + 30 + nlen));
      if (name !== 'word/document.xml') { i += 29 + nlen + elen + csize - 1; continue; }
      const data = buf.subarray(i + 30 + nlen + elen, i + 30 + nlen + elen + csize);
      let xml;
      if (method === 0) xml = new TextDecoder().decode(data);
      else if (typeof DecompressionStream === 'function') {
        const ds = new DecompressionStream('deflate-raw');
        const stream = new Blob([data]).stream().pipeThrough(ds);
        xml = await new Response(stream).text();
      } else throw new Error('浏览器不支持解压，请复制文本粘贴');
      return xml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<\/w:tc>|<\/w:tr>/g, ' | ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    }
    throw new Error('不是有效的 .docx');
  }

  /**
   * 读取简历文件为纯文本
   * @returns {Promise<string>} 失败会 throw（PDF 不支持，提示复制文本）
   */
  P.readFile = async function (file) {
    const n = (file && file.name || '').toLowerCase();
    if (/\.(txt|md|markdown|csv|json)$/.test(n)) return await file.text();
    if (/\.docx?$/.test(n) && !/\.doc$/.test(n)) return await docxText(file);
    if (/\.doc$/.test(n)) throw new Error('老版 .doc 请另存为 .docx 或直接复制文本粘贴');
    if (/\.pdf$/.test(n)) throw new Error('PDF 无法直接解析，请用 Ctrl+A 全选复制文本粘贴到下面的框里');
    return await file.text();
  };

  root.ResumeParser = P;
})(typeof window !== 'undefined' ? window : this);
