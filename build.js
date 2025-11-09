// build.js
import { build } from "esbuild";
import fs from "fs";
import archiver from "archiver";
import path from "path";

const color = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

// cli flag for watch mode
const args = process.argv.slice(2);
const WATCH = args.includes("--watch") || process.env.WATCH === "1";

// read plugin.json ~ fallbacks if missing
const pluginJson = JSON.parse(fs.readFileSync("plugin.json", "utf-8"));
const version = pluginJson.version || "1.0.0";
const zipName = `liveserver-v${version}.zip`;

let isBuilding = false;
let debounceTimer;

async function bundle() {
  if (isBuilding) return;
  isBuilding = true;

  console.log(`${color.cyan}Building...${color.reset}`);

  try {
    // 🔹 Build main bundle
    await build({
      entryPoints: ["src/main.js"],
      bundle: true,
      outfile: "dist/main.js",
      format: "iife",
      minify: false,
      sourcemap: false,
    });

    console.log(`${color.green}✅ esbuild bundle done → dist/main.js${color.reset}`);

    // 🔹 Remove old zip if exists
    if (fs.existsSync(zipName)) fs.unlinkSync(zipName);

    const output = fs.createWriteStream(zipName);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);

    // 🔹 Core plugin files
    archive.file("dist/main.js", { name: "main.js" });
    if (fs.existsSync("plugin.json")) archive.file("plugin.json", { name: "plugin.json" });
    if (fs.existsSync("icon.png")) archive.file("icon.png", { name: "icon.png" });

    // 🔹 Optional MD / extra files
    const extras = [];

    if (pluginJson.readme && fs.existsSync(pluginJson.readme)) {
      extras.push(pluginJson.readme);
    }
    if (pluginJson.changelogs && fs.existsSync(pluginJson.changelogs)) {
      extras.push(pluginJson.changelogs);
    }
    if (pluginJson.license && fs.existsSync(pluginJson.license)) {
      extras.push(pluginJson.license);
    }

    // 🔹 User custom files array
    if (Array.isArray(pluginJson.files)) {
      for (const f of pluginJson.files) {
        if (fs.existsSync(f)) extras.push(f);
      }
    }

    // Add all extra files to archive
    for (const file of extras) {
      const base = path.basename(file);
      archive.file(file, { name: base });
      console.log(`${color.dim}  ↳ included: ${base}${color.reset}`);
    }

    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("end", resolve);
      output.on("error", reject);
      archive.on("error", reject);
      archive.finalize().catch(reject);
    });

    const sizeKB = (fs.statSync(zipName).size / 1024).toFixed(1);
    console.log(
      `📦 ${color.yellow}${color.underline}${color.bold}${zipName}${color.reset} created ${color.yellow}${color.bold}(${sizeKB} KB)${color.reset}\n`
    );
  } catch (err) {
    console.error(`${color.magenta}❌ Build failed: ${err.message}${color.reset}`);
  } finally {
    isBuilding = false;
  }
}

(async () => {
  await bundle();

  if (WATCH) {
    console.log(`${color.dim}  Watching for file changes in src/...${color.reset}`);

    fs.watch("src", { recursive: false }, (event, filename) => {
      if (!filename) return;
      if (!/\.(js|css|json|md)$/i.test(filename)) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log(`${color.bold}Detected change in ${filename}${color.reset}`);
        await bundle();
      }, 600);
    });
  } else {
    process.exit(0);
  }
})();
