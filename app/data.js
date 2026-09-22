/* =======================================================
   data.js · 原创手绘卡通图标系统（马卡龙浅色系 / 可商用）+ 秋招初始样例数据
   ======================================================= */
(function (global) {
  'use strict';

  /* ---------- 1. 图标系统（原创手绘卡通 · 马卡龙浅色系 · 可商用） ----------
     风格标准：圆角 100% 圆润、块面饱满、线条柔和、无尖锐棱角、低饱和马卡龙配色；
     全部为原创绘制（非任何 IP 形象、非通用线性图标、非系统默认图标），零版权风险。
     可选扩展：把同名 PNG 放入 assets/icons/ 即优先使用自定义图片，缺失时自动回退本套图标。
  ------------------------------------------------------------------------ */
  var ICON_DIR = 'assets/icons/';
  var ICON_KEYS = [
    'dashboard', 'job', 'exam', 'interview', 'resume', 'question', 'offer', 'todo', 'resource', 'setting',
    'plus', 'edit', 'trash', 'sync', 'link', 'clock', 'lock', 'user', 'shield', 'chart',
    'filter', 'download', 'upload', 'check', 'star', 'calendar', 'pin', 'book', 'target', 'cloud',
    'phone', 'team', 'flag', 'bell', 'refresh', 'doc', 'wallet', 'route', 'key', 'cap'
  ];

  /* 马卡龙低饱和调色板（浅底 + 柔和强调色） */
  var C = {
    T1: '#E9F7F4', T2: '#7FD3C7',   // 浅青
    P1: '#FDEDEA', P2: '#F5A9A0',   // 浅粉
    Y1: '#FFF6E3', Y2: '#F5C87A',   // 浅黄
    B1: '#EDF1FB', B2: '#A9BEF0',   // 浅蓝
    V1: '#F3ECF9', V2: '#C4A8E0',   // 浅紫
    G1: '#EEF7E8', G2: '#A5D69B',   // 浅绿
    W:  '#FFFFFF'
  };

  /* 图标图元：r=圆角矩形 c=圆 e=椭圆 p=填充路径 l=描边路径（全部圆头圆角） */
  var ICON_ART = {
    dashboard: [
      { t: 'r', x: 3, y: 4, w: 18, h: 14, r: 4.5, f: C.T1 },
      { t: 'r', x: 6.6, y: 11, w: 3, h: 4.4, r: 1.5, f: C.T2 },
      { t: 'r', x: 10.5, y: 8, w: 3, h: 7.4, r: 1.5, f: C.T2 },
      { t: 'r', x: 14.4, y: 6, w: 3, h: 9.4, r: 1.5, f: C.T2 }
    ],
    job: [
      { t: 'l', d: 'M8.4 7.2V5.6a1.6 1.6 0 0 1 1.6-1.6h4a1.6 1.6 0 0 1 1.6 1.6v1.6', w: 2 },
      { t: 'r', x: 3, y: 7, w: 18, h: 12, r: 4, f: C.P1 },
      { t: 'r', x: 9.4, y: 10.6, w: 5.2, h: 3.6, r: 1.6, f: C.P2 }
    ],
    exam: [
      { t: 'r', x: 5, y: 3, w: 14, h: 18, r: 3.5, f: C.Y1 },
      { t: 'p', d: 'M15 3l4 4.2h-2.9a1.1 1.1 0 0 1-1.1-1.1z', f: C.Y2 },
      { t: 'r', x: 8, y: 9, w: 8, h: 1.8, r: 0.9, f: C.Y2 },
      { t: 'r', x: 8, y: 12.8, w: 8, h: 1.8, r: 0.9, f: C.Y2 },
      { t: 'r', x: 8, y: 16.6, w: 5, h: 1.8, r: 0.9, f: C.Y2 }
    ],
    interview: [
      { t: 'r', x: 3, y: 4, w: 17, h: 11.5, r: 4.5, f: C.T1 },
      { t: 'p', d: 'M7.6 15.2l-2.4 4.6 5-1.4z', f: C.T1 },
      { t: 'c', cx: 8, cy: 9.8, r: 1.6, f: C.T2 },
      { t: 'c', cx: 11.8, cy: 9.8, r: 1.6, f: C.T2 },
      { t: 'c', cx: 15.6, cy: 9.8, r: 1.6, f: C.T2 }
    ],
    resume: [
      { t: 'r', x: 5, y: 3, w: 14, h: 18, r: 3.5, f: C.B1 },
      { t: 'p', d: 'M15 3l4 4.2h-2.9a1.1 1.1 0 0 1-1.1-1.1z', f: C.B2 },
      { t: 'c', cx: 9.6, cy: 8.4, r: 2.2, f: C.B2 },
      { t: 'r', x: 8, y: 12.6, w: 8, h: 1.7, r: 0.85, f: C.B2 },
      { t: 'r', x: 8, y: 16.2, w: 6, h: 1.7, r: 0.85, f: C.B2 }
    ],
    question: [
      { t: 'p', d: 'M12 3.4c-3.5 0-6.3 2.8-6.3 6.2 0 2.1 1 3.5 2.1 4.7.6.7 1.2 1.6 1.2 2.9h6c0-1.3.6-2.2 1.2-2.9 1.1-1.2 2.1-2.6 2.1-4.7 0-3.4-2.8-6.2-6.3-6.2z', f: C.Y1 },
      { t: 'r', x: 9, y: 17.2, w: 6, h: 2.2, r: 1.1, f: C.Y2 },
      { t: 'r', x: 10.4, y: 20, w: 3.2, h: 1.8, r: 0.9, f: C.Y2 }
    ],
    offer: [
      { t: 'p', d: 'M8 4.4h8v4.4a4 4 0 0 1-8 0z', f: C.Y2 },
      { t: 'l', d: 'M8 6.2H5.6a2.6 2.6 0 0 0 2.6 2.6', w: 1.9 },
      { t: 'l', d: 'M16 6.2h2.4a2.6 2.6 0 0 1-2.6 2.6', w: 1.9 },
      { t: 'r', x: 11, y: 12.6, w: 2, h: 3.4, r: 1, f: C.Y2 },
      { t: 'r', x: 8, y: 16.4, w: 8, h: 2.6, r: 1.3, f: C.Y2 }
    ],
    todo: [
      { t: 'r', x: 4, y: 3, w: 16, h: 18, r: 4, f: C.G1 },
      { t: 'r', x: 7, y: 7, w: 3.2, h: 3.2, r: 1.3, f: C.G2 },
      { t: 'r', x: 7, y: 13.4, w: 3.2, h: 3.2, r: 1.3, f: C.G2 },
      { t: 'r', x: 12, y: 8, w: 5.4, h: 1.7, r: 0.85, f: C.G2 },
      { t: 'r', x: 12, y: 14.4, w: 5.4, h: 1.7, r: 0.85, f: C.G2 }
    ],
    resource: [
      { t: 'p', d: 'M7 3.5h10a1.2 1.2 0 0 1 1.2 1.2v15.8l-6.2-4-6.2 4V4.7A1.2 1.2 0 0 1 7 3.5z', f: C.V1 },
      { t: 'p', d: 'M9.2 7.6h5.6v3.4l-2.8-1.9-2.8 1.9z', f: C.V2 }
    ],
    setting: [
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(0 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(45 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(90 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(135 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(180 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(225 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(270 12 12)' },
      { t: 'r', x: 10.6, y: 3.4, w: 2.8, h: 4.6, r: 1.3, f: C.T2, tr: 'rotate(315 12 12)' },
      { t: 'c', cx: 12, cy: 12, r: 5, f: C.T1 },
      { t: 'c', cx: 12, cy: 12, r: 2, f: C.W }
    ],
    plus: [
      { t: 'r', x: 10.4, y: 4.6, w: 3.2, h: 14.8, r: 1.6, f: C.T2 },
      { t: 'r', x: 4.6, y: 10.4, w: 14.8, h: 3.2, r: 1.6, f: C.T2 }
    ],
    edit: [
      { t: 'p', d: 'M5.2 19l.9-3.4L15.4 6.3l2.5 2.5L8.6 18.1z', f: C.Y1 },
      { t: 'p', d: 'M15.4 6.3l1.7-1.7a1.3 1.3 0 0 1 1.8 0l.6.6a1.3 1.3 0 0 1 0 1.8l-1.7 1.7z', f: C.P2 },
      { t: 'l', d: 'M4.4 20.6l3.4-1', w: 1.8 }
    ],
    trash: [
      { t: 'r', x: 9.2, y: 3.4, w: 5.6, h: 2.2, r: 1.1, f: C.P2 },
      { t: 'l', d: 'M10.6 3.2h2.8', w: 1.8 },
      { t: 'p', d: 'M5.4 7h13.2l-1 12.2a1.6 1.6 0 0 1-1.6 1.5H8a1.6 1.6 0 0 1-1.6-1.5z', f: C.P1 },
      { t: 'l', d: 'M9.6 10.6v7', w: 1.7 },
      { t: 'l', d: 'M14.4 10.6v7', w: 1.7 }
    ],
    sync: [
      { t: 'l', d: 'M4.6 12a7.4 7.4 0 0 1 12.4-5.4', w: 2 },
      { t: 'p', d: 'M17 3.2l.7 4.2-4.2.7z', f: C.T2 },
      { t: 'l', d: 'M19.4 12a7.4 7.4 0 0 1-12.4 5.4', w: 2 },
      { t: 'p', d: 'M7 20.8l-.7-4.2 4.2-.7z', f: C.T2 }
    ],
    link: [
      { t: 'l', d: 'M10.2 13.8a3.8 3.8 0 0 1 0-5.4l1.8-1.8a3.8 3.8 0 0 1 5.4 5.4l-1 1', w: 2.3 },
      { t: 'l', d: 'M13.8 10.2a3.8 3.8 0 0 1 0 5.4l-1.8 1.8a3.8 3.8 0 0 1-5.4-5.4l1-1', w: 2.3 }
    ],
    clock: [
      { t: 'c', cx: 12, cy: 12, r: 8.4, f: C.T1 },
      { t: 'l', d: 'M12 7.4v5l3.2 1.9', w: 2.1 },
      { t: 'c', cx: 12, cy: 12, r: 1.2, f: C.T2 }
    ],
    lock: [
      { t: 'l', d: 'M8.6 10.2V7.6a3.4 3.4 0 0 1 6.8 0v2.6', w: 2.2 },
      { t: 'r', x: 5, y: 10, w: 14, h: 10, r: 3.6, f: C.B1 },
      { t: 'c', cx: 12, cy: 15.2, r: 1.7, f: C.B2 }
    ],
    user: [
      { t: 'c', cx: 12, cy: 8.2, r: 4, f: C.P1 },
      { t: 'p', d: 'M4.8 20.4c0-3.6 3.2-6 7.2-6s7.2 2.4 7.2 6z', f: C.P2 }
    ],
    shield: [
      { t: 'p', d: 'M12 3.2l7.4 2.8v5.4c0 4.6-3.1 7.6-7.4 8.8-4.3-1.2-7.4-4.2-7.4-8.8V6z', f: C.T1 },
      { t: 'l', d: 'M9.2 12.2l2.2 2.2 3.8-4.4', w: 2.1 }
    ],
    chart: [
      { t: 'r', x: 4, y: 12, w: 3.6, h: 8, r: 1.6, f: C.T2 },
      { t: 'r', x: 10.2, y: 7, w: 3.6, h: 13, r: 1.6, f: C.T2 },
      { t: 'r', x: 16.4, y: 4, w: 3.6, h: 16, r: 1.6, f: C.T2 }
    ],
    filter: [
      { t: 'p', d: 'M4 5.4h16l-6.4 7.4v6.4l-3.2 1.6v-8z', f: C.B1 },
      { t: 'r', x: 10, y: 14.6, w: 4, h: 2.2, r: 1.1, f: C.B2 }
    ],
    download: [
      { t: 'l', d: 'M12 4.2v10.4', w: 2.2 },
      { t: 'p', d: 'M7.8 11l4.2 4.2L16.2 11z', f: C.T2 },
      { t: 'r', x: 4.6, y: 17.8, w: 14.8, h: 2.4, r: 1.2, f: C.T1 }
    ],
    upload: [
      { t: 'l', d: 'M12 19.4V9', w: 2.2 },
      { t: 'p', d: 'M7.8 12.4l4.2-4.2 4.2 4.2z', f: C.T2 },
      { t: 'r', x: 4.6, y: 4.4, w: 14.8, h: 2.4, r: 1.2, f: C.T1 }
    ],
    check: [
      { t: 'l', d: 'M5.2 12.6l4.6 4.6L19 7.2', w: 2.7 }
    ],
    star: [
      { t: 'p', d: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z', f: C.Y2 }
    ],
    calendar: [
      { t: 'r', x: 3.6, y: 5, w: 16.8, h: 15, r: 3.6, f: C.B1 },
      { t: 'r', x: 3.6, y: 5, w: 16.8, h: 4.2, r: 2.1, f: C.B2 },
      { t: 'l', d: 'M8 3.2v3.4', w: 1.9 },
      { t: 'l', d: 'M16 3.2v3.4', w: 1.9 },
      { t: 'c', cx: 8.4, cy: 13.6, r: 1.4, f: C.B2 },
      { t: 'c', cx: 12, cy: 13.6, r: 1.4, f: C.B2 },
      { t: 'c', cx: 15.6, cy: 13.6, r: 1.4, f: C.B2 }
    ],
    pin: [
      { t: 'p', d: 'M12 21c4-4.4 6.4-7.4 6.4-10.4a6.4 6.4 0 1 0-12.8 0C5.6 13.6 8 16.6 12 21z', f: C.P1 },
      { t: 'c', cx: 12, cy: 10.6, r: 2.4, f: C.P2 }
    ],
    book: [
      { t: 'p', d: 'M4 5.6c2.6-1.4 5.4-1.4 7.6.8 2.2-2.2 5-2.2 7.6-.8v12.4c-2.6-1.4-5.4-1.4-7.6.8-2.2-2.2-5-2.2-7.6-.8z', f: C.V1 },
      { t: 'l', d: 'M12 6.4v12.2', w: 1.7 }
    ],
    target: [
      { t: 'c', cx: 12, cy: 12, r: 8.4, f: C.P1 },
      { t: 'c', cx: 12, cy: 12, r: 4.8, f: C.W },
      { t: 'c', cx: 12, cy: 12, r: 2.2, f: C.P2 }
    ],
    cloud: [
      { t: 'p', d: 'M7.2 18.6h9.8a3.6 3.6 0 0 0 .3-7.2A5.6 5.6 0 0 0 6.6 12.8a3.6 3.6 0 0 0 .6 5.8z', f: C.B1 },
      { t: 'c', cx: 10, cy: 15.4, r: 1.6, f: C.B2 },
      { t: 'c', cx: 14.4, cy: 15.4, r: 1.6, f: C.B2 }
    ],
    phone: [
      { t: 'r', x: 6.6, y: 2.6, w: 10.8, h: 18.8, r: 3.2, f: C.V1 },
      { t: 'r', x: 10, y: 4.8, w: 4, h: 1.5, r: 0.75, f: C.V2 },
      { t: 'c', cx: 12, cy: 19, r: 1.4, f: C.V2 }
    ],
    team: [
      { t: 'c', cx: 9.2, cy: 8.4, r: 3.4, f: C.P1 },
      { t: 'p', d: 'M3.6 19.6c0-3.2 2.6-5.2 5.6-5.2s5.6 2 5.6 5.2z', f: C.P2 },
      { t: 'c', cx: 17.4, cy: 9.4, r: 2.6, f: C.T1 },
      { t: 'e', cx: 17.6, cy: 16.6, rx: 3, ry: 3, f: C.T2 }
    ],
    flag: [
      { t: 'l', d: 'M6.6 21V3.6', w: 2.2 },
      { t: 'p', d: 'M6.6 4.4h11l-2 3.6 2 3.6h-11z', f: C.P2 }
    ],
    bell: [
      { t: 'p', d: 'M6.6 17.2h10.8l-1.6-5.4V9a3.8 3.8 0 0 0-7.6 0v2.8z', f: C.Y1 },
      { t: 'r', x: 10.2, y: 17.4, w: 3.6, h: 2.2, r: 1.1, f: C.Y2 },
      { t: 'l', d: 'M12 3.4v1.8', w: 1.9 }
    ],
    refresh: [
      { t: 'l', d: 'M20 12a8 8 0 1 1-2.6-5.9', w: 2.1 },
      { t: 'p', d: 'M20.6 3.4l-.5 4.6-4.5-.5z', f: C.T2 }
    ],
    doc: [
      { t: 'r', x: 5, y: 3, w: 14, h: 18, r: 3.5, f: C.T1 },
      { t: 'p', d: 'M15 3l4 4.2h-2.9a1.1 1.1 0 0 1-1.1-1.1z', f: C.T2 },
      { t: 'r', x: 8, y: 10, w: 8, h: 1.8, r: 0.9, f: C.T2 },
      { t: 'r', x: 8, y: 14, w: 8, h: 1.8, r: 0.9, f: C.T2 }
    ],
    wallet: [
      { t: 'r', x: 3, y: 6, w: 18, h: 13, r: 3.6, f: C.B1 },
      { t: 'r', x: 3, y: 6, w: 18, h: 3.6, r: 1.8, f: C.B2 },
      { t: 'c', cx: 16.4, cy: 15, r: 1.5, f: C.B2 }
    ],
    route: [
      { t: 'l', d: 'M7 7.6h4.8a3.8 3.8 0 0 1 0 7.6H8.4a3.8 3.8 0 0 0 0 7.6H14', w: 2.1 },
      { t: 'c', cx: 5.4, cy: 7.6, r: 1.9, f: C.G2 },
      { t: 'c', cx: 18.4, cy: 19.2, r: 1.9, f: C.T2 }
    ],
    key: [
      { t: 'r', x: 10.6, y: 10.2, w: 9, h: 2.4, r: 1.2, f: C.Y2 },
      { t: 'r', x: 17, y: 12.6, w: 2.2, h: 3.4, r: 1.1, f: C.Y2 },
      { t: 'c', cx: 8, cy: 11.4, r: 4.2, f: C.Y1 },
      { t: 'c', cx: 8, cy: 11.4, r: 1.6, f: C.W }
    ],
    cap: [
      { t: 'p', d: 'M2.6 9.2L12 5l9.4 4.2L12 13.4z', f: C.V2 },
      { t: 'p', d: 'M6 11.2v4.2c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7v-4.2z', f: C.V1 },
      { t: 'l', d: 'M19.8 10.6v4.8', w: 1.8 },
      { t: 'c', cx: 20.2, cy: 16.6, r: 1.3, f: C.Y2 }
    ]
  };

  /* 渲染原创卡通图标 */
  function artSvg(name, size) {
    size = size || 42;
    var items = ICON_ART[name] || ICON_ART.doc;
    var body = items.map(function (it) {
      var tr = it.tr ? ' transform="' + it.tr + '"' : '';
      if (it.t === 'r') {
        return '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h +
          '" rx="' + (it.r === undefined ? 2 : it.r) + '" fill="' + it.f + '"' + tr + '/>';
      }
      if (it.t === 'c') return '<circle cx="' + it.cx + '" cy="' + it.cy + '" r="' + it.r + '" fill="' + it.f + '"' + tr + '/>';
      if (it.t === 'e') return '<ellipse cx="' + it.cx + '" cy="' + it.cy + '" rx="' + it.rx + '" ry="' + it.ry + '" fill="' + it.f + '"' + tr + '/>';
      if (it.t === 'p') return '<path d="' + it.d + '" fill="' + it.f + '"' + tr + '/>';
      if (it.t === 'l') return '<path d="' + it.d + '" fill="none" stroke-width="' + (it.w || 1.7) + '"' + tr + '/>';
      return '';
    }).join('');
    return '<svg class="nx-art" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true" ' +
      'fill="none" stroke="#5A6B67" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">' + body + '</svg>';
  }

  /* 图片加载失败 → 显示原创卡通图标 */
  function iconFallback(img) {
    img.style.display = 'none';
    var fb = img.nextElementSibling;
    if (fb) fb.style.display = 'inline-flex';
  }

  /* 统一图标入口：assets/icons/<key>.png 优先（可选自定义），缺失则用原创卡通图标 */
  function iconImg(name, size, cls) {
    size = size || 42;
    return '<span class="nx-icon-img' + (cls ? ' ' + cls : '') + '" style="width:' + size + 'px;height:' + size + 'px">' +
      '<img src="' + ICON_DIR + name + '.png" alt="" onerror="QZ_DATA.iconFallback(this)">' +
      '<span class="nx-fb">' + artSvg(name, size) + '</span></span>';
  }

  /* 模块 / 卡片 / 导航图标 */
  function shinIcon(name, size) { return iconImg(name, size || 42, ''); }

  /* 按钮 / 列表 / 标签小图标 */
  function tinyIcon(name, size, color) { return iconImg(name, size || 16, 'tiny'); }

  /* ---------- 2. 初始样例数据 ---------- */
  var CATEGORIES = ['电子信息类', '软件测试', '运维/技术支持', '产品助理', '数据助理'];
  var JOB_STATUS = ['待投递', '已投递', '简历筛选', '笔试中', '面试中', '已Offer', '已结束'];

  var seed = {
    version: 3,
    updatedAt: '2026-09-19 17:00',
    sync: {
      sourceName: '27届秋招 / 春招 / 实习汇总表（飞书多维表格 · 他人共享只读）',
      sourceUrl: 'https://yal2at57cvq.feishu.cn/base/GtSLbyyR3aCENOsJYC6cdlsVnih?table=tblH4au5rnBcqHgJ&view=vew8PFC7nG',
      mode: 'overwrite', auto: true, useProxy: true, proxy: 'https://r.jina.ai/',
      lastSync: '', lastResult: '', lastStats: { added: 0, updated: 0 }, logs: []
    },
    users: [
      { username: 'admin', password: 'admin2027', name: '超级管理员', role: 'admin', note: '拥有全站最高权限，可管理账号、数据与同步', active: true, createdAt: '2026-08-01' },
      { username: 'guest', password: '2027qiuzhao', name: '本人（只读）', role: 'user', note: '仅查看个人秋招数据，不可修改账号与同步设置', active: true, createdAt: '2026-08-01' }
    ],
    jobs: [
      { id: 'j1', company: '腾讯科技（深圳）', position: '测试开发工程师（校招）', category: '软件测试', city: '深圳', channel: '官网投递', referrer: '', link: 'https://join.qq.com', appliedAt: '2026-09-08', status: '笔试中', salary: '18K×16', remark: '笔试题型：算法2道+测试设计1道，注意边界值场景' , jd: '【岗位职责】参与需求评审并拆解测试要点，编写测试用例与测试点；负责功能测试与接口测试（Apifox/Postman），提交缺陷并跟踪回归；参与自动化测试建设（Python + Pytest），维护脚本；编写测试报告，协同产品与开发推进迭代。【任职要求】本科及以上，计算机/电子信息相关专业，2027届应届生；熟悉测试流程与用例设计方法（等价类、边界值）；熟悉 Linux 常用命令与 SQL，了解 Python 优先；有接口测试或自动化经验者优先，熟悉 Git；沟通协作能力强，有责任心。'},
      { id: 'j2', company: '字节跳动', position: '测试工程师（质量保障）', category: '软件测试', city: '深圳/北京', channel: '内推', referrer: '学长 李明（21届）', link: 'https://jobs.bytedance.com/campus', appliedAt: '2026-09-10', status: '简历筛选', salary: '17K×15', remark: '内推码 BYTE2027，简历已打「自动化测试」标签' },
      { id: 'j3', company: '华为技术有限公司', position: '软件测试工程师', category: '软件测试', city: '成都', channel: '官网投递', referrer: '', link: 'https://career.huawei.com', appliedAt: '2026-09-05', status: '面试中', salary: '16K×15', remark: '已过一面，9/21 二面；主管关注测试流程与缺陷管理经验' , jd: '【岗位职责】负责通信设备软件的功能与性能测试，编写测试方案与用例；搭建测试环境，执行测试并提交缺陷报告，跟踪问题闭环；参与自动化测试框架建设，编写 Python/Shell 脚本提升效率；输出测试报告与质量评估。【任职要求】本科及以上，通信/电子/计算机相关专业；掌握测试流程、缺陷管理与测试报告编写；熟悉 Linux 与数据库基本操作，了解 Python 或 Shell；有项目或实习中的测试实践经历优先；细致耐心，沟通良好。'},
      { id: 'j4', company: '中兴通讯', position: '测试工程师（通信软件）', category: '电子信息类', city: '成都', channel: '校园招聘会', referrer: '辅导员推荐', link: 'https://job.zte.com.cn', appliedAt: '2026-09-12', status: '已投递', salary: '13K×14', remark: '9/27 赛码在线笔试，含通信基础+行测' },
      { id: 'j5', company: '京东方科技集团', position: '电子测试工程师', category: '电子信息类', city: '成都', channel: '宣讲会', referrer: '', link: 'https://career.boe.com', appliedAt: '2026-09-15', status: '笔试中', salary: '12K×14', remark: '9/25 智鼎在线测评；成都基地有落户补贴' },
      { id: 'j6', company: '大疆创新', position: '嵌入式软件测试工程师', category: '软件测试', city: '深圳', channel: '内推', referrer: '学长 王强', link: 'https://we.dji.com', appliedAt: '2026-09-16', status: '待投递', salary: '19K×15', remark: '需补嵌入式C与硬件测试知识，简历待增加示波器使用经历' },
      { id: 'j7', company: '美团', position: '测试开发工程师', category: '软件测试', city: '北京', channel: '官网投递', referrer: '', link: 'https://zhaopin.meituan.com', appliedAt: '2026-09-11', status: '已结束', salary: '—', remark: '笔试算法题未 AC，复盘：动态规划状态转移不熟' },
      { id: 'j8', company: '海康威视', position: '技术支持工程师', category: '运维/技术支持', city: '杭州', channel: '官网投递', referrer: '', link: 'https://job.hikvision.com', appliedAt: '2026-09-13', status: '简历筛选', salary: '12K×14', remark: '转行适配岗位，看重沟通与Linux基础' , jd: '【岗位职责】负责客户现场与远程技术支持，处理产品使用问题并给出解决方案；整理客户反馈，输出问题处理记录与知识库文档；协助实施部署与设备调试，跟进项目进度；对接研发推动问题闭环，定期输出数据报表。【任职要求】本科及以上，专业不限，2027届应届生；具备良好的文档编写能力与沟通表达能力；熟悉 Linux 基础命令与网络常识，熟练使用 Excel/WPS；有数据整理、问题排查与跨部门协作经验优先；责任心强，能适应一定的现场支持工作。'},
      { id: 'j9', company: '成都京东方光电', position: '产品助理（硬件方向）', category: '产品助理', city: '成都', channel: '内推', referrer: '学姐 张悦', link: 'https://career.boe.com', appliedAt: '2026-09-17', status: '待投递', salary: '10K×14', remark: '需准备产品分析作品，简历切换 v4 版本' },
      { id: 'j10', company: '小米科技', position: '运维开发工程师', category: '运维/技术支持', city: '北京', channel: '官网投递', referrer: '', link: 'https://hr.xiaomi.com', appliedAt: '2026-09-14', status: '笔试中', salary: '15K×14', remark: '笔试含 Linux 命令与 Shell 脚本题' }
    ],
    exams: [
      { id: 'e1', company: '腾讯科技（深圳）', position: '测试开发工程师', examAt: '2026-09-22 19:00', platform: '牛客网', account: '2027qz_tencent', password: 'Tx#88231', admission: '准考证号 NC20260922087', room: '线上（摄像头监考）', prepare: '刷完牛客测试岗真题 20 道；重点：等价类划分、因果图、自动化框架', realLink: 'https://www.nowcoder.com/exam', notes: '错题：TCP 三次握手状态迁移；字符串编辑距离 DP 未写出', status: '待参加' },
      { id: 'e2', company: '华为技术有限公司', position: '软件测试工程师', examAt: '2026-09-20 14:00', platform: '华为招聘平台', account: 'huawei_2027qz', password: 'Hw@2027ok', admission: '已发送至邮箱', room: '线上', prepare: '复习软件测试生命周期、缺陷等级定义、华为性格测评题库', realLink: 'https://career.huawei.com', notes: '性格测评注意前后一致，避免极端选项', status: '待参加' },
      { id: 'e3', company: '京东方科技集团', position: '电子测试工程师', examAt: '2026-09-25 10:00', platform: '智鼎在线', account: 'BOE2027991', password: 'boe@9921', admission: '短信通知', room: '线上', prepare: '模电数电基础、示波器与信号发生器使用、行测图形推理', realLink: 'https://www.zidongexam.com', notes: '行测时间紧，先做言语理解', status: '待参加' },
      { id: 'e4', company: '中兴通讯', position: '测试工程师', examAt: '2026-09-27 19:30', platform: '赛码网', account: 'zte2027qz', password: 'Zte@7721', admission: '待公布', room: '线上', prepare: '通信原理（调制解调）、C语言指针、测试用例设计', realLink: 'https://www.smartcoding.com', notes: '赛码需提前 15 分钟调试环境', status: '待参加' }
    ],
    interviews: [
      { id: 'i1', company: '华为技术有限公司', position: '软件测试工程师', round: '一面（技术面）', time: '2026-09-09 15:00', mode: '线上（Welink）', interviewer: '测试部 王工', contact: '会议号 883 221 990', place: '线上', review: '整体顺利。被追问「如何设计一个登录功能的测试用例」——回答了功能/边界/安全/性能四层，面试官补充了弱网与并发场景。', questions: '讲一下你做过的测试项目？| 黑盒白盒测试区别？| 如何定位一个偶现 Bug？', result: '通过', status: '已完成' },
      { id: 'i2', company: '华为技术有限公司', position: '软件测试工程师', round: '二面（主管面）', time: '2026-09-21 15:00', mode: '线上（Welink）', interviewer: '测试部 李主管', contact: '待发送', place: '线上', review: '准备方向：项目深挖、职业规划、为什么选择测试岗、反问环节。', questions: '为什么选择软件测试而非开发？| 你遇到过最难沟通的合作场景？| 期望薪资与城市？', result: '待进行', status: '待参加' },
      { id: 'i3', company: '字节跳动', position: '测试工程师', round: '一面（技术面）', time: '2026-09-18 20:00', mode: '线上（飞书）', interviewer: 'QA 团队 陈工', contact: '飞书会议链接已发邮件', place: '线上', review: '需准备自动化框架（pytest/selenium）项目讲解 + 一道手撕代码（数组/字符串）。', questions: 'pytest 夹具的作用？| 如何做接口自动化断言？| 手撕：最长无重复子串', result: '待复盘', status: '待参加' },
      { id: 'i4', company: '海康威视', position: '技术支持工程师', round: '初面（综合面）', time: '2026-09-24 10:30', mode: '线上（钉钉）', interviewer: '技术支持部 周经理', contact: '钉钉群邀请', place: '线上', review: '转行岗重点讲沟通与排障能力，准备 Linux 常用排障命令清单。', questions: '客户现场设备连不上网你怎么排查？| 能接受出差吗？| Linux 查看端口占用？', result: '待进行', status: '待参加' },
      { id: 'i5', company: '美团', position: '测试开发工程师', round: '一面（技术面）', time: '2026-09-06 19:00', mode: '线上（腾讯会议）', interviewer: '到店事业群 刘工', contact: '会议号 992 331 112', place: '线上', review: '代码题卡住，自我介绍略长。改进：先给思路再写代码，控制在 2 分钟内自我介绍。', questions: '手撕：最长上升子序列？| Python 装饰器原理？| 数据库索引失效场景？', result: '未通过', status: '已结束' }
    ],
    resumes: [
      { id: 'r1', name: 'V1 · 电子信息通用版', target: '电子信息类 / 硬件测试', version: 'v1.0', updatedAt: '2026-08-20', link: '腾讯文档｜https://docs.qq.com/doc/your-resume-v1', highlight: '突出电路设计、嵌入式课程设计、示波器与信号源使用', note: '适合硬件/电子类岗位，投递京东方、中兴时使用' },
      { id: 'r2', name: 'V2 · 软件测试专项版', target: '软件测试 / 测试开发', version: 'v2.3', updatedAt: '2026-09-15', link: '腾讯文档｜https://docs.qq.com/doc/your-resume-v2', highlight: '突出 pytest 自动化框架、接口测试、缺陷管理流程、测试用例设计', note: '主推版本，投递腾讯、字节、华为时使用；数据量化：用例 300+、缺陷 60+' },
      { id: 'r3', name: 'V3 · 测试开发加强版', target: '测试开发（含代码能力）', version: 'v3.1', updatedAt: '2026-09-17', link: 'GitHub Pages｜https://yourname.github.io/resume', highlight: '增加 Python 脚本开发、CI/CD 集成、性能测试 JMeter 实操', note: '用于腾讯/美团等要求编码的测试开发岗' },
      { id: 'r4', name: 'V4 · 转行产品助理版', target: '产品助理 / 数据助理', version: 'v1.2', updatedAt: '2026-09-18', link: '飞书文档｜https://your.feishu.cn/docx/resume-v4', highlight: '突出需求分析、竞品调研、数据整理与 Axure 原型', note: '转行适配岗位专用，减少硬件细节，增加项目协作与文档能力' }
    ],
    questions: [
      { id: 'q1', category: '软件测试', title: '黑盒测试与白盒测试的区别？分别适用什么阶段？', difficulty: '简单', answer: '黑盒：不看内部结构，只关注输入输出，等价类划分/边界值/因果图，适用于系统测试与验收测试；白盒：看代码逻辑，语句/分支/路径覆盖，适用于单元测试与集成测试。', mastered: true, wrong: false, note: '一面高频，回答要补一句：项目里我用 pytest 做白盒补充覆盖。' },
      { id: 'q2', category: '软件测试', title: '如何为一个「登录功能」设计测试用例？', difficulty: '中等', answer: '功能（正确/错误/空值）、边界（密码长度上下限、特殊字符）、安全（SQL注入、XSS、密码加密传输、暴力破解锁定）、性能（并发登录、响应时间）、兼容性（多浏览器/多端）、弱网与断网重试。', mastered: true, wrong: false, note: '华为一面原题，答完要主动补充安全维度。' },
      { id: 'q3', category: '软件测试', title: '缺陷（Bug）的生命周期与等级如何划分？', difficulty: '简单', answer: '生命周期：新建→指派→打开→修复→待验→关闭/重开；等级：致命（崩溃/数据丢失）、严重（主功能不可用）、一般（次要功能异常）、建议（体验优化）。', mastered: true, wrong: false, note: '' },
      { id: 'q4', category: '软件测试', title: 'pytest 中 fixture 的作用与作用域？', difficulty: '中等', answer: 'fixture 用于测试前置准备与后置清理（如数据库连接、登录态），作用域 function/class/module/session，通过 conftest.py 共享。', mastered: false, wrong: true, note: '字节一面可能追问，补 yield fixture 与参数化用法。' },
      { id: 'q5', category: '软件测试', title: '接口自动化断言一般校验哪些内容？', difficulty: '中等', answer: 'HTTP 状态码、响应 JSON 结构与字段类型、关键业务值、数据库落库一致性、响应时间、异常入参的错误码与提示。', mastered: false, wrong: false, note: '' },
      { id: 'q6', category: '算法', title: '最长无重复字符的子串（滑动窗口）', difficulty: '中等', answer: '双指针 + 哈希表记录字符最新下标，右指针扩张，遇重复则移动左指针，O(n)。', mastered: false, wrong: true, note: '字节一面手撕预测题，需默写模板。' },
      { id: 'q7', category: '算法', title: '最长上升子序列 LIS（二分优化）', difficulty: '中等', answer: '维护 tails 数组，tails[i] 表示长度 i+1 的上升子序列最小末尾，二分查找替换位置，O(nlogn)。', mastered: false, wrong: true, note: '美团一面原题，当时未写出，重点复盘。' },
      { id: 'q8', category: '算法', title: '编辑距离（动态规划）', difficulty: '困难', answer: 'dp[i][j] 表示 word1 前 i 个字符变到 word2 前 j 个字符的最少操作数，插入/删除/替换三种转移取最小。', mastered: false, wrong: true, note: '腾讯笔试错题，需独立默写完整代码。' },
      { id: 'q9', category: '计算机基础', title: 'TCP 三次握手与四次挥手，为什么需要三次？', difficulty: '简单', answer: '三次握手：SYN→SYN+ACK→ACK，确认双方收发能力正常并同步序列号；四次挥手因全双工，需各自关闭发送通道，TIME_WAIT 等待 2MSL。', mastered: true, wrong: true, note: '腾讯笔试错在状态迁移图，补 CLOSE_WAIT/TIME_WAIT 场景。' },
      { id: 'q10', category: '计算机基础', title: '进程与线程的区别？通信方式有哪些？', difficulty: '简单', answer: '进程是资源分配单位，线程是调度单位，线程共享地址空间；进程通信：管道、消息队列、共享内存、信号量、Socket；线程同步：锁、条件变量、信号量。', mastered: true, wrong: false, note: '' },
      { id: 'q11', category: '计算机基础', title: '数据库索引失效的常见场景？', difficulty: '中等', answer: '违反最左前缀、索引列参与函数/运算、隐式类型转换、LIKE 以 % 开头、OR 连接非索引列、数据量小时优化器选择全表扫描。', mastered: false, wrong: true, note: '美团一面追问过，补 EXPLAIN 分析。' },
      { id: 'q12', category: '专业基础', title: '示波器触发方式与带宽选择原则？', difficulty: '中等', answer: '触发方式：边沿/脉宽/视频/斜率触发；带宽应 ≥ 被测信号最高频率的 3~5 倍，探头需补偿校准。', mastered: true, wrong: false, note: '电子信息类岗位（京东方）常问。' },
      { id: 'q13', category: '专业基础', title: '模电中运放的虚短与虚断成立条件？', difficulty: '中等', answer: '深负反馈且运放处于线性区、开环增益足够大、输入阻抗足够高时成立。', mastered: false, wrong: false, note: '' },
      { id: 'q14', category: '面试真题', title: '为什么选择软件测试，而不是开发？', difficulty: '简单', answer: '强调对质量保障体系的兴趣 + 具备代码能力（能做测试开发）+ 项目中有从缺陷反推代码问题的成就感，落脚到「用工程手段保障交付质量」。', mastered: true, wrong: false, note: '主管面必问题，回答需真诚且有项目支撑。' },
      { id: 'q15', category: '面试真题', title: '如何定位一个偶现（难以复现）的 Bug？', difficulty: '困难', answer: '先看日志与监控定位时间窗口 → 复现环境对齐（版本/配置/数据）→ 增加埋点与日志级别 → 构造压测/边界条件放大概率 → 定位后补充回归用例。', mastered: false, wrong: false, note: '华为一面追问，需准备自己项目的真实案例。' },
      { id: 'q16', category: '运维/技术支持', title: 'Linux 查看端口占用与排查服务无法访问的步骤？', difficulty: '简单', answer: 'netstat -tunlp / lsof -i:端口 查占用；排查顺序：进程存活→端口监听→防火墙/安全组→DNS 解析→应用日志→依赖服务。', mastered: true, wrong: false, note: '海康技术支持岗高频。' }
    ],
    offers: [
      { id: 'o1', company: '华为技术有限公司', position: '软件测试工程师', city: '成都', salary: '16K×15薪', workHour: '弹性 9:00-18:30，偶有加班', hukou: '成都落户可协助', penalty: '三方违约金 8000 元', welfare: '五险一金全额、餐补、宿舍/住房补贴、年终奖', growth: '测试体系成熟，可转测试开发，技术栈成体系', onboardAt: '2027-07-01', score: { salary: 8, city: 10, hour: 7, hukou: 9, growth: 9, welfare: 8 }, pros: '成都本地、平台大、测试流程规范、成长路径清晰', cons: '加班强度偏大，入职前需确认部门节奏' },
      { id: 'o2', company: '中兴通讯', position: '测试工程师（通信软件）', city: '成都', salary: '13K×14薪', workHour: '9:00-18:00，加班较少', hukou: '成都落户可协助', penalty: '三方违约金 5000 元', welfare: '五险一金、食堂、班车、节日福利', growth: '通信领域深耕，技术偏专，转型面略窄', onboardAt: '2027-07-10', score: { salary: 6, city: 10, hour: 9, hukou: 9, growth: 7, welfare: 7 }, pros: '成都本地、节奏稳定、压力小', cons: '薪资偏低，技术栈相对传统' },
      { id: 'o3', company: '海康威视', position: '技术支持工程师', city: '杭州', salary: '12K×14薪', workHour: '9:00-18:00，需轮班出差', hukou: '杭州人才补贴可申请', penalty: '三方违约金 5000 元', welfare: '五险一金、出差补贴、培训体系', growth: '转行起点，偏沟通与服务，技术深度有限', onboardAt: '2027-07-05', score: { salary: 5, city: 6, hour: 8, hukou: 7, growth: 6, welfare: 7 }, pros: '转行友好、门槛适中、补贴明确', cons: '城市不在成都，需出差，长期技术成长受限' },
      { id: 'o4', company: '京东方科技集团', position: '电子测试工程师', city: '成都', salary: '12K×14薪', workHour: '倒班制（面板产线）', hukou: '成都落户可协助', penalty: '三方违约金 3000 元', welfare: '五险一金、免费班车、宿舍、餐补', growth: '本专业对口，硬件测试方向，转软件测试需自学', onboardAt: '2027-07-15', score: { salary: 5, city: 10, hour: 5, hukou: 9, growth: 6, welfare: 8 }, pros: '本专业强相关、成都本地、福利扎实', cons: '倒班制，工作强度与作息不友好' }
    ],
    todos: [
      { id: 't1', title: '华为二面模拟演练（自我介绍 + 项目深挖）', deadline: '2026-09-20', priority: '高', type: '面试', done: false, note: '找同学模拟一次，录屏复盘，控制在 25 分钟' },
      { id: 't2', title: '华为在线笔试（性格测评 + 专业）', deadline: '2026-09-20', priority: '高', type: '笔试', done: false, note: '提前 15 分钟进场调试摄像头' },
      { id: 't3', title: '字节一面复盘并记录高频问题', deadline: '2026-09-19', priority: '高', type: '面试', done: false, note: '填写面试管理页的复盘字段' },
      { id: 't4', title: '腾讯笔试冲刺：动态规划 + 测试用例设计', deadline: '2026-09-21', priority: '高', type: '笔试', done: false, note: '刷牛客真题 10 道，错题录入题库' },
      { id: 't5', title: '京东方测评：行测图形推理练习', deadline: '2026-09-24', priority: '中', type: '笔试', done: false, note: '每天 20 题保持手感' },
      { id: 't6', title: '更新 V3 简历：补充 JMeter 性能测试数据', deadline: '2026-09-22', priority: '中', type: '简历', done: false, note: '量化：并发 500、TPS 变化曲线' },
      { id: 't7', title: '投递大疆嵌入式测试（内推码 DJI2027）', deadline: '2026-09-23', priority: '中', type: '投递', done: false, note: '简历切换 V1 硬件加强版' },
      { id: 't8', title: '整理内推渠道表：学长学姐联系方式更新', deadline: '2026-09-25', priority: '中', type: '资源', done: false, note: '补充 3 位已入职大厂学长' },
      { id: 't9', title: '飞书共享文档同步：拉取本周最新岗位数据', deadline: '2026-09-19', priority: '中', type: '同步', done: false, note: '设置中心 → 飞书同步 → 增量更新' },
      { id: 't10', title: '每日刷题 2 道（算法 1 + 测试 1）', deadline: '2026-09-19', priority: '低', type: '学习', done: true, note: '已完成：LIS 二分优化 + 缺陷等级划分' },
      { id: 't11', title: '准备反问环节问题清单（每场面试 3 个）', deadline: '2026-09-21', priority: '低', type: '面试', done: true, note: '团队技术栈？新人培养机制？转正标准？' }
    ],
    resources: [
      { id: 'c1', name: '牛客网 · 校招真题与内推', category: '内推渠道', url: 'https://www.nowcoder.com', desc: '笔试真题、面经、内推码集散地，每日刷 30 分钟', tag: '每日必看' },
      { id: 'c2', name: '脉脉 / 小红书 内推合集', category: '内推渠道', url: 'https://maimai.cn', desc: '搜索「软件测试 内推 2027」，礼貌私信 + 附简历', tag: '主动出击' },
      { id: 'c3', name: '学校就业指导中心（内推与宣讲会）', category: '内推渠道', url: 'https://job.your-university.edu.cn', desc: '电子信息学院专场宣讲会日历，辅导员推荐名额', tag: '官方' },
      { id: 'c4', name: '华为招聘官网', category: '招聘官网', url: 'https://career.huawei.com', desc: '校招进度查询、笔试面试通知统一入口', tag: '进度查询' },
      { id: 'c5', name: '腾讯招聘 join.qq.com', category: '招聘官网', url: 'https://join.qq.com', desc: '投递状态实时更新，可查看岗位面试官部门', tag: '进度查询' },
      { id: 'c6', name: '字节跳动校园招聘', category: '招聘官网', url: 'https://jobs.bytedance.com/campus', desc: '内推码填写页 + 岗位 JD 关键词提取', tag: 'JD参考' },
      { id: 'c7', name: '《软件测试》（Ron Patton）学习笔记', category: '学习资料', url: 'https://docs.qq.com/doc/test-book-note', desc: '第 1-6 章重点：测试方法论、黑盒白盒、缺陷报告', tag: '打基础' },
      { id: 'c8', name: 'pytest 官方文档（中文）', category: '学习资料', url: 'https://docs.pytest.org', desc: 'fixture、参数化、插件，配合自己的自动化项目看', tag: '自动化' },
      { id: 'c9', name: 'JMeter 性能测试入门实战', category: '学习资料', url: 'https://jmeter.apache.org', desc: '并发设置、断言、聚合报告解读，简历可写的加分项', tag: '进阶' },
      { id: 'c10', name: 'LeetCode 热题 100（算法）', category: '学习资料', url: 'https://leetcode.cn/problem-list/2cktkvj/', desc: '测试开发岗考算法，重点：数组、字符串、DP、二叉树', tag: '每日2题' },
      { id: 'c11', name: 'Linux 常用命令速查（排障）', category: '工具链接', url: 'https://wangchujiang.com/linux-command/', desc: 'netstat/lsof/top/grep，技术支持与运维岗必备', tag: '速查' },
      { id: 'c12', name: 'ProcessOn 简历与项目图绘制', category: '工具链接', url: 'https://www.processon.com', desc: '画测试流程图与项目架构图，面试讲项目时贴出来', tag: '加分' },
      { id: 'c13', name: '牛客面经：软件测试岗合集', category: '面试经验', url: 'https://www.nowcoder.com/discuss/experience?tagId=639', desc: '按公司筛选，整理高频 30 问写在题库页', tag: '高频' },
      { id: 'c14', name: '电子信息转行软件测试路径贴', category: '转行资源', url: 'https://www.nowcoder.com/discuss/xxxx', desc: '专业课如何包装成测试能力：硬件测试→可靠性测试→测试用例思维', tag: '转行必读' },
      { id: 'c15', name: '产品助理/数据助理入门资料包', category: '转行资源', url: 'https://www.processon.com', desc: '竞品分析模板、Axure 原型练习、Excel 数据处理 10 讲', tag: '备选路线' },
      { id: 'c16', name: '飞书共享秋招表格（同学共建）', category: '内推渠道', url: 'https://your.feishu.cn/', desc: '同学共享的岗位更新表，可在设置中心一键同步到工作台', tag: '每日更新' }
    ]
  };

  global.QZ_DATA = {
    seed: seed, CATEGORIES: CATEGORIES, JOB_STATUS: JOB_STATUS,
    shinIcon: shinIcon, tinyIcon: tinyIcon, iconImg: iconImg,
    iconFallback: iconFallback, artSvg: artSvg, ICON_DIR: ICON_DIR, ICON_KEYS: ICON_KEYS
  };
})(window);
