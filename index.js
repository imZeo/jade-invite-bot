const { buildApplicationModal } = require("./modals/applicationModal");
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

const port = process.env.PORT || 4000;
// hi mom!

const EPHEMERAL = 1 << 6;

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
  if (process.env.NODE_ENV === "staging") {
    console.log("🚧 Running in dev mode");
  } else if (process.env.NODE_ENV === "production") {
    console.log("✅ Running in production");
  } else {
    console.log("💻 Running in local mode");
  };

  const applyChannel = await client.channels.fetch(process.env.APPLICATION_CHANNEL_ID);

  await applyChannel.send({
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
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Apply button click
  if (interaction.isButton() && interaction.customId === "apply_now") {
    await interaction.showModal(buildApplicationModal());
  }

  // Modal submission
  if (
    interaction.isModalSubmit() &&
    interaction.customId === "submit_application"
  ) {
    const ign = interaction.fields.getTextInputValue("ign").trim();
    const ignRegex = /^[a-zA-Z0-9]{2,32}\.\d{4}$/;

    if (!ignRegex.test(ign)) {
      return await interaction.reply({
        content:
          "❌ Invalid IGN format.\nPlease click **Apply** again and enter a valid IGN like `zeo.1234`.",
        flags: EPHEMERAL,
      });
    }

    const member = await interaction.guild.members.fetch(client.user.id);
    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    const officerChannel = await client.channels.fetch(
      process.env.OFFICER_CHANNEL_ID,
    );
    const embed = new EmbedBuilder()
      .setTitle("📝 New Guild Application")
      .addFields(
        { name: "IGN", value: ign },
        { name: "Discord User", value: member.user.tag },
        { name: "Time", value: timestamp },
      )
      .setColor(0x00ae86)
      .setFooter({ text: `User ID: ${member.id}` });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`copy_${member.id}_${encodeURIComponent(ign)}`)
        .setLabel("📋 Copy IGN")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`promote_${member.id}`)
        .setLabel("✅ Promote")
        .setStyle(ButtonStyle.Success),
    );

    await officerChannel.send({ embeds: [embed], components: [actionRow] });

    // Assign applicant role
    try {
      await member.roles.add(process.env.APPLICANT_ROLE_ID);
    } catch (err) {
      console.error("Role add error:", err);
    }

    // DM fallback
    try {
      await member.send(
        "✅ Your application has been submitted! Officers will be in touch.",
      );
    } catch {
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
    const userId = interaction.customId.split("_")[1];
    const guild = interaction.guild;
    const user = await guild.members.fetch(client.user.id);

    await user.roles.remove(process.env.APPLICANT_ROLE_ID);
    await user.roles.add(process.env.MEMBER_ROLE_ID);

    const ign = "UNKNOWN"; // fallback
    const parts = interaction.message.embeds[0]?.fields || [];
    const ignField = parts.find((f) => f.name.toLowerCase() === "ign");
    const resolvedIGN = ignField?.value || ign;

    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const promotedBy = interaction.user.tag;

    try {
      await interaction.user.send(
        `📩 DM test: You clicked promote for **${user.user.tag}**`,
      );
    } catch (err) {
      console.warn(`❌ Couldn't DM user ${user.user.tag}`);
    }

    try {
      await user.send(
        `🎉 Congratulations ${user.user.tag}! You've been promoted to member status!`,
      );
    } catch (err) {
      console.warn(`❌ Couldn't DM user ${user.user.tag}`);
    }

    try {
      await user.setNickname(resolvedIGN);
      console.log('✅ Nickname set successfully');
    } catch (err) {
      console.error(`❌ Failed to set nickname for ${user.user.tag}:`, err);
    }

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2ecc71)
          .setDescription(
            `✅ Application handled by **${promotedBy}.\n\n**IGN:** ${resolvedIGN}\n**User:** <@${userId}>\n**Promoted: ${timestamp}`,
          ),
      ],
      components: [],
    });
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
