# xcan-plugins

Xcan 智能体插件的公开分发仓库。每个插件封装一个托管的远程 MCP 服务，
ChatGPT/Codex、Claude Code 以及任何支持 MCP 的框架都可以直接安装使用，
无需在本地运行任何服务进程。

本仓库只包含**可安装的插件包**（插件清单、skills、托管 MCP 端点引用），
服务端实现在各自的产品仓库中独立维护和部署。

## 插件列表

| 插件 | 说明 | MCP 端点 | 状态 |
| --- | --- | --- | --- |
| [`fin-winner-plugin`](plugins/fin-winner-plugin) | 管理 Fin Winner 投资记录：自选股、个股思考、估值、前瞻洞察、交易策略、分析报告 | `https://xcanity.com/fw-plugin/mcp` | 可用 |
| `ai-counter` | — | — | 规划中 |
| `clipmusic` | — | — | 规划中 |

## 安装方法

### Claude Code

```bash
claude plugin marketplace add xcan-ai/xcan-plugins
claude plugin install fin-winner-plugin@xcanity
```

### ChatGPT / Codex

```bash
codex plugin marketplace add xcan-ai/xcan-plugins --ref main
codex plugin add fin-winner-plugin@xcanity
```

首次添加 marketplace 后需要重启 ChatGPT 桌面端。

### 其他 MCP 客户端（Cursor、Windsurf、VS Code、Gemini CLI、claude.ai 连接器等）

本仓库的插件都由远程 Streamable HTTP MCP 服务提供支持，并支持 OAuth 2.1
自动发现，因此任何 MCP 客户端只需配置端点 URL 即可连接：

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

各插件的端点地址和客户端注意事项见对应插件目录下的 README。

## 仓库结构

```text
.claude-plugin/marketplace.json   # Claude Code marketplace（名称：xcanity）
.agents/plugins/marketplace.json  # Codex / ChatGPT 桌面端 marketplace（名称：xcanity）
plugins/<plugin>/
  .claude-plugin/plugin.json      # Claude Code 插件清单
  .codex-plugin/plugin.json       # Codex / ChatGPT 插件清单（含 interface 与 App 元数据）
  .mcp.json                       # 共享的远程 MCP 端点注册
  .app.json                       # ChatGPT App 引用（如适用）
  skills/<name>/SKILL.md          # 供智能体加载的操作指引
  README.md                       # 插件使用说明
scripts/validate.mjs              # 清单一致性校验（CI 自动执行）
```

## 贡献规则

- 本仓库是**公开仓库**：严禁提交任何凭证、`.env` 文件或内部基础设施信息，
  只允许出现公开的产品 URL。
- 两份 marketplace 文件必须列出相同的插件集合，并指向相同的目录。
- 任何插件包内容变更（清单、`.mcp.json`、skills）都必须同步升级版本号：
  `.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` 与
  `.claude-plugin/marketplace.json` 中的条目三处一起改 —— 客户端按版本号
  缓存已安装的插件副本。
- 安装坐标（`<plugin>@xcanity`）是面向用户的稳定接口，插件名和 marketplace
  名一经发布不可更名。
- 提交前运行 `node scripts/validate.mjs`（CI 会在每次 push 和 PR 时执行）。
