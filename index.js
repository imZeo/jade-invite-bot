const { buildApplicationModal } = require("./modals/applicationModal");
const messages = require("./messages/userMessages");
const { promoteUser } = require("./promoteUser");

require("dotenv-flow").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require("discord.js");

const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/', (_, res) => {
  res.send('👋 Guild Recruiter Bot is running');
});

app.listen(port, () => {
  console.log(`🌐 Dummy web server running on port ${port}`);
});


// hi mom!

const EPHEMERAL = 1 << 6;

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
    console.error("❌ No guilds found! Make sure the bot is in at least one server.");
    return;
  }

  for (const [guildId, guild] of guilds) {
    console.log(`🔁 Initialized for guild: ${guild.name} (${guildId})`);

    try {
      const channel = await client.channels.fetch(config.applicationChannelId);
      const messages = await channel.messages.fetch({ limit: 10 });

      const existing = messages.find(
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
                .setStyle(ButtonStyle.Primary),
            ),
          ],
        });
      } else {
        console.log(`✅ Application message already exists in ${guild.name}`);
      }

    } catch (err) {
      console.warn(`⚠️ Could not set up application message in ${guild.name}:`, err.message);
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
    if (err.code === 10062) { // Interaction expired or already handled
      try {
        await interaction.reply({
          content: "❌ Interaction timed out. Please try again.",
          flags: EPHEMERAL,
        });
      } catch (replyErr) {
        console.warn("⚠️ Could not reply to expired interaction:", replyErr.message);
      }
    }
  }
}

  // Modal submission
  if (
    interaction.isModalSubmit() &&
    interaction.customId === "submit_application"
  ) {
    const ign = interaction.fields.getTextInputValue("ign").trim();
    // IGN must be 2-32 alphanumeric characters followed by a period and 4 digits
    const ignRegex = /^[a-zA-Z0-9]{2,32}\.\d{4}$/;

    if (!ignRegex.test(ign)) {
      return await interaction.reply({
        content:
          "❌ Invalid IGN format.\nPlease click **Apply** again and enter a valid IGN like `zeo.1234`.\n Your account name is visible on the character select screen in-game. Make sure to include the period and 4-digit number at the end.\n\nExample: `zeo.1234`",
        flags: EPHEMERAL,
      });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    const officerChannel = await client.channels.fetch(config.officerChannelId);
    const embed = new EmbedBuilder()
      .setTitle("📝 New Guild Application")
      .addFields(
        { name: "IGN", value: ign },
        { name: "Discord User", value: interaction.user.tag },
        { name: "Time", value: timestamp },
      )
      .setColor(0xe57373)
      .setFooter({ text: `User ID: ${interaction.user.id}` });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`copy_${interaction.user.id}_${encodeURIComponent(ign)}`)
        .setLabel("📋 Copy IGN")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`promote_${interaction.user.id}`)
        .setLabel("✅ Promote")
        .setStyle(ButtonStyle.Success),
    );

    await officerChannel.send({ embeds: [embed], components: [actionRow] });

    // Assign applicant role
    try {
      await member.roles.add(config.applicantRoleId);
    } catch (err) {
      console.error("Role add error:", err);
    }

    // DM fallback
    try {
      await member.send(
        "✅ Your application has been submitted! Officers will be in touch."
      );
    } catch (err) {
      console.error("DM error:", err);
      await interaction.reply({
        content: "✅ Application received! Officers will reach out soon.",
        flags: EPHEMERAL,
      });
    }

    if (!interaction.replied)
      await interaction.reply({
        content: "✅ Application submitted!",
        flags: EPHEMERAL,
      });
  }

  // Officer promotes
  if (interaction.isButton() && interaction.customId.startsWith("promote_")) {
    await promoteUser(interaction);
  }
  // Officer clicks Copy IGN
  if (interaction.customId.startsWith("copy_")) {
    const parts = interaction.customId.split("_");
    const ign = decodeURIComponent(parts.slice(2).join("_")); // handles underscores

    await interaction.reply({
      content: `👍🏻 Copy IGN below:\n\`\`\`\n${ign}\n\`\`\``,
      flags: EPHEMERAL,
    });
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
