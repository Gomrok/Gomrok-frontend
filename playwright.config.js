import { defineConfig } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const appRoot = path.dirname(fileURLToPath(import.meta.url));
const parent = path.dirname(appRoot);
const workspace = process.env.GOMROK_WORKSPACE_ROOT || (existsSync(path.join(parent, ".codex-work")) ? parent : appRoot);
if (process.platform === "win32" && /^c:/i.test(workspace)) throw new Error("Set GOMROK_WORKSPACE_ROOT to a project directory outside C:.");
const work = path.join(workspace, ".codex-work");
const tmp = path.join(work, "tmp");
mkdirSync(tmp, { recursive: true });
for (const key of ["TEMP", "TMP", "TMPDIR"]) process.env[key] = tmp;
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(work, "cache", "playwright-browsers");
const chrome = process.env.GOMROK_CHROME_PATH || ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].find(existsSync);
const port = Number(process.env.GOMROK_PORT || 5083);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid GOMROK_PORT.");
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests/e2e", timeout: 60_000, expect: { timeout: 12_000 }, workers: 2, retries: 0,
  outputDir: path.join(work, "qa", "test-results"),
  reporter: [["list"], ["json", { outputFile: path.join(work, "qa", "results.json") }], ["html", { outputFolder: path.join(work, "qa", "report"), open: "never" }]],
  use: { baseURL, viewport: { width: 1440, height: 1000 }, headless: true, screenshot: "only-on-failure", trace: "retain-on-failure", launchOptions: { ...(chrome ? { executablePath: chrome } : {}), args: [`--disk-cache-dir=${path.join(work, "cache", "chrome-tests")}`, `--crash-dumps-dir=${path.join(work, "tmp", "chrome-crashes")}`, "--disable-background-networking", "--disable-component-update"] } },
  webServer: { command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`, url: baseURL, reuseExistingServer: true, timeout: 30_000 },
});
