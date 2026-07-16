import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, resolve } from "node:path";
import { CdpClient, listTargets } from "./cdp.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const port = Number(valueAfter("--port", process.env.CODEX_DEBUG_PORT || "9229"));
const once = args.includes("--once");
const remove = args.includes("--remove");
const clients = new Map();

function mimeType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".webp") return "image/webp";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "image/png";
}

function dataUrl(bytes, path) {
  return `data:${mimeType(path)};base64,${bytes.toString("base64")}`;
}

function installTheme(themeCss, config, images) {
  const STYLE_ID = "codex-ip-runtime-theme";
  const LAYER_ID = "codex-ip-runtime-layer";

  if (!document.head || !document.body) {
    window.addEventListener("DOMContentLoaded", () => installTheme(themeCss, config, images), { once: true });
    return { active: false, pending: true };
  }

  globalThis.__codexIpThemeCleanup?.();
  const root = document.documentElement;
  root.dataset.codexIpTheme = "on";
  root.style.setProperty("--ip-accent", config.accent);
  root.style.setProperty("--ip-background", config.background);
  root.style.setProperty("--ip-sidebar", config.sidebar);
  root.style.setProperty("--ip-foreground", config.foreground);
  root.style.setProperty("--ip-sidebar-image-width", `${config.sidebar_image_width || 68}px`);
  root.style.setProperty("--ip-sidebar-image-opacity", String(config.sidebar_image_opacity ?? 0.28));
  root.style.setProperty("--ip-composer-image-width", `${config.composer_image_width || 88}px`);
  root.style.setProperty("--ip-composer-image-opacity", String(config.composer_image_opacity ?? 0.96));
  root.style.setProperty("--ip-hero-image", `url(${JSON.stringify(images.hero)})`);
  root.style.setProperty("--ip-hero-position", config.hero_position || "center");
  root.style.setProperty("--ip-task-wallpaper-opacity", String(config.task_wallpaper_opacity ?? 0.14));

  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = themeCss;

  let layer = document.getElementById(LAYER_ID);
  if (!layer) {
    layer = document.createElement("div");
    layer.id = LAYER_ID;
    document.body.appendChild(layer);
  }
  layer.innerHTML = `<div class="ip-mode-badge"></div><div class="ip-system-note"></div>`;
  layer.querySelector(".ip-mode-badge").textContent = config.badge_text || `${config.name || "IP"} 模式`;
  layer.querySelector(".ip-system-note").textContent = config.status_text || "SYSTEM ONLINE · THINK · BUILD · SHIP";

  const decorate = () => {
    const aside = document.querySelector("aside.app-shell-left-panel");
    if (aside) {
      root.style.setProperty("--ip-sidebar-width", `${aside.getBoundingClientRect().width}px`);
      if (!aside.querySelector(".ip-sidebar-character")) {
        const image = document.createElement("img");
        image.className = "ip-sidebar-character";
        image.src = images.sidebar;
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        aside.appendChild(image);
      }
    } else {
      root.style.setProperty("--ip-sidebar-width", "0px");
    }

    const composer = document.querySelector(".composer-surface-chrome");
    if (composer && !composer.querySelector(".ip-composer-character")) {
      const image = document.createElement("img");
      image.className = "ip-composer-character";
      image.src = images.composer;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      composer.appendChild(image);
    }

    const homeMarker = document.querySelector('[data-testid="home-icon"]') || document.querySelector('[data-feature="game-source"]');
    const homeMain = homeMarker?.closest('[role="main"]') || null;
    const shell = document.querySelector("main.main-surface");
    document.querySelectorAll(".ip-theme-home").forEach((element) => {
      if (element !== homeMain) element.classList.remove("ip-theme-home");
    });
    document.querySelectorAll(".ip-theme-home-shell, .ip-theme-task-shell").forEach((element) => {
      if (element !== shell) element.classList.remove("ip-theme-home-shell", "ip-theme-task-shell");
    });
    if (shell) {
      shell.classList.toggle("ip-theme-home-shell", Boolean(homeMain));
      shell.classList.toggle("ip-theme-task-shell", !homeMain);
    }
    if (homeMain) {
      homeMain.classList.add("ip-theme-home");
      const heroFrame = homeMain.querySelector(':scope > div:first-child > div:first-child > div:first-child');
      if (heroFrame && !heroFrame.querySelector(":scope > .ip-home-hero-copy")) {
        const copy = document.createElement("div");
        copy.className = "ip-home-hero-copy";
        copy.setAttribute("aria-hidden", "true");
        const eyebrow = document.createElement("div");
        eyebrow.className = "ip-home-eyebrow";
        eyebrow.textContent = config.brand_subtitle || "CODEX IP THEME · GGOO LAB";
        const title = document.createElement("div");
        title.className = "ip-home-title";
        title.textContent = config.hero_title || "我们该构建什么？";
        const subtitle = document.createElement("div");
        subtitle.className = "ip-home-subtitle";
        subtitle.textContent = config.hero_subtitle || "把复杂问题拆开，用代码重新连接。";
        const signal = document.createElement("div");
        signal.className = "ip-home-signal";
        signal.textContent = config.hero_signal || "∞ LASER EYES ONLINE";
        copy.append(eyebrow, title, subtitle, signal);
        heroFrame.appendChild(copy);
      }
    }
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true });
  const resizeObserver = new ResizeObserver(schedule);
  const aside = document.querySelector("aside.app-shell-left-panel");
  if (aside) resizeObserver.observe(aside);

  const toggle = (event) => {
    if (!(event.metaKey || event.ctrlKey) || !event.shiftKey || event.code !== "KeyL") return;
    root.dataset.codexIpTheme = root.dataset.codexIpTheme === "off" ? "on" : "off";
  };
  window.addEventListener("keydown", toggle, true);
  const safetyTimer = window.setInterval(schedule, 1200);
  decorate();

  globalThis.__codexIpThemeCleanup = () => {
    observer.disconnect();
    resizeObserver.disconnect();
    window.clearInterval(safetyTimer);
    window.removeEventListener("keydown", toggle, true);
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(LAYER_ID)?.remove();
    document.querySelectorAll(".ip-sidebar-character, .ip-composer-character, .ip-home-hero-copy").forEach((element) => element.remove());
    document.querySelectorAll(".ip-theme-home").forEach((element) => element.classList.remove("ip-theme-home"));
    document.querySelectorAll(".ip-theme-home-shell, .ip-theme-task-shell").forEach((element) => element.classList.remove("ip-theme-home-shell", "ip-theme-task-shell"));
    delete root.dataset.codexIpTheme;
    for (const name of [
      "--ip-accent", "--ip-background", "--ip-sidebar", "--ip-foreground",
      "--ip-sidebar-width", "--ip-sidebar-image-width", "--ip-sidebar-image-opacity",
      "--ip-composer-image-width", "--ip-composer-image-opacity",
      "--ip-hero-image", "--ip-hero-position", "--ip-task-wallpaper-opacity",
    ]) root.style.removeProperty(name);
    delete globalThis.__codexIpThemeCleanup;
  };

  return {
    active: true,
    name: config.name,
    aside: Boolean(document.querySelector("aside.app-shell-left-panel")),
    composer: Boolean(document.querySelector(".composer-surface-chrome")),
  };
}

