---
categories: Study
cover: ../post_images/Coding-Agent-Handbook.jpg
date: 2026-08-07 00:40:46
description: 本文将围绕 Claude Code、Codex、Kimi Code 三家产品进行功能对比。
tags: [Review, Coding，LLM]
title: Coding Agent 速查手册
updated: 2026-08-07
---

在程序员日常开发中，模型能力只是一部分，Code Agent CLI 的易用性和安全性也是重要的一环，本文将深度比较 Claude Code、Codex 和 Kimi Code 三家产品，汇总核心的命令和快捷键，做到不断优化、与时俱进。

- **Claude Code**：提供 checkpoint、rewind、后台 Agent、完整键位定制和多种权限模式。
- **Codex**：Rust 开源，默认使用 OS 沙箱，审批、文件系统和网络策略分层明确。
- **Kimi Code**：MIT 开源，支持多供应商、ACP、视频输入、Goal、Swarm、Web/Vis。

|   项目   |                         Claude Code                          |                            Codex                             |                          Kimi Code                           |
| :------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| 快照版本 | [`v2.1.220`](https://github.com/anthropics/claude-code/releases) |    [`0.145.0`](https://github.com/openai/codex/releases)     | [`0.29.2`](https://github.com/MoonshotAI/kimi-code/releases) |
| 官方文档 | [Claude Code Docs](https://code.claude.com/docs/en/overview) | [Codex Docs](https://developers.openai.com/codex/cli/features) |      [Kimi Code Docs](https://www.kimi.com/code/docs/)       |
| 源码开放 |                             闭源                             |                          Apache-2.0                          |                             MIT                              |
|   语言   |                              —                               |                             Rust                             |                          TypeScript                          |

# 安装与启动

```bash
# Claude Code（官方推荐 native installer；npm 亦可，需 Node.js 22+）
curl -fsSL https://claude.ai/install.sh | bash

# Codex（macOS 也可 Homebrew）
npm i -g @openai/codex

# Kimi Code（脚本发行版无需预装 Node；npm 包需 Node.js 22.19+）
curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash
```

| 场景         | Claude Code                  | Codex                            | Kimi Code                |
| ------------ | ---------------------------- | -------------------------------- | ------------------------ |
| 运行时       | native binary                | native Rust binary               | TypeScript on Node       |
| 交互启动     | `claude`                     | `codex`                          | `kimi`                   |
| 一次性任务   | `claude -p "任务"`           | `codex exec "任务"`              | `kimi -p "任务"`         |
| 继续最近会话 | `claude -c`                  | `codex resume --last`            | `kimi -c`                |
| 恢复指定会话 | `claude -r <id>`             | `codex resume <id>`              | `kimi -S <id>`           |
| 主配置       | `~/.claude/settings.json`    | `~/.codex/config.toml`           | `~/.kimi-code/*.toml`    |
| 数据根目录   | `CLAUDE_CONFIG_DIR`          | `CODEX_HOME`                     | `KIMI_CODE_HOME`         |
| 自检         | `/doctor`（别名 `/checkup`） | `codex doctor` / `/debug-config` | `kimi doctor`            |
| 项目初始化   | `/init` 生成 `CLAUDE.md`     | `/init` 生成 `AGENTS.md`         | `/init` 生成 `AGENTS.md` |

注意：

- Claude 的 npm 包如今安装的也是同一个 native binary，不再由 Node 启动。
- Kimi 改 `KIMI_CODE_HOME` 时，配置、会话、日志、凭据和 Kimi 专属 Skills 会一起迁移。
- Kimi 新版的继续会话简写已经是小写 `-c`，不是旧资料里的大写 `-C`。

指令文件的组织方式三家各不相同：

- Claude 的 `CLAUDE.md` 支持目录层级和 imports；
- Codex 按 global → repo root → 当前目录逐层合并 `AGENTS.md`；
- Kimi 依次读取 `$KIMI_CODE_HOME/AGENTS.md`、通用 `~/.agents/AGENTS.md`、项目 `.kimi-code/AGENTS.md` 或 `AGENTS.md`。

# Agent 权限管理

Agent 权限管理包含审批（*Approval/Permission*）和沙箱（*OS Sandbox*）独立的维度：

- **审批（要不要问你）**：某次工具调用是否弹窗确认。进阶是"自动审核"，由分类器（*Classifier*）替人把关。
- **沙箱（能碰到什么）**：操作系统层强制限制进程可写的目录和能否联网，即使上层判断错了也生效。

**Claude Code** 把成熟度都投在了审批侧：权限模式与交互整合最细密，沙箱则是可选的附加层。

- 审批：六档 *permission modes*——`default/manual`（逐个确认）、`acceptEdits`（自动接受文件编辑）、`plan`（只读规划）、`auto`（独立安全分类器自动把关，[分析文见此](https://jiangshibiao.github.io/Claude-Product-Insights)）、`dontAsk`、`bypassPermissions`（跳过检查）。会话内 `Shift+Tab` 循环，或用 `/permissions` 管理 allow/ask/deny 规则。
- 沙箱：没有档位，是一个开关。`/sandbox` 或 settings 启用后，Bash 子进程被限制在当前目录和 session 临时目录，可配置网络 allowlist、代理与凭据保护；注意它只罩 Bash，Read/Edit 等文件工具仍归 permission system 管。实现为 macOS Seatbelt、Linux/WSL2 bubblewrap+socat（原生 Windows 不支持）。

**Codex** 是三家中唯一把两个旋钮都做成明确档位的，默认姿态也最保守（workspace-write + 通常禁网）。

- 审批：三档 *approval_policy*：`untrusted`（只有已知安全命令自动放行，其余都问）、`on-request`（默认，沙箱内自动执行，越界才请求批准）、`never`（从不弹窗，供受控自动化，但沙箱依然生效）。此外还有 Auto-review：把越界审批交给独立 reviewer agent 按策略裁决，`/approve` 可对最近一次拒绝单次重试。
- 沙箱：三档 *sandbox_mode*。底层为 macOS Seatbelt、Linux/WSL2 bubblewrap 和 Windows sandbox。
- 组合：`/permissions` 打开预设选择器（`Shift+Tab` 只切 default/Plan），三档预设即两个旋钮的组合。长期组合可写成 `config.toml` 的命名 profile，用 `codex --profile <名字>` 激活。

| `sandbox_mode`            | 行为                                                         |
| :------------------------ | :----------------------------------------------------------- |
| `read-only`               | 只读：不能写任何文件、默认禁网；改动触发审批并尝试沙箱外执行 |
| `workspace-write`（默认） | 可写工作区与临时目录，默认禁网；`writable_roots` 可放行其他目录 |
| `danger-full-access`      | 全盘读写 + 联网，等同没有沙箱，官方标注谨慎使用              |

| `/permissions` | 行为                                                         |
| -------------- | ------------------------------------------------------------ |
| Read Only      | `read-only`                                                  |
| Auto           | `workspace-write` + `on-request`                             |
| Full Access    | `danger-full-access` + `never` + 网络开启。网络侧有 domain allow/deny、代理、DNS rebinding 检查、local binding 与 Unix socket 策略，是三家里最细的。 |

**Kimi Code** 没有沙箱维度，工具规则和白/黑名单只是审批层配置，隔离要靠容器、VM 或受限账号等外部环境。 会话内 Plan 用 `Shift+Tab` 切换，权限用 `/permission` 切换，或用`/auto`、`/yolo` 快捷转到目标分组。

|                | `manual`     | `/yolo`                          | `/auto`          |
| -------------- | ------------ | -------------------------------- | ---------------- |
| 工具审批       | 每次弹窗确认 | 跳过普通工具调用审批             | 所有审批自动处理 |
| Agent 向你提问 | 会           | 仍会（需求不清时停下问你）       | 不会，完全自治   |
| Plan 退出审批  | 需确认       | 不跳过                           | 全程无需人工     |
| 适用           | 日常谨慎把关 | 信任目录里的批量操作，保留对话权 | 无人值守长任务   |

# 常规功能

|   标准功能    |     Claude Code      |        Codex        |            Kimi Code             |
| :-----------: | :------------------: | :-----------------: | :------------------------------: |
| 引用文件/目录 |         `@`          |  `@` 、`/mention`   |               `@`                |
|  启用 Shell   |       行首 `!`       |      行首 `!`       |             行首 `!`             |
|  快捷键帮助   |       行首 `?`       |      行首 `?`       |             `/help`              |
| 切换模型强度  |  `/model`、`/fast`   |  `/model`、`/fast`  | `/model`、`/provider`、`/effort` |
| 切换思考强度  |    `Option/Alt+T`    |  `Alt+,` / `Alt+.`  |     `/effort` / `/thinking`      |
|   快速模式    |    `Option/Alt+O`    |       `/fast`       |                无                |
|   查看区别    |       `/diff`        |       `/diff`       |        审批面板 `Ctrl+E`         |
|  上下文用量   | `/context`、`/usage` | `/status`、`/usage` |             `/usage`             |
|     状态      |      `/status`       |      `/status`      |            `/status`             |

|   高级功能   |        Claude Code        |         Codex          |       Kimi Code       |
| :----------: | :-----------------------: | :--------------------: | :-------------------: |
| 启用 review  | `/review`、`/code-review` |       `/review`        |          无           |
|   查看审批   |    交互时按 `Tab` 切换    |  交互时按 `Tab` 切换   | `Ctrl+E` 展开审批面板 |
|  后台 shell  |    `Ctrl+B`、`/tasks`     |     `/ps`、`/stop`     |  `Ctrl+B`、`/tasks`   |
|  Agent 入口  |  subagent / Agent teams   | `/agent`、`/subagents` |   `Agent`、`/swarm`   |
|  切换 Agent  |    agent view / panel     |    `Alt+Left/Right`    |    task/swarm 面板    |
|   持久目标   |          `/goal`          |        `/goal`         | `/goal`、`/goal next` |
|   计划模式   |   `Shift+Tab`、`/plan`    |  `Shift+Tab`、`/plan`  | `Shift+Tab`、`/plan`  |
|   定时执行   |   Workflows / schedule    |   Cloud / 外部自动化   |    内置 cron 工具     |
| 停止全部后台 |      `Ctrl+X Ctrl+K`      |        `/stop`         |       `/tasks`        |

# 会话和编辑

|    输入框     |                    Claude Code                     |                Codex                 |                   Kimi Code                    |
| :-----------: | :------------------------------------------------: | :----------------------------------: | :--------------------------------------------: |
|     换行      | `\+Enter`、`Option+Enter`、`Shift+Enter`、`Ctrl+J` | `Shift+Enter`、`Alt+Enter`、`Ctrl+J` |            `Shift+Enter`、`Ctrl+J`             |
|  行首 / 行尾  |                `Ctrl+A` / `Ctrl+E`                 |         `Ctrl+A` / `Ctrl+E`          |              `Ctrl+A` / `Ctrl+E`               |
| 左/右一个字符 |                方向键或 `Ctrl+B/F`                 |         方向键或 `Ctrl+B/F`          |              方向键或 `Ctrl+B/F`               |
|  左/右一个词  |                     `Alt+B/F`                      |              `Alt+B/F`               | `Alt+B/F`、`Alt+Left/Right`、`Ctrl+Left/Right` |
|  删到行首/尾  |                `Ctrl+U` / `Ctrl+K`                 |         `Ctrl+U` / `Ctrl+K`          |              `Ctrl+U` / `Ctrl+K`               |
|  删除上一词   |                      `Ctrl+W`                      |               `Ctrl+W`               |           `Ctrl+W` / `Alt+Backspace`           |
| 恢复删除内容  |              `Ctrl+Y`；`Alt+Y` 可轮换              |               `Ctrl+Y`               |            `Ctrl+Y`；`Alt+Y` 可轮换            |
| 撤销草稿编辑  |             `Ctrl+_` / `Ctrl+Shift+-`              |          取决于当前编辑模式          |                    `Ctrl+-`                    |
|  清空对话框   |                      `Ctrl+C`                      |               `Ctrl+C`               |                    `Ctrl+C`                    |
|   粘贴图片    |    `Ctrl+V`；iTerm `Cmd+V`；Windows/WSL `Alt+V`    |        `Ctrl+V`、`Ctrl+Alt+V`        |      Unix/macOS `Ctrl+V`；Windows `Alt+V`      |
|   粘贴视频    |                       不支持                       |                不支持                |                   与图片同键                   |

|     会话编辑      |         Claude Code         |          Codex          |    Kimi Code     |
| :---------------: | :-------------------------: | :---------------------: | :--------------: |
|     发送消息      |           `Enter`           |         `Enter`         |     `Enter`      |
|   插入排队消息    |       运行中 `Enter`        |      运行中 `Tab`       |  运行中 `Enter`  |
| 编辑/召回排队消息 |         空输入 `↑`          | `Alt+Up` / `Shift+Left` |    空输入 `↑`    |
|   插入即时消息    |      无，先中断再发送       |         `Enter`         |     `Ctrl+S`     |
|    中断当前轮     |      `Esc` / `Ctrl+C`       |          `Esc`          | `Esc` / `Ctrl+C` |
|   暂存/恢复草稿   |          `Ctrl+S`           |           无            |        无        |
|   重绘/清除屏幕   |          `Ctrl+L`           |   `Ctrl+L`，不清会话    |        无        |
|  打开外部编辑器   | `Ctrl+G` 或 `Ctrl+X Ctrl+E` |        `Ctrl+G`         |     `Ctrl+G`     |
|     历史搜索      |          `Ctrl+R`           |        `Ctrl+R`         |        无        |
|    上/下条草稿    |      `↑/↓`、`Ctrl+P/N`      |          `↑/↓`          |      `↑/↓`       |

|    会话管理     |             Claude Code             |               Codex               |                 Kimi Code                 |
| :-------------: | :---------------------------------: | :-------------------------------: | :---------------------------------------: |
|     新会话      |     `/clear`、`/new`、`/reset`      |         `/new`、`/clear`          |             `/new`、`/clear`              |
|    恢复会话     | `--continue`、`--resume`、`/resume` |     `codex resume`、`/resume`     | `--continue`、`--session/-S`、`/sessions` |
|    旁路提问     |          `/btw [question]`          |     `/side`、`/btw`、`Ctrl+/`     |                  `/btw`                   |
|    分叉会话     |   `/fork`、`/branch`、`/subtask`    |        `/fork`、`Esc Esc`         |                  `/fork`                  |
|    压缩会话     |         自动 或 `/compact`          |        自动 或 `/compact`         |     自动 或 `/compact [instruction]`      |
|    草稿撤销     |      `Ctrl+_` / `Ctrl+Shift+-`      |      默认编辑、Vim 或 keymap      |                 `Ctrl+-`                  |
|    对话回退     |    空输入 `Esc Esc` / `/rewind`     | `Esc Esc` 编辑上一 prompt 并 fork |        `/undo [count]` / `Esc Esc`        |
| 文件 checkpoint |              有，自动               |                无                 |                    无                     |
|    展开 TODO    |              `Ctrl+T`               |            TUI 内显示             |                 `Ctrl+T`                  |
|    展开详情     |              `Ctrl+O`               |         `Ctrl+T`、`Alt+R`         |                 `Ctrl+O`                  |
|    导出/复制    |         `/export`、`/copy`          |              `/copy`              |     `/export-md`、`/export-debug-zip`     |
|    退出会话     |          空输入 `Ctrl+D`×2          |        `Ctrl+C` / `/quit`         |             空输入 `Ctrl+D`×2             |

对话回退是一个非常 trick 的功能：

- Claude 的 [checkpointing](https://code.claude.com/docs/en/checkpointing) 是唯一支持文件回滚的功能。用户每次的 prompt 会自动保存，并保留最近 100 个 checkpoint；使用 `/rewind` 可以只恢复代码、只恢复对话、两者一起恢复，也可以从某点生成摘要。但这个功能无法替代 Git，像 Bash、后台 subagent、外部程序和 symlink 指向的文件等可能无法完整恢复。
- Codex 的 `Esc Esc` 很聪明，语义是"编辑上一条用户消息，从那个对话点 fork"，不是文件回滚。
- Kimi 的 `/undo` 会回滚上下文、todo 和 Plan 状态，但明确写着"不回滚代码改动"。

Codex 有一些专有命令，如 `/archive` 表示归档会话并退出，`/delete` 表示永久删除会话。

Claude 2.1.212 后改过 `/fork` 的语义：它会把当前对话复制成 [agent view](https://code.claude.com/docs/en/agent-view) 里的后台 session，当前会话继续留在原地；`/branch` 才是切入一个副本，`/subtask` 则适合派出结果最终回到当前对话的支线任务。

# 生态与扩展

三家都支持项目指令、Skills、MCP、Hooks 和 Plugins，差异主要在界面形态和生态接入面。下列这张表按"运行形态 → 生态接入 → 指令与记忆 → 扩展点 → 界面定制"的顺序排列。

|       能力       |       Claude Code       |         Codex         |        Kimi Code        |
| :--------------: | :---------------------: | :-------------------: | :---------------------: |
|    交互式 TUI    |   default/fullscreen    | transcript、side chat |   工具折叠、todo 面板   |
|    非交互执行    |       `claude -p`       |     `codex exec`      |        `kimi -p`        |
|     结构化流     |   JSON / stream-json    |         JSONL         |       stream-json       |
| JSON Schema 输出 |     `--json-schema`     |   `--output-schema`   |       无等价能力        |
|    SDK / 服务    |     TS、Python SDK      |  TS SDK、App Server   |     ACP、`kimi web`     |
|   IDE / 其他端   | VS Code、JetBrains、Web | IDE、桌面 App、Cloud  |      VS Code、ACP       |
|     Web 工具     |     Search / Fetch      |       三档搜索        |     Search / Fetch      |
|     媒体输入     |          图片           |         图片          |       图片、视频        |
|   模型/供应商    |       Claude 体系       |      OpenAI 体系      |        多供应商         |
|     配置迁移     |        导入工具         |       `/import`       | `/import-from-cc-codex` |
|     项目指令     |       `CLAUDE.md`       |      `AGENTS.md`      |       `AGENTS.md`       |
|     自动记忆     | `MEMORY.md`、`/memory`  |      `/memories`      |           无            |
|      Skills      |      slash command      |  `$skill`、`/skills`  |     `/skill:<name>`     |
|    MCP 支持度    |   stdio、HTTP、OAuth    |  stdio、HTTP、OAuth   |   stdio、HTTP、OAuth    |
|     启用 MCP     |         `/mcp`          |        `/mcp`         |         `/mcp`          |
|      Hooks       |     `/hooks` 或配置     |       `/hooks`        |          配置           |
|     Plugins      |         含 LSP          |     含 connectors     |        标准四件         |
|   自定义 Agent   |        Markdown         |         TOML          |        Markdown         |
|   自定义快捷键   |   `keybindings.json`    |       `/keymap`       |           无            |
|       Vim        |        `/config`        |        `/vim`         |           无            |
|   主题 / 界面    |        `/theme`         |  `/theme`、`/title`   |  `/theme`、`tui.toml`   |
|     语音输入     |        `/voice`         | 按住空格，需单独开启  |           无            |

Claude Code 在 CLI 之外支持 TypeScript / Python Agent SDK、VS Code、JetBrains 和 Web/Remote；Web 工具为 Search / Fetch 两件；plugins 可打包 skills、agents、hooks、MCP 和 LSP；提供 `/review`、`/security-review`、多档 `/code-review` 和云端 ultra review 覆盖不同审查深度；`/tui default|fullscreen` 切换渲染器，配合自定义 keybindings 和 statusline 调整终端界面。

Codex 接入面包括 TypeScript SDK、App Server、桌面 App 和 Cloud，自身还能作为 MCP server 被调用；Web 搜索分 cached / live / disabled 三档；plugins 可打包 skills、connectors、MCP 和 context。`/apps` 浏览连接器，随后可用 `$app-slug` 放入 prompt；`/app` 把当前 session 续到桌面 App；`/personality` 提供 friendly、pragmatic、none 三档人格；raw scrollback 和 terminal pet 用于 TUI 定制。

Kimi Code 接入面包括 ACP（可接 Zed、JetBrains 等）、Klient，以及 `kimi web` 暴露的 REST/WebSocket API；`kimi vis` 用于检查本地 session。模型侧支持 Kimi、Anthropic、OpenAI、Google/Vertex 等多供应商；Web 工具除 Search / Fetch 外另有 `kimi web`。ACP、MCP、plugins、Skills 和自定义 Agent 是主要扩展入口。

# 资料整理

[Claude Code: Interactive mode](https://code.claude.com/docs/en/interactive-mode)：TUI 交互、运行中 Enter 排队等行为的官方口径。

[Claude Code: Keybindings](https://code.claude.com/docs/en/keybindings)：全部默认快捷键清单，含 `Ctrl+L` 双击 `/clear` 的说明。

[Claude Code: Slash commands](https://code.claude.com/docs/en/commands)：`/init`、`/clear`、`/sandbox` 等命令索引。

[Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)：六档权限模式与 `--dangerously-skip-permissions` 的定义。

[Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)：Bash 沙箱的开关、边界与"非默认开启"的现状。

[Claude Code: Checkpointing](https://code.claude.com/docs/en/checkpointing)：checkpoint 的覆盖范围与"只管文件、不管会话"的局限。

[Claude Code: Subagents](https://code.claude.com/docs/en/sub-agents) / [Hooks](https://code.claude.com/docs/en/hooks)：子 Agent 与生命周期钩子的配置格式。

[Codex: CLI features](https://developers.openai.com/codex/cli/features)：TUI 形态、steer/queue、side chat 等特性总览。

[Codex: Slash commands](https://developers.openai.com/codex/cli/slash-commands)：`/permissions`、`/fork`、`/archive`、`/delete` 等命令索引。

[Codex: Security](https://developers.openai.com/codex/security)：审批策略 × 沙箱档位的官方矩阵，本文第 4 节的主要依据。

[Codex: Configuration](https://developers.openai.com/codex/config-basic)：`approval_policy`、`sandbox_mode`、profiles 与 keymap 的配置写法。

[Codex: Skills](https://developers.openai.com/codex/skills)：`$skill` 引用与 `/skills` 管理的格式约定。

[openai/codex](https://github.com/openai/codex)：开源 Rust 内核，CLI、沙箱、审批与会话管理的实现都在这里。

[Kimi Code: 文档首页](https://www.kimi.com/code/docs/)：0.29.x 文档入口。

[Kimi Code: Keyboard](https://www.kimi.com/code/docs/kimi-code-cli/reference/keyboard.html)：`Ctrl+S` steer、`Ctrl+-` 撤销等快捷键的官方清单。

[Kimi Code: Slash commands](https://www.kimi.com/code/docs/kimi-code-cli/reference/slash-commands.html)：`/yolo`、`/auto`、`/clear`（`/reset`）等命令索引。

[Kimi Code: Sessions](https://www.kimi.com/code/docs/kimi-code-cli/guides/sessions.html)：会话保存与恢复机制。

[Kimi Code: Goals](https://www.kimi.com/code/docs/kimi-code-cli/guides/goals.html)：Goal 的目标驱动循环。

[Kimi Code: Providers](https://www.kimi.com/code/docs/kimi-code-cli/configuration/providers.html)：多供应商配置。

[MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)：MIT 开源仓库，issue 区是确认边界行为的重要来源。

[Addy Osmani: My AI-assisted coding workflow](https://addyosmani.com/blog/ai-coding-workflow/)：spec → Plan → 小步任务 → tests → commit 的通用工作流，第二部分"日常提效"的参照。

[Simon Willison: How the Claude Code team uses Claude Code](https://simonwillison.net/2026/Jul/21/cat-and-thariq/)：CC 团队访谈：高频 dogfood，以及从逐次 permission prompt 转向 Auto classifier 的官方自述。

[Simon Willison: Running Codex CLI against itself](https://simonwillison.net/2025/Nov/9/gpt-5-codex-mini/)：Codex 自行分析和修改自身源码的实录，开源内核 + `AGENTS.md` 价值的实例。

[Simon Willison: Porting justhtml with Codex](https://simonwillison.net/2025/Dec/15/porting-justhtml/)：长时间 Agent loop 依赖可执行测试与频繁 commit 才能收敛。

[Simon Willison: OpenAI are quietly adopting skills](https://simonwillison.net/2025/Dec/12/openai-skills/)：Skills 以 Markdown + 脚本为基本单元的格式分析，三家格式趋同的背景。

[kimi-code #37](https://github.com/MoonshotAI/kimi-code/issues/37)：从 Python `kimi-cli` 迁移到 TypeScript `kimi-code` 的讨论记录。

[kimi-code #108](https://github.com/MoonshotAI/kimi-code/issues/108)：`/undo` 不回滚文件的确认，与当前文档口径一致。

[kimi-code #256](https://github.com/MoonshotAI/kimi-code/issues/256) / [#981](https://github.com/MoonshotAI/kimi-code/issues/981)：终端兼容与长输出滚动问题，选型时的现实考量。

[kimi-code #524](https://github.com/MoonshotAI/kimi-code/issues/524)：`/context` breakdown 的讨论，0.29.2 尚未进入正式 registry。

[kimi-code #716](https://github.com/MoonshotAI/kimi-code/issues/716)：Goal 的原始提案，已在 0.29.2 落地。

[kimi-code #811](https://github.com/MoonshotAI/kimi-code/issues/811)：父级 `AGENTS.md` 递归语义的讨论，monorepo 场景勿套用 Codex 的合并逻辑。
