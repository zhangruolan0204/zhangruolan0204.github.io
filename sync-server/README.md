# 进阶方案：飞书开放平台 OAuth + 后端定时 API 同步

> 这是工作台的第 9 条预留架构，适合作为**项目迭代方向**或**毕设技术亮点对比方案**。
> 当前主用方案是 `feishu-bridge` 浏览器扩展桥接；本方案提供更规范、可服务化的官方 API 路径。

## 架构

```
飞书多维表格（Base）
      │  官方 Open API（bitable/v1/records）
      ▼
后端同步服务（本目录 feishu_sync.py，可挂 cron / 任务计划 / 云函数）
      │  输出 rows.json / rows.csv
      ▼
秋招工作台（CSV 文件导入 / 粘贴导入 / 未来可由后端直推桥接接口）
```

- **授权方式 A（tenant_access_token）**：企业自建应用 + 应用被添加为表格协作者，最简单，适合自用
- **授权方式 B（user_access_token / OAuth）**：用户授权一次即可访问其有权限的全部文档，**无需表格所有者额外操作**，体验最好，也最适合写进毕设（标准 OAuth2 流程）

## 使用步骤

1. 打开 https://open.feishu.cn → 创建「企业自建应用」→ 拿到 `app_id` / `app_secret`
2. 应用权限里开通 `bitable:app`、`bitable:app:readonly` 等；把应用加为表格协作者
3. 运行：

```bash
# 输出 JSON（工作台粘贴导入可直接用）
python feishu_sync.py --app-id cli_xxxx --app-secret xxxx --out rows.json

# 输出 CSV（工作台「导入 CSV 文件」直接用，推荐）
python feishu_sync.py --app-id cli_xxxx --app-secret xxxx --out rows.csv --format csv

# 已有 OAuth user token 时
python feishu_sync.py --user-token u-xxxx --out rows.csv --format csv
```

4. 定时任务（每天学姐更新后自动跑）：
   - Windows：任务计划程序，每天 09:00 执行上述命令
   - Linux/macOS：`0 9 * * * cd /path && python feishu_sync.py --app-id ... --out rows.csv --format csv`

## 为什么这条更"正规"

| 维度 | 浏览器扩展桥接（当前主用） | 官方 API + 后端（本方案） |
|---|---|---|
| 权限来源 | 复用本机浏览器登录态 | 官方 OAuth 授权 / 应用授权 |
| 稳定性 | 依赖页面内部接口，结构变化需适配 | 官方稳定接口，版本化 |
| 自动化 | 本机常开浏览器才行 | 服务端定时，与浏览器无关 |
| 合规/答辩 | 个人自用工具 | 可作为标准技术方案讲解 |
| 成本 | 零配置 | 需创建应用 + 授权 |

毕设答辩建议：把两条路径都讲——**先做能跑的（扩展桥接），再给出规范演进方案（OAuth + 后端）**，体现你对浏览器安全模型与 API 集成的完整理解。

## 安全提醒
- `app_secret` 等同密码，不要提交到公开仓库；脚本建议配合环境变量使用
- 本脚本只做**只读拉取**，不会对表格做任何写入
