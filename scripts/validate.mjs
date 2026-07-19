#!/usr/bin/env node
// Consistency checks for marketplace and plugin manifests. Run from anywhere:
//   node scripts/validate.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(relPath) {
  const abs = join(root, relPath);
  if (!existsSync(abs)) {
    fail(`${relPath}: file not found`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    fail(`${relPath}: invalid JSON (${e.message})`);
    return null;
  }
}

const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const codexMarketplace = readJson(".agents/plugins/marketplace.json");

if (claudeMarketplace && codexMarketplace) {
  if (claudeMarketplace.name !== codexMarketplace.name) {
    fail(
      `marketplace name mismatch: claude=${claudeMarketplace.name} codex=${codexMarketplace.name}`,
    );
  }

  const claudeNames = (claudeMarketplace.plugins ?? []).map((p) => p.name).sort();
  const codexNames = (codexMarketplace.plugins ?? []).map((p) => p.name).sort();
  if (JSON.stringify(claudeNames) !== JSON.stringify(codexNames)) {
    fail(
      `marketplaces list different plugins: claude=[${claudeNames}] codex=[${codexNames}]`,
    );
  }

  for (const entry of claudeMarketplace.plugins ?? []) {
    const source = entry.source;
    if (typeof source !== "string" || !source.startsWith("./")) {
      fail(`${entry.name}: claude marketplace source must be a ./ relative path`);
      continue;
    }
    validatePlugin(entry, source.slice(2));
  }

  for (const entry of codexMarketplace.plugins ?? []) {
    const path = entry.source?.path;
    if (entry.source?.source !== "local" || typeof path !== "string") {
      fail(`${entry.name}: codex marketplace source must be {source: "local", path}`);
    } else if (!existsSync(join(root, path))) {
      fail(`${entry.name}: codex marketplace path ${path} does not exist`);
    }
  }
}

function validatePlugin(entry, dir) {
  const name = entry.name;
  if (!existsSync(join(root, dir))) {
    fail(`${name}: plugin directory ${dir} does not exist`);
    return;
  }

  const claude = readJson(`${dir}/.claude-plugin/plugin.json`);
  const codex = readJson(`${dir}/.codex-plugin/plugin.json`);
  if (!claude || !codex) return;

  for (const [label, manifest] of [["claude", claude], ["codex", codex]]) {
    if (manifest.name !== name) {
      fail(`${name}: ${label} plugin.json name is ${manifest.name}`);
    }
  }

  const codexBaseVersion = String(codex.version ?? "").split("+")[0];
  if (claude.version !== codexBaseVersion) {
    fail(
      `${name}: version mismatch claude=${claude.version} codex=${codex.version}`,
    );
  }
  if (entry.version && entry.version !== claude.version) {
    fail(
      `${name}: marketplace entry version ${entry.version} != plugin.json ${claude.version}`,
    );
  }

  for (const [field, fallback] of [
    ["skills", "skills"],
    ["apps", null],
    ["mcpServers", ".mcp.json"],
  ]) {
    const ref = codex[field] ?? fallback;
    if (ref && !existsSync(join(root, dir, ref))) {
      fail(`${name}: codex plugin.json ${field} path ${ref} does not exist`);
    }
  }

  const skillsDir = join(root, dir, codex.skills ?? "skills");
  if (existsSync(skillsDir)) {
    const skillFiles = readdirSync(skillsDir, { recursive: true }).filter((f) =>
      String(f).endsWith("SKILL.md"),
    );
    if (skillFiles.length === 0) {
      fail(`${name}: skills directory has no SKILL.md`);
    }
  }

  const mcp = readJson(`${dir}/${codex.mcpServers ?? ".mcp.json"}`);
  if (mcp) {
    const servers = Object.entries(mcp.mcpServers ?? {});
    if (servers.length === 0) {
      fail(`${name}: .mcp.json declares no mcpServers`);
    }
    for (const [server, config] of servers) {
      if (!String(config.url ?? "").startsWith("https://")) {
        fail(`${name}: mcp server ${server} url must be https`);
      }
    }
  }
}

const envFiles = readdirSync(root, { recursive: true }).filter((f) => {
  const path = String(f);
  return !path.includes(".git/") && /(^|\/)\.env(\.|$)/.test(path);
});
for (const f of envFiles) {
  fail(`${f}: .env files must never be committed to this public repository`);
}

if (errors.length > 0) {
  console.error(`validate: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("validate: OK");
