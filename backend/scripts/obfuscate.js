/**
 * Build-time code obfuscation for production deployment.
 * Obfuscates the compiled backend bundle (and, separately, the
 * React production builds via their own CI obfuscation step) so
 * that source logic, API secrets handling, and business rules
 * cannot be trivially read or manipulated by anyone with access
 * to the deployed artifact.
 *
 * Usage: npm run obfuscate  (run AFTER `npm run build` in CI/CD,
 * never run against the editable source during development).
 */
const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const SRC_DIR = path.join(__dirname, "../src");
const OUT_DIR = path.join(__dirname, "../dist");

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: true,
  disableConsoleOutput: true,
  identifierNamesGenerator: "hexadecimal",
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ["rc4"],
  stringArrayThreshold: 1,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

const walk = (dir, cb) => {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) return walk(full, cb);
    if (full.endsWith(".js")) cb(full);
  });
};

const run = () => {
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  walk(SRC_DIR, (filePath) => {
    const relative = path.relative(SRC_DIR, filePath);
    const outPath = path.join(OUT_DIR, relative);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const code = fs.readFileSync(filePath, "utf-8");
    const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
    fs.writeFileSync(outPath, obfuscated);
    console.log(`Obfuscated: ${relative}`);
  });

  console.log("\nBuild complete → ./dist (deploy this directory, never the raw /src in production).");
};

run();