function removeTheme() {
  globalThis.__codexIpThemeCleanup?.();
  document.getElementById("codex-ip-runtime-theme")?.remove();
  document.getElementById("codex-ip-runtime-layer")?.remove();
  document.querySelectorAll(".ip-sidebar-character, .ip-composer-character, .ip-home-hero-copy").forEach((element) => element.remove());
  document.querySelectorAll(".ip-theme-home").forEach((element) => element.classList.remove("ip-theme-home"));
  document.querySelectorAll(".ip-theme-home-shell, .ip-theme-task-shell").forEach((element) => element.classList.remove("ip-theme-home-shell", "ip-theme-task-shell"));
  delete document.documentElement.dataset.codexIpTheme;
  return { active: false };
}

async function loadPayload() {
  const configPath = join(projectRoot, "theme/config.json");
  const cssPath = join(projectRoot, "theme/theme.css");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  if (config.schemaVersion !== 1 || typeof config.name !== "string" || !config.name.trim()) {
    throw new Error("theme/config.json has an unsupported schema or empty name");
  }
  const colorPattern = /^#[0-9a-f]{6}$/i;
  for (const key of ["accent", "background", "sidebar", "foreground"]) {
    if (!colorPattern.test(config[key] || "")) throw new Error(`Invalid six-digit hex color: ${key}`);
  }
  for (const key of ["sidebar_image", "composer_image", "hero_image"]) {
    if (typeof config[key] !== "string" || !/^assets\/[A-Za-z0-9._-]+$/.test(config[key])) {
      throw new Error(`Theme image must stay inside assets/: ${key}`);
    }
  }
  const sidebarPath = join(projectRoot, config.sidebar_image);
  const composerPath = join(projectRoot, config.composer_image);
  const heroPath = join(projectRoot, config.hero_image);
  const [css, sidebar, composer, hero] = await Promise.all([
    readFile(cssPath, "utf8"),
    readFile(sidebarPath),
    readFile(composerPath),
    readFile(heroPath),
  ]);
  const maxImageBytes = 16 * 1024 * 1024;
  if (!sidebar.length || sidebar.length > maxImageBytes || !composer.length || composer.length > maxImageBytes || !hero.length || hero.length > maxImageBytes) {
    throw new Error("Theme images must be non-empty and no larger than 16 MB each");
  }
  const images = { sidebar: dataUrl(sidebar, sidebarPath), composer: dataUrl(composer, composerPath), hero: dataUrl(hero, heroPath) };
  const digest = createHash("sha256")
    .update(css).update(JSON.stringify(config)).update(sidebar).update(composer).update(hero).digest("hex");
  return {
    digest,
    expression: `(${installTheme.toString()})(${JSON.stringify(css)}, ${JSON.stringify(config)}, ${JSON.stringify(images)})`,
    config,
  };
}

