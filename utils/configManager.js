import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readEnvMap() {
    const raw = fs.readFileSync(
        path.join(__dirname, "../config/environments.json"),
        "utf-8"
    );
    return JSON.parse(raw);
}

export function getConfigForGuild(guildId) {
    const envMap = readEnvMap();
    const env = envMap[guildId];

    if (!env) {
        console.warn(`⚠️ No config mapped for guild ID: ${guildId}`);
        return {};
    }

    const configPath = path.join(__dirname, `../config/${env}.json`);
    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.error(`❌ Failed to load config for ${env}:`, err);
        return {};
    }
}
