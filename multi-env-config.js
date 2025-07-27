const fs = require("fs");
const path = require("path");
require("dotenv").config();

/*
 * Loads config based on guild ID using environments.json as a lookup.
 * Falls back to env vars if lookup fails.
 * @param {string} guildId 
 * @returns {Object} config object with required IDs
*/

function loadConfig(guildId) {
  try {
    const basePath = path.resolve(__dirname, "config");

    const envMap = JSON.parse(
      fs.readFileSync(path.join(basePath, "environments.json"), "utf8")
    );

    const envName = envMap[guildId];
    if (!envName) throw new Error("Guild ID not mapped to environment.");

    const envConfigPath = path.join(basePath, `${envName}.json`);
    const envConfig = JSON.parse(fs.readFileSync(envConfigPath, "utf8"));

    return envConfig;
  } catch (error) {
    console.warn("Falling back to environment variables due to:", error.message);
    return {
      applicationChannelId: process.env.APPLICATION_CHANNEL_ID,
      officerChannelId: process.env.OFFICER_CHANNEL_ID,
      applicantRoleId: process.env.APPLICANT_ROLE_ID,
      memberRoleId: process.env.MEMBER_ROLE_ID,
    };
  }
}

module.exports = { loadConfig };

