# AGENTS.md — dsh-involute（@deepseek-ai/dsh-track）仓库速记

本仓库是 Track Bridge 任务管理插件。**GitHub 仓库仍叫 `dsh-external/dsh-track`，本地目录名是 `dsh-involute`（曾用名 dsh-track），两者是同一个仓库**。

- **身份**：bundle 插件（package.json name = `@deepseek-ai/dsh-track`），`cordis.patch.yml` 挂 track 引擎；安装：`dsh plugin --profile web add github:dsh-external/dsh-track`
- **技能**：`skills/dsh-track`（fat skill，安装时复制到 `~/.dsh/skills/dsh-track`，skill-local 默认根扫描）
- **源码布局**：src/（capture 捕获 / lifecycle 生命周期 / sync 同步 / eval 评估 / store / types）、tests/（vitest，含 golden/fixtures）
- **构建**：`scripts/dsh-env.mjs` 走 DSH 工具链（不能裸 tsc）；`scripts/prepack-cordis-rewrite.mjs` 打包前改写
- **AB 快照扩展**：本仓库是 ab-config.json 的 extension（`dsh-track`，repo 指向本目录）。**新增 `@deepseek-ai/*` 依赖必须三处同改**：tsconfig paths、vitest alias、ab-config relink（全局 L7；漏一处生产即 `ERR_MODULE_NOT_FOUND`）
- **发布**：推到 GitHub（dsh-external/dsh-track）即分发；README 中英双语（L6）
- **提交**：全局 L4（branch → push → PR → squash merge）；开发 worktree 在 `.worktrees/<name>`（L5）
