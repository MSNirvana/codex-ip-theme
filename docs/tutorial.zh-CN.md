# Codex IP Theme 中文操作教程

## 1. 安装

推荐直接让 Codex 安装：

```text
请从 https://github.com/MSNirvana/codex-ip-theme 安装这个 Skill。
```

也可以把仓库克隆到个人 Skill 目录：

```bash
git clone https://github.com/MSNirvana/codex-ip-theme.git ~/.codex/skills/codex-ip-theme
```

Windows PowerShell：

```powershell
git clone https://github.com/MSNirvana/codex-ip-theme.git "$HOME\.codex\skills\codex-ip-theme"
```

安装后重启 Codex 或新建任务。

## 2. 准备图片

支持 PNG、JPEG 和 WebP。推荐：

- 角色轮廓清楚，四周保留少量背景。
- 白底、灰底或近似纯色背景最适合自动抠图。
- 联系表/设定图可以使用，但需要让 Codex 选择并裁切具体动作。
- 坐着工作、使用电脑的动作适合输入框；站立动作适合侧栏。
- 另有横版场景图时，把它作为 Hero。推荐 16:9 或接近 16:9，并在一侧保留可放标题的安静区域。

不要公开上传没有使用授权的肖像、Logo 或商业角色。

## 3. 生成主题

上传图片后输入：

```text
使用 $codex-ip-theme。第一张是角色图，请自动抠白底；第二张横版图作为首页 Hero，保留完整背景。制作成 Mac 和 Windows 都能使用的旗舰主题，主题名叫“我的 IP”，强调色使用 #ff2823。
```

未指定的选项会使用默认值：

- 主背景：`#fcfcfa`
- 侧栏：`#f0f0ed`
- 前景文字：`#111111`
- 图片位置：侧栏和输入框两处
- 首页：原生建议卡 + 横版 Hero；没有场景图时复用透明角色
- 抠图：边缘连通背景移除

生成完成后先查看 `ip-transparency-preview.png`。棋盘格代表透明区域。

## 4. 启动主题

### macOS

1. 保存任务。
2. 使用 `Command+Q` 完全退出 Codex。
3. 双击生成项目里的 `启动主题.command`。
4. 保持终端窗口运行。
5. 看到 `[injected]` 后主题已经生效。

启动器会验证：

- 应用标识为 `com.openai.codex`。
- Codex 应用签名有效。
- 使用 Codex 自带并签名的 Node.js。
- CDP 端口只监听本机回环地址。

### Windows

1. 保存任务并完全退出 Codex。
2. 双击 `启动主题.cmd`。
3. 保持命令窗口运行。
4. 脚本会优先使用普通安装路径；如果没有找到，会通过 `Get-AppxPackage OpenAI.Codex` 定位 Store 版。

如果仍然无法找到，可以设置：

```powershell
$env:CODEX_APP="C:\完整路径\ChatGPT.exe"
```

## 5. 验证与截图

运行：

- macOS：`验证主题.command`
- Windows：`验证主题.cmd`

验证内容包括：

- 主题样式和装饰层存在。
- 侧栏、输入框和两张角色图可见。
- 首页 Hero、2–6 张原生建议卡和真实项目选择器可见。
- 装饰层不会拦截鼠标。
- 页面没有横向溢出。

验证成功后会生成 `theme-verification.png`。

## 6. 动态更换图片

上传新图片并告诉 Codex 要替换的位置：

```text
使用 $codex-ip-theme，把这个主题的侧栏角色替换成新上传的图片，保留其他配色。
```

也可以由 Codex 运行：

```bash
<python> <skill-dir>/scripts/update_theme_image.py \
  --project <主题项目目录> \
  --image <新图片> \
  --placement sidebar
```

`--placement` 可选 `sidebar`、`composer`、`both`、`hero` 或 `all`。Hero 会保留完整矩形背景，角色位置才执行抠图。注入器运行时会自动检测并更新。

## 7. 调整抠图

- 白色身体被擦掉：确认使用 `edge`，降低 `--tolerance`。
- 白边明显：逐步提高 `--tolerance`，每次增加 5–10。
- 边缘太软：降低 `--feather`。
- 角色被裁断：重新选择裁切范围，并在四周保留 3%–8% 空间。
- 复杂摄影背景：不要强行提高容差，应使用本地 AI 分割或图片编辑工具。

## 8. 调整配色和尺寸

编辑生成项目的 `theme/config.json`：

- `accent`：强调色
- `background`：主背景
- `sidebar`：侧栏背景
- `foreground`：文字和边框
- `sidebar_image_width` / `composer_image_width`：角色宽度
- `sidebar_image_opacity` / `composer_image_opacity`：透明度
- `hero_title` / `hero_subtitle`：首页标题和副标题
- `brand_subtitle` / `status_text` / `hero_signal`：品牌与系统文案
- `hero_position`：Hero 对齐位置
- `task_wallpaper_opacity`：任务页壁纸透明度，建议 `0.08`–`0.18`

编辑 `theme/theme.css` 可以继续改变圆角、阴影、网格、输入框和侧栏样式。文件保存后会自动重新注入。

## 9. 临时关闭和移除

- `Command/Ctrl + Shift + L`：临时开关主题。
- `移除主题.command` / `移除主题.cmd`：从当前页面移除。
- 正常启动 Codex：不会加载主题。

主题不会修改 `app.asar`，因此不需要修复官方安装包。

## 10. 常见问题

### 启动后还是原版界面

确认启动窗口中出现 `[injected]`。如果 Codex 原本已经运行且没有调试端口，需要完全退出后重新通过主题启动器运行。

### 是否和第三方 API 有关

无关。主题只修改本地桌面渲染层，不读取或更改 API Key、Base URL、模型名称或供应商配置。

### 更新 Codex 后失效

重新运行启动器。如果 Codex 页面结构发生较大变化，可能需要更新 Skill 中的选择器。
