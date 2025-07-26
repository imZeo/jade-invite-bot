const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

function buildApplicationModal() {
  return new ModalBuilder()
    .setCustomId('submit_application')
    .setTitle('Guild Application')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ign')
          .setLabel('Enter your in-game name (e.g., zeo.1026)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
}

module.exports = { buildApplicationModal };

