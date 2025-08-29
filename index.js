import { buildApplicationModal } from "./modals/applicationModal.js";
import * as messages from "./messages/userMessages.js";
import { promoteUser } from "./promoteUser.js";

import {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";

import express from "express";
const app = express();
const port = process.env.PORT || 4000;

app.get("/", (_, res) => {
    res.send("👋 Guild Recruiter Bot is running");
});

app.listen(port, () => {
    console.log(`🌐 Dummy web server running on port ${port}`);
});

const config = {
    applicationChannelId: process.env.APPLICATION_CHANNEL_ID,
    officerChannelId: process.env.OFFICER_CHANNEL_ID,
    applicantRoleId: process.env.APPLICANT_ROLE_ID,
    memberRoleId: process.env.MEMBER_ROLE_ID,
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

client.once(Events.ClientReady, async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    const guilds = client.guilds.cache;

    if (!guilds.size) {
        console.error(
            "❌ No guilds found! Make sure the bot is in at least one server."
        );
        return;
    }

    for (const [guildId, guild] of guilds) {
        console.log(`🔁 Initialized for guild: ${guild.name} (${guildId})`);

        try {
            const channel = await client.channels.fetch(
                config.applicationChannelId
            );
            const recentMessages = await channel.messages.fetch({ limit: 10 });

            const existing = recentMessages.find(
                (msg) =>
                    msg.author.id === client.user.id &&
                    msg.content.includes("Ready to join the guild?")
            );

            if (!existing) {
                console.log(`📨 Sending application message in ${guild.name}`);
                await channel.send({
                    content: "Ready to join the guild?",
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("apply_now")
                                .setLabel("📩 Apply to Join")
                                .setStyle(ButtonStyle.Primary)
                        ),
                    ],
                });
            } else {
                console.log(
                    `✅ Application message already exists in ${guild.name}`
                );
            }
        } catch (err) {
            console.warn(
                `⚠️ Could not set up application message in ${guild.name}:`,
                err.message
            );
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    // Apply button click
    if (interaction.isButton() && interaction.customId === "apply_now") {
        try {
            await interaction.showModal(buildApplicationModal());
        } catch (err) {
            console.error("❌ Error showing modal:", err);
            if (err.code === 10062) {
                // Interaction expired or already handled
                try {
                    await interaction.reply({
                        content: "❌ Interaction timed out. Please try again.",
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (replyErr) {
                    console.warn(
                        "⚠️ Could not reply to expired interaction:",
                        replyErr.message
                    );
                }
            }
        }
    }

    // Modal submission
    if (
        interaction.isModalSubmit() &&
        interaction.customId === "submit_application"
    ) {
        // IGN must be 2-32 alphanumeric characters followed by a period and 4 digits

        const rawInput = interaction.fields.getTextInputValue("ign").trim();
        const ign = rawInput.replace(/\s+/g, " ");
        const ignRegex =
            /^[a-zA-Z0-9](?:[a-zA-Z0-9 ]{0,30}[a-zA-Z0-9])?\.\d{4}$/;

        if (!ignRegex.test(ign)) {
            return await interaction.reply({
                content: messages.wrongIGNFormat(),
                flags: MessageFlags.Ephemeral,
            });
        }

        // Defer immediately to avoid interaction timeout (3s limit)
        try {
            await interaction.deferReply({ ephemeral: true });
        } catch (err) {
            console.error("❌ Failed to defer reply:", err);
            return;
        }

        try {
            const member = await interaction.guild.members.fetch(
                interaction.user.id
            );
            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;

            const officerChannel = await client.channels.fetch(
                config.officerChannelId
            );
            const embed = new EmbedBuilder()
                .setTitle("📝 New Guild Application")
                .addFields(
                    { name: "IGN", value: ign },
                    { name: "Discord User", value: interaction.user.tag },
                    { name: "Time", value: timestamp }
                )
                .setColor(0xe57373)
                .setFooter({ text: `User ID: ${interaction.user.id}` });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `copy_${interaction.user.id}_${encodeURIComponent(ign)}`
                    )
                    .setLabel("📋 Copy IGN")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`promote_${interaction.user.id}`)
                    .setLabel("✅ Promote")
                    .setStyle(ButtonStyle.Success)
            );

            await officerChannel.send({
                embeds: [embed],
                components: [actionRow],
            });

            // Assign applicant role
            try {
                await member.roles.add(config.applicantRoleId);
            } catch (err) {
                console.error("Role add error:", err);
            }

            // DM applicant; if DM fails, fall back to showing the message in the ephemeral reply
            let dmSucceeded = true;
            try {
                await member.send(messages.applicationReceived());
            } catch (err) {
                dmSucceeded = false;
                console.error("DM error:", err);
            }

            await interaction.editReply({
                content: dmSucceeded
                    ? "✅ Application submitted!"
                    : messages.applicationReceived(),
            });
        } catch (err) {
            console.error("❌ Error handling modal submit:", err);
            try {
                await interaction.editReply({
                    content:
                        "❌ Something went wrong while submitting your application. Please try again.",
                });
            } catch (editErr) {
                console.error("❌ Failed to edit reply after error:", editErr);
            }
        }
    }

    // Officer promotes
    if (interaction.isButton() && interaction.customId.startsWith("promote_")) {
        await promoteUser(interaction);
    }
    // Officer clicks Copy IGN
    if (interaction.isButton() && interaction.customId.startsWith("copy_")) {
        const parts = interaction.customId.split("_");
        const ign = decodeURIComponent(parts.slice(2).join("_")); // handles underscores

        try {
            // Fast path: try replying directly
            await interaction.reply({
                content: `👍🏻 Copy IGN below:\n\`\`\`\n${ign}\n\`\`\``,
                flags: MessageFlags.Ephemeral,
            });
        } catch (err) {
            if (err.code === 10062) {
                console.warn(
                    "⚠️ Copy button interaction expired before reply."
                );
            } else if (err.code === 40060) {
                // Already acknowledged (rare race) — fallback with followUp
                try {
                    await interaction.followUp({
                        content: `👍🏻 Copy IGN below:\n\`\`\`\n${ign}\n\`\`\``,
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (followErr) {
                    console.error(
                        "❌ Failed followUp for copy button:",
                        followErr
                    );
                }
            } else {
                console.error("❌ Copy button reply failed:", err);
            }
        }
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);
