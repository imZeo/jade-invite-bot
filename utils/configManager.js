const fs = require("fs");
const path = require("path");

function readConfig() {
  const env = process.env.NODE_ENV || "local";
  const configPath = path.join(__dirname, `../config/${env}.json`);

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Failed to load config for ${env}:`, err);
    return {};
  }
}

module.exports = { readConfig };

