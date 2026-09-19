#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
飞书多维表格 → 秋招工作台 同步脚本（进阶方案：官方 Base API）
------------------------------------------------------------------
作用：用飞书开放平台官方接口拉取「27届秋招/春招/实习汇总表」记录，
      输出 JSON / CSV，供工作台「导入 CSV 文件」或「粘贴导入」使用。

前提：
  1) 在 open.feishu.cn 创建「企业自建应用」，拿到 app_id / app_secret
  2) 把该应用添加为目标多维表格的协作者（或走 OAuth 拿到 user_access_token）
  3) 应用需开通 bitable:app 相关权限

用法：
  python feishu_sync.py --app-id cli_xxx --app-secret xxxx --out rows.json
  python feishu_sync.py --app-id cli_xxx --app-secret xxxx --out rows.csv --format csv
  python feishu_sync.py --user-token u-xxxx --out rows.json        # 已通过 OAuth 拿到的用户令牌

依赖：仅 Python 标准库（3.7+），无需 pip 安装任何包
"""
import argparse
import csv
import json
import sys
import urllib.parse
import urllib.request

API = 'https://open.feishu.cn/open-apis'
DEFAULT_APP_TOKEN = 'GtSLbyyR3aCENOsJYC6cdlsVnih'
DEFAULT_TABLE_ID = 'tblH4au5rnBcqHgJ'
DEFAULT_VIEW_ID = 'vew8PFC7nG'


def http_json(url, method='GET', headers=None, body=None):
    req = urllib.request.Request(url, method=method, data=body, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))


def tenant_token(app_id, app_secret):
    r = http_json(
        API + '/auth/v3/tenant_access_token/internal',
        method='POST',
        headers={'Content-Type': 'application/json; charset=utf-8'},
        body=json.dumps({'app_id': app_id, 'app_secret': app_secret}).encode('utf-8')
    )
    if r.get('code') != 0 and not r.get('tenant_access_token'):
        raise SystemExit('获取 token 失败：' + json.dumps(r, ensure_ascii=False))
    return r.get('tenant_access_token')


def flatten(v):
    """飞书字段值类型众多，统一压平成字符串"""
    if v is None:
        return ''
    if isinstance(v, str):
        return v
    if isinstance(v, (int, float, bool)):
        return str(v)
    if isinstance(v, list):
        parts = []
        for x in v:
            if isinstance(x, str):
                parts.append(x)
            elif isinstance(x, dict):
                parts.append(x.get('text') or x.get('name') or x.get('value') or x.get('title') or '')
        return '、'.join([p for p in parts if p])
    if isinstance(v, dict):
        return v.get('text') or v.get('link') or v.get('name') or v.get('value') or v.get('title') or json.dumps(v, ensure_ascii=False)
    return str(v)


def fetch_records(token, app_token, table_id, view_id):
    rows = []
    page_token = None
    while True:
        q = {'page_size': 500}
        if view_id:
            q['view_id'] = view_id
        if page_token:
            q['page_token'] = page_token
        url = '{}/bitable/v1/apps/{}/tables/{}/records?{}'.format(
            API, app_token, table_id, urllib.parse.urlencode(q))
        r = http_json(url, headers={'Authorization': 'Bearer ' + token})
        if r.get('code') != 0:
            raise SystemExit('拉取记录失败：' + json.dumps(r, ensure_ascii=False))
        data = r.get('data', {})
        for it in data.get('items', []):
            fields = it.get('fields', {}) or {}
            rows.append({k: flatten(v) for k, v in fields.items()})
        if not data.get('has_more'):
            break
        page_token = data.get('page_token')
        if not page_token:
            break
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--app-id', default='')
    ap.add_argument('--app-secret', default='')
    ap.add_argument('--user-token', default='', help='OAuth 获取的 user_access_token')
    ap.add_argument('--app-token', default=DEFAULT_APP_TOKEN)
    ap.add_argument('--table-id', default=DEFAULT_TABLE_ID)
    ap.add_argument('--view-id', default=DEFAULT_VIEW_ID)
    ap.add_argument('--out', default='rows.json')
    ap.add_argument('--format', default='json', choices=['json', 'csv'])
    args = ap.parse_args()

    if args.user_token:
        token = args.user_token
    elif args.app_id and args.app_secret:
        token = tenant_token(args.app_id, args.app_secret)
    else:
        raise SystemExit('请提供 --user-token，或同时提供 --app-id 与 --app-secret')

    rows = fetch_records(token, args.app_token, args.table_id, args.view_id)
    print('共拉取 {} 条记录'.format(len(rows)))

    if args.format == 'csv':
        if not rows:
            raise SystemExit('无数据可写出')
        keys = []
        for r in rows:
            for k in r.keys():
                if k not in keys:
                    keys.append(k)
        with open(args.out, 'w', newline='', encoding='utf-8-sig') as f:
            w = csv.DictWriter(f, fieldnames=keys)
            w.writeheader()
            for r in rows:
                w.writerow(r)
    else:
        with open(args.out, 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
    print('已写出：' + args.out)


if __name__ == '__main__':
    main()
