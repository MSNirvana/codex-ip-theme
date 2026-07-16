import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CdpClient, listTargets } from "./cdp.mjs";

const args = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const port = Number(valueAfter("--port", process.env.CODEX_DEBUG_PORT || "9341"));
const screenshotPath = valueAfter("--screenshot", null);
const reload = args.includes("--reload");
const deadline = Date.now() + 30_000;
let targets = [];

while (Date.now() < deadline) {
  try {
    targets = (await listTargets(port)).filter((target) =>
      target.type === "page" && target.url.startsWith("app://") && target.webSocketDebuggerUrl,
    );
    if (targets.length) break;
  } catch {}
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
}

if (!targets.length) throw new Error(`No Codex renderer found on 127.0.0.1:${port}`);
const reports = [];

for (const target of targets) {
  const client = new CdpClient(target.webSocketDebuggerUrl, port);
  await client.connect();
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  if (reload) {
    await client.send("Page.reload", { ignoreCache: true });
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1800));
  }
  const evaluation = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const box = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          width: Math.round(rect.width), height: Math.round(rect.height),
          visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
        };
      };
      const layer = document.getElementById('codex-ip-runtime-layer');
      const home = Boolean(document.querySelector('[data-testid="home-icon"]') || document.querySelector('[data-feature="game-source"]'));
      const heroFrame = document.querySelector('.ip-theme-home > div:first-child > div:first-child > div:first-child');
      const suggestionButtons = [...document.querySelectorAll('[class*="home-suggestions"] button')]
        .filter((button) => box(button)?.visible);
      const report = {
        installed: document.documentElement.dataset.codexIpTheme === 'on',
        stylePresent: Boolean(document.getElementById('codex-ip-runtime-theme')),
        layerPresent: Boolean(layer),
        layerPointerEvents: layer ? getComputedStyle(layer).pointerEvents : null,
        sidebar: box(document.querySelector('aside.app-shell-left-panel')),
        composer: box(document.querySelector('.composer-surface-chrome')),
        sidebarImage: box(document.querySelector('.ip-sidebar-character')),
        composerImage: box(document.querySelector('.ip-composer-character')),
        home,
        homeClassPresent: Boolean(document.querySelector('.ip-theme-home')),
        hero: box(heroFrame),
        heroCopy: box(document.querySelector('.ip-home-hero-copy')),
        nativeSuggestionCount: suggestionButtons.length,
        projectSelector: box(document.querySelector('[class*="project-selector"], [data-composer-navigation-target="workspace-project"]')),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
      const homePass = !home || (report.homeClassPresent && report.hero?.visible && report.hero.width >= 280 &&
        report.hero.height >= 280 && report.heroCopy?.visible && report.nativeSuggestionCount >= 2 &&
        report.nativeSuggestionCount <= 6 && report.projectSelector?.visible);
      report.pass = report.installed && report.stylePresent && report.layerPresent && homePass &&
        report.layerPointerEvents === 'none' && report.sidebar?.visible && report.composer?.visible &&
        report.sidebarImage?.visible && report.composerImage?.visible && !report.horizontalOverflow;
      return report;
    })()`,
    returnByValue: true,
  });
  const report = evaluation.result?.value || {};
  reports.push({ targetId: target.id, title: target.title, url: target.url, report });

  if (screenshotPath) {
    const capture = await client.send("Page.captureScreenshot", {
      format: "png", fromSurface: true, captureBeyondViewport: false,
    });
    await writeFile(resolve(screenshotPath), Buffer.from(capture.data, "base64"));
  }
  client.close();
}

console.log(JSON.stringify({ port, reload, reports }, null, 2));
if (reports.some((item) => !item.report.pass)) process.exitCode = 2;
