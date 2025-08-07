const { EmbedBuilder } = require("discord.js");
const messages = require("./messages/userMessages");

async function safeDMHelper(user, message) {
    try {
        await user.send(message);
    } catch (err) {
        console.warn(`❌ Couldn't DM user ${userTag}`);
    }
}

async function promoteUser(interaction) {
    const userId = interaction.customId.split("_")[1];
    const guild = interaction.guild;
    const user = await guild.members.fetch(userId);
    const userTag = user.user.tag;

    // Get role IDs from environment variables
    const applicantRoleId = process.env.APPLICANT_ROLE_ID;
    const memberRoleId = process.env.MEMBER_ROLE_ID;

    try {
        await user.roles.remove(applicantRoleId);
        await user.roles.add(memberRoleId);
    } catch (err) {
        console.error("❌ Role assignment failed:", err);
    }

    const embedFields = interaction.message.embeds[0]?.fields || [];
    const ignField = embedFields.find((f) => f.name.toLowerCase() === "ign");
    const resolvedIGN = ignField?.value || "UNKNOWN";

    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const promotedBy = interaction.user.tag;

    await safeDMHelper(interaction.user, messages.officerConfirm(userTag));
    await safeDMHelper(user, messages.promotedNotice());

    console.log(
        "Bot role position:",
        interaction.guild.members.me.roles.highest.position
    );
    console.log("Target user role position:", user.roles.highest.position);

    if (
        interaction.guild.members.me.roles.highest.position >
        user.roles.highest.position
    ) {
        console.log("✅ Bot has permission to set nickname.");
        user.setNickname(resolvedIGN).catch((err) => {
            console.error(`❌ Failed to set nickname for ${userTag}:`, err);
        });
    } else {
        console.warn(
            "❌ Bot does not have permission to set nickname for this user."
        );
    }

    try {
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
    } catch (err) {
        console.error("❌ Failed to update interaction message:", err);
    }
}

module.exports = { promoteUser };
