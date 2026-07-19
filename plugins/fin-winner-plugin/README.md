# Fin Winner Plugin

Fin Winner 投资记录管理插件。安装后，智能体可以通过托管的 MCP 服务读写你的
Fin Winner 数据：

- **自选股 / 持仓标记**（`my-ticker`）：关注列表与持仓分类
- **个股思考**（`stock-thought`）：研究笔记与思考记录
- **估值记录**（`ticker-valuation`）：内在价值与估值方法
- **前瞻洞察**（`ticker-insight`）：驱动因素与未来催化剂
- **交易策略**（`ticker-strategy`）：买卖规则与执行计划
- **分析报告**（`analysis-report`）：HTML/Markdown 研报的上传与下载

同一个目录同时服务两个生态：Codex 读取 `.codex-plugin/plugin.json`，
Claude Code 读取 `.claude-plugin/plugin.json`，两者共享 `.mcp.json` 和
`skills/`。本目录只是插件安装包，MCP 服务端托管在
`https://xcanity.com/fw-plugin/mcp`，其实现代码在独立的私有仓库中维护。

## 在 Claude Code 中安装

```bash
claude plugin marketplace add xcan-ai/xcanity-plugins
claude plugin install fin-winner-plugin@xcanity
```

或者从本地检出安装：

```bash
claude plugin marketplace add /absolute/path/to/xcanity-plugins
claude plugin install fin-winner-plugin@xcanity
```

注意：marketplace 来源必须是 `owner/repo`、`https://` URL，或以 `./`、`/`
开头的路径，单独的 `.` 会被拒绝。

安装后开启新会话，运行 `/mcp`，选择 `fin-winner` 并点击 `Authenticate`。
Claude Code 会通过 RFC 9728 元数据发现授权服务器，用 DCR 动态注册 OAuth
客户端，并完成短信登录授权流程。在完成认证之前，`claude mcp list` 会显示
该服务器连接失败 —— 这是预期中的未认证 `401` 挑战，不是服务故障。

## 在 ChatGPT / Codex 中安装

从 GitHub 安装：

```bash
codex plugin marketplace add xcan-ai/xcanity-plugins --ref main
codex plugin add fin-winner-plugin@xcanity
```

首次添加 marketplace 后需要重启 ChatGPT 桌面端。新建任务时启用
Fin Winner Plugin，按提示完成 OAuth 授权即可。

从本地检出安装（在仓库根目录执行）：

```bash
codex plugin marketplace add .
codex plugin add fin-winner-plugin@xcanity
```

插件包内注册的 MCP 端点是 `https://xcanity.com/fw-plugin/mcp`，无需在本地
运行任何 MCP 进程。

## 在其他 MCP 客户端中使用

任何支持 Streamable HTTP MCP 和 OAuth 自动发现的框架都可以直接连接，
无需插件格式：

```json
{
  "mcpServers": {
    "fin-winner": {
      "type": "http",
      "url": "https://xcanity.com/fw-plugin/mcp"
    }
  }
}
```

认证方式为 OAuth 2.1（动态客户端注册 + PKCE），客户端会根据端点返回的
`WWW-Authenticate` 挑战和 RFC 9728 受保护资源元数据自动完成发现与登录。

## 使用示例

安装并完成授权后，可以直接用自然语言操作：

- 「看一下我当前的自选股列表」
- 「查询 HOOD 最新的前瞻洞察」
- 「记录一条 TSLA 的思考：……」
- 「列出我所有生效中的交易策略」
- 「把这份 HTML 研报上传为 NVDA 的分析报告」

## 工具一览

| 工具 | 用途 | 副作用 |
| --- | --- | --- |
| `list_fin_records` | 按过滤条件列出某类资源 | 只读 |
| `get_fin_record` | 按资源类型和 ID 查询单条记录 | 只读 |
| `create_fin_record` | 创建一条记录 | 写入 |
| `update_fin_record` | 局部更新一条记录 | 写入（覆盖） |
| `delete_fin_record` | 永久删除一条记录 | 写入（不可恢复） |
| `publish_analysis_report` | 上传 HTML/Markdown 并创建报告元数据 | 写入 |
| `get_analysis_report_download` | 获取报告的签名下载链接 | 只读 |
