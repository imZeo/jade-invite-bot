const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Optional in-memory cache for already loaded configs
const configCache = {};

function loadConfig(guildId) {
  console.log(`🔍 Loading config for guild ID: ${guildId}`);

  if (configCache[guildId]) {
    console.log("📦 Returning cached config.");
    return configCache[guildId];
  }

  try {
    const basePath = path.resolve(__dirname, "config");
    const envMapPath = path.join(basePath, "environments.json");

    const envMap = JSON.parse(fs.readFileSync(envMapPath, "utf8"));
    const envName = envMap[guildId];

    if (!envName) throw new Error("Guild ID not mapped to environment.");

    const envConfigPath = path.join(basePath, `${envName}.json`);
    const envConfig = JSON.parse(fs.readFileSync(envConfigPath, "utf8"));

    console.log(`✅ Found environment: ${envName}`);
    console.log("🔧 Loaded config:", envConfig);

    configCache[guildId] = envConfig;
    return envConfig;
  } catch (error) {
    console.warn("⚠️ Falling back to environment variables due to:", error.message);

    const fallbackConfig = {
      applicationChannelId: process.env.APPLICATION_CHANNEL_ID,
      officerChannelId: process.env.OFFICER_CHANNEL_ID,
      applicantRoleId: process.env.APPLICANT_ROLE_ID,
      memberRoleId: process.env.MEMBER_ROLE_ID,
    };

    console.log("🔧 Fallback config:", fallbackConfig);
    return fallbackConfig;
  }
}

module.exports = { loadConfig };

