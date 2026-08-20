# 深链跳转使用指引（Handoff Guide）

> 给其他 agent / 终端脚本 / jump 启动器使用：**打开浏览器并定位到 DSH Web GUI 的指定会话**（可精确到某条用户消息）。
> 能力来源：dsh-track 插件的 `src/client/deep-link.ts`（复用 `jumpToConversation` 的 open + 滚动定位）。

## 1. URL 格式（两种别名）

| 形式 | URL | 语义 |
|---|---|---|
| **路径** | `http://<host>:<port>/s/<sessionId>[/<messageId>]` | **持久化**：书签 / 刷新 / 分享持续有效，跳转后 URL 保留 |
| **查询** | `http://<host>:<port>/?open=<sessionId>[&message=<messageId>]` | **一次性**：跳转成功后参数自动清理（刷新不会重复跳） |

- `<sessionId>`：`session-<uuid>`（如 `session-58550315-8d51-49a9-954b-a177fa5aad30`）
- `<messageId>`：可选，用户消息的 uuid（定位到该条 prompt 行并高亮闪烁 ~2.6s）

## 2. 前置条件

- **dsh web 运行中**：端口以 `DSH_WEB_URL`（bash 环境变量）为准，默认 `http://127.0.0.1:3080`。
- **插件已安装**：dsh-track 在 GUI 的客户端 roster 中（硬刷新后生效）。
- **会话在当前 workspace 列表内**：深链只打开当前会话列表中的会话（列表外的 id 静默不跳）。

## 3. 获取 sessionId

```sh
# 会话日志目录：$DSH_HOME/sessions/<workspace-path-encoded>/session-<uuid>/session.jsonl.zstd
ls "$DSH_HOME/sessions/"*/                          # 每个目录 = 一个会话
# workspace 清单（workspaceId → path + sessionIds）：
cat "$DSH_HOME/storages/workspace.json"
# 会话日志首行 JSON 含 id / cwd / createdAt：
zstd -dc "$DSH_HOME/sessions/"*"/session-"*"/session.jsonl.zstd" 2>/dev/null | head -1
```

## 4. 获取 messageId（可选，定位到消息）

```sh
# 解压会话日志，取 user/message 事件的 messageId：
zstd -dc "<session.jsonl.zstd>" | python3 -c "
import json, sys
for line in sys.stdin:
    e = json.loads(line)
    if e.get('type') == 'user/message':
        d = e.get('data', {})
        print(e.get('seq'), d.get('messageId'), (d.get('content') or [{}])[0].get('text', '')[:50])
"
```

## 5. 打开

```sh
# macOS：
open "http://127.0.0.1:3080/s/session-58550315-8d51-49a9-954b-a177fa5aad30"
open "http://127.0.0.1:3080/s/session-58550315-8d51-49a9-954b-a177fa5aad30/defd7f2d-cf25-46f0-b90e-f0cb4ecf2294"
open "http://127.0.0.1:3080/?open=session-58550315-8d51-49a9-954b-a177fa5aad30&message=defd7f2d-cf25-46f0-b90e-f0cb4ecf2294"
# Linux / Windows：xdg-open / start 同理
```

## 6. 验证

- 浏览器打开后：该会话被选中（对话内容加载）；
- 带 `<messageId>` 时：对应消息行滚动到视口中央并高亮闪烁（约 2.6s）；
- 路径形式地址栏保持 `/s/...`；查询形式地址栏回落到 `/`。

## 7. 注意事项

- **sessionId 是本机不透明标识**：链接只在同一 `$DSH_HOME` 下有效（换 slot / 换机器 / 换 profile 失效）。
- **冷启动等待**：页面刚打开时会话列表异步到达，跳转等待最多 20s；消息定位最多翻 40 页深历史。
- **静默失败**：未知会话 / 列表外 / 插件未加载 → 回到默认视图，不报错不弹窗。
- **与 dsh-session-link 共存安全**：`/s/<id>` 重叠区双方幂等（`sessions.open` 同步赋值，无重置），顺序无关（详见 `docs/deep-link-jump-into-conversation.md` §6.4）。
- **不注入模型上下文**：本跳转是"人看"场景；要把会话内容带给模型（快照注入），那是 `dsh-session:` mention / dsh-session-link 的事。

## 8. 快捷片段（给 agent 用）

```sh
# dsh-jump <sessionId> [messageId] —— 打开浏览器定位会话/消息
dsh-jump() {
  local base="${DSH_WEB_URL:-http://127.0.0.1:3080}"
  if [ -n "$2" ]; then open "$base/s/$1/$2"; else open "$base/s/$1"; fi
}

# 从会话日志目录按 cwd 找会话 id
dsh-find-session() {
  local q="$1"
  for f in "$DSH_HOME"/sessions/*/*/session.jsonl.zstd; do
    head=$(zstd -dc "$f" 2>/dev/null | head -1)
    if echo "$head" | grep -q "$q"; then echo "$head" | python3 -c "import json,sys; print(json.loads(sys.stdin.read())['id'])"; fi
  done
}
```

> 说明：`open` 命令以 macOS 为例；Windows 用 `start "" "<url>"`，Linux 用 `xdg-open "<url>"`。