async function configureClient(client, payload) {
  await client.send("Page.enable");
  if (client.scriptIdentifier) {
    await client.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: client.scriptIdentifier }).catch(() => {});
  }
  const registration = await client.send("Page.addScriptToEvaluateOnNewDocument", { source: payload.expression });
  client.scriptIdentifier = registration.identifier;
}

async function evaluateClient(client, expression) {
  const evaluation = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return evaluation.result?.value || {};
}

async function connectTarget(target, payload) {
  if (clients.has(target.id)) return false;
  const client = new CdpClient(target.webSocketDebuggerUrl, port);
  await client.connect();
  await client.send("Runtime.enable");
  const probe = await evaluateClient(client, `(() => {
    const shell = Boolean(document.querySelector('main.main-surface'));
    const sidebar = Boolean(document.querySelector('aside.app-shell-left-panel'));
    const composer = Boolean(document.querySelector('.composer-surface-chrome'));
    return { shell, sidebar, composer, codex: shell && sidebar && composer };
  })()`);
  if (!probe.codex) {
    client.close();
    throw new Error(`Rejected app:// target without expected Codex shell markers: ${target.id}`);
  }
  clients.set(target.id, client);
  if (!remove) await configureClient(client, payload);
  const status = await evaluateClient(client, remove ? `(${removeTheme.toString()})()` : payload.expression);
  console.log(remove
    ? `[removed] ${target.title || target.id}`
    : `[injected] ${status.name || target.title || target.id} (sidebar=${status.aside}, composer=${status.composer})`);
  return true;
}

async function scan(payload) {
  const targets = (await listTargets(port)).filter((target) =>
    target.type === "page" && target.url.startsWith("app://") && target.webSocketDebuggerUrl,
  );
  const activeIds = new Set(targets.map((target) => target.id));
  for (const [id, client] of clients) {
    if (!activeIds.has(id)) {
      client.close();
      clients.delete(id);
    }
  }
  await Promise.all(targets.map((target) => connectTarget(target, payload)));
  return targets.length;
}

async function waitForRenderer(payload, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const count = await scan(payload);
      if (count > 0) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
  }
  if (lastError) throw lastError;
  throw new Error("Timed out waiting for the Codex renderer page");
}

try {
  let payload = await loadPayload();
  await waitForRenderer(payload);
  if (once || remove) {
    for (const client of clients.values()) client.close();
  } else {
    console.log("主题正在运行。修改 config、CSS 或图片后会自动更新；按 Command/Ctrl+Shift+L 临时切换。");
    setInterval(async () => {
      try {
        const nextPayload = await loadPayload();
        if (nextPayload.digest !== payload.digest) {
          payload = nextPayload;
          for (const client of clients.values()) {
            await configureClient(client, payload);
            await evaluateClient(client, payload.expression);
          }
          console.log(`[updated] ${payload.config.name}`);
        }
        await scan(payload);
      } catch (error) {
        console.error(`[watch] ${error.message}`);
      }
    }, 1500);
  }
} catch (error) {
  console.error(`注入失败：${error.message}`);
  console.error(`请确认 Codex 已使用 --remote-debugging-port=${port} 启动。`);
  process.exitCode = 1;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    for (const client of clients.values()) client.close();
    process.exit(0);
  });
}
