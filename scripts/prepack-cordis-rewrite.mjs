#!/usr/bin/env node
/**
 * prepack-cordis-rewrite.mjs — 微型复刻官方发布管线：把构建产物里的裸 `cordis`
 * 类型引用改写为 npm 生态真名 `@deepseek-ai/cordis`。
 *
 * 背景（官方策略，2026-08-11 确认）：
 *   - 官方源码（vendor/cordis fork）用裸 `cordis`：DSH 槽的类型扩展挂
 *     `declare module 'cordis'`，生态插件源码必须 import 裸名才能吃到扩展。
 *   - 官方 npm 发布管线把整个 workspace 的 `cordis` 改写为 `@deepseek-ai/cordis`
 *     （发布产物 .d.ts 即 `declare module '@deepseek-ai/cordis'`，peer 也是真名）。
 *   - dsh-track 独立发布（npm pack），没有官方管线，因此在本脚本内复刻改写：
 *     仅处理 lib/types/**\/*.d.ts 里的 `from 'cordis'` → `from '@deepseek-ai/cordis'`。
 *     运行时（lib/*.js）零 cordis 引用（全是 import type，编译后被擦除），无需改写。
 *
 * 幂等：重复执行安全（已经改写过的不会再改）。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const TYPES_DIR = join(ROOT, 'lib', 'types')

/** 递归收集 .d.ts */
function collectDts(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectDts(full))
    else if (entry.name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

let changed = 0
let scanned = 0
for (const file of collectDts(TYPES_DIR)) {
  const before = readFileSync(file, 'utf8')
  // 只改写 import 语句里的裸 cordis 模块说明符；declare module 'cordis' 与
  // 其它文本引用（注释/文档）保持原样，避免误伤。
  const after = before.replace(
    /(\bfrom\s+['"])cordis(['"])/g,
    "$1@deepseek-ai/cordis$2",
  )
  if (after !== before) {
    writeFileSync(file, after)
    changed++
    console.log(`  rewrite: ${relative(ROOT, file)}`)
  }
  scanned++
}

console.log(`prepack-cordis-rewrite: scanned ${scanned} .d.ts, rewrote ${changed}`)
if (changed === 0 && scanned === 0) {
  console.warn('  (no lib/types found — run build first)')
  process.exit(1)
}
