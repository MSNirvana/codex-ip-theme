# Codex IP Theme

简体中文 · [English](README.md)

把用户上传的 IP、角色、吉祥物、Logo 或品牌图片，制作成 macOS 和 Windows 都能使用的 Codex 桌面端运行时主题。

Codex IP Theme 可以自动处理简单白底/纯色背景、生成透明 PNG、把横版场景图变成完整首页 Hero、重排原生建议卡片，并创建跨平台启动器。它通过仅监听本机回环地址的 CDP 注入主题，**不会**修改 `app.asar`、官方应用包、代码签名、登录状态、API Key 或模型供应商配置。

> 社区项目，不是 OpenAI 官方产品。

## 功能

- 一个 Skill 同时生成 macOS 和 Windows 主题。
- 只上传一张图片即可使用，颜色和位置均为可选项。
- 可额外上传一张横版主题图，生成旗舰级首页 Hero；不上传时会复用透明角色图。
- 保留真实的原生建议按钮、项目选择器、输入框、侧栏和导航交互，不使用假界面截图。
- 任务页自动使用低透明度同主题壁纸，兼顾品牌感和正文可读性。
- 边缘连通白底抠图，可保留黑色轮廓内部的白色身体区域。
- 侧栏和输入框可以使用不同角色动作。
- 图片、CSS 和配置文件实时热更新。
- 注入前识别真实 Codex 侧栏、主区域和输入框。
- 限制回环 WebSocket，并校验图片路径、大小和颜色配置。
- macOS 校验官方应用及其自带 Node.js 的代码签名。
- Windows 使用 `Get-AppxPackage OpenAI.Codex` 动态发现 Store 版。
- 自动生成验证、截图、reload、临时开关和移除入口。

## 安装 Skill

直接对 Codex 说：

```text
请从 https://github.com/MSNirvana/codex-ip-theme 安装这个 Skill。
```

也可以手动安装。

macOS/Linux：

```bash
git clone https://github.com/MSNirvana/codex-ip-theme.git ~/.codex/skills/codex-ip-theme
```

Windows PowerShell：

```powershell
git clone https://github.com/MSNirvana/codex-ip-theme.git "$HOME\.codex\skills\codex-ip-theme"
```

安装后重新打开 Codex，或者新建一个任务。

## 快速使用

上传图片后输入：

```text
使用 $codex-ip-theme，把我上传的 IP 图片制作成 Mac 和 Windows 都能使用的 Codex 主题，并自动抠掉白底。
```

必填内容只有角色图片。可选内容包括横版 Hero 场景图、首页标题/副标题、主题名称、强调色、背景色、侧栏色、文字色、裁切范围、角色位置和输出目录。

推荐的旗舰版提示词：

```text
使用 $codex-ip-theme。第一张图是角色设定，请自动选择并抠出一个完整动作；第二张横版图作为首页 Hero，保留它的背景。生成 Mac 和 Windows 都能使用的旗舰主题，并验证首页原生卡片、项目选择器、输入框和任务页可读性。
```

Skill 会生成一个独立主题项目。完全退出 Codex 后运行：

- macOS：双击 `启动主题.command`。
- Windows：双击 `启动主题.cmd`。
- 临时开关主题：`Command/Ctrl + Shift + L`。
- 验证和截图：双击 `验证主题.command` 或 `验证主题.cmd`。
- 移除主题：双击 `移除主题.command` 或 `移除主题.cmd`。

## 动态换图

上传新图片后可以说：

```text
使用 $codex-ip-theme，把我已经生成的主题中首页 Hero 替换为这张横版图片，保留完整背景。
```

可替换 `sidebar`、`composer`、`both`、`hero` 或 `all`。注入器运行时会监听三类图片、`theme/config.json` 和 `theme/theme.css`。文件变化后约两秒内重新应用，无需修改或重新打包 Codex。

## 文档

- [中文完整操作教程](docs/tutorial.zh-CN.md)
- [English tutorial](docs/tutorial.en.md)
- [安全说明](SECURITY.md)
- [参与贡献](CONTRIBUTING.md)

## 要求和限制

- macOS 需要 bundle identifier 为 `com.openai.codex` 的官方 Codex/ChatGPT 桌面端；Windows 需要 OpenAI Codex 桌面安装包或 Store 版。
- 图片处理依赖 Python、Pillow 和 NumPy，Codex 桌面端工作区运行时通常已经提供。
- 默认抠图适合白色、灰色或其他近似纯色背景。复杂摄影背景需要额外的本地分割或图片编辑能力。
- Codex 大版本更新后，可能需要维护页面选择器。
- Windows 脚本已生成并完成静态检查，但仍应在具体 Windows 环境实机验证。

## 安全

调试端口只绑定 `127.0.0.1`。CDP 开启期间具有较高的本机控制能力，只应在可信设备上使用，绝对不要把监听地址改为 `0.0.0.0`。详见 [SECURITY.md](SECURITY.md)。

## 许可证与致谢

代码使用 [MIT License](LICENSE)。用户上传的图片仍归原权利人所有，本仓库不包含用户个人 IP 素材。

运行时架构参考并对标了 MIT 许可的 [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)，详见 [NOTICE.md](NOTICE.md)。
