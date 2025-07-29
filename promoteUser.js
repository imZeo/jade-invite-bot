const { EmbedBuilder } = require("discord.js");
const messages = require("./messages/userMessages");
const { loadConfig } = require("./multi-env-config");

async function promoteUser(interaction) {
  const userId = interaction.customId.split("_")[1];
  const guild = interaction.guild;
  const user = await guild.members.fetch(userId);

  const config = loadConfig(guild.id);

  await user.roles.remove(config.applicantRoleId);
  await user.roles.add(config.memberRoleId);

  const embedFields = interaction.message.embeds[0]?.fields || [];
  const ignField = embedFields.find((f) => f.name.toLowerCase() === "ign");
  const resolvedIGN = ignField?.value || "UNKNOWN";

  const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;
  const promotedBy = interaction.user.tag;

  try {
    await interaction.user.send(messages.officerConfirm(user.user.tag));
  } catch (err) {
    console.warn(`❌ Couldn't DM user ${user.user.tag}`);
  }

  try {
    await user.send(`🎉 Congratulations ${user.user.tag}! You've been promoted to member status!`);
  } catch (err) {
    console.warn(`❌ Couldn't DM user ${user.user.tag}`);
  }

  console.log("Bot role position:", interaction.guild.members.me.roles.highest.position);
  console.log("Target user role position:", user.roles.highest.position);

  try {
    await user.setNickname(resolvedIGN);
    console.log("✅ Nickname set successfully to:", resolvedIGN);
  } catch (err) {
    console.error(`❌ Failed to set nickname for ${user.user.tag}:`, err);
  }

  await interaction.update({
    embeds: [
      new EmbedBuilder()
        .setColor(0x81c784)
        .setDescription(
          `✅ Application handled by **${promotedBy}**.\n\n**IGN:** ${resolvedIGN}\n**User:** <@${userId}>\n**Promoted:** ${timestamp}`
        ),
    ],
    components: [],
  });
}

module.exports = { promoteUser };
