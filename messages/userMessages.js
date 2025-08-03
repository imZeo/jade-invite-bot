function applicationReceived() {
  return `✅ Your application has been submitted! The officers will review it and get back to you soon.\n\nIf you have any questions, feel free to reach out in #general in the meantime!`;
}

function promotedNotice() {
  return `🎉 You've been promoted to **Member**! Welcome to the guild — we’re super happy to have you :heart: Two more things for you to do:\n\n1. In Guild Wars 2, open your Guild windows (default G) and accept the invite\n2. Head over to [Channels & Roles](https://discord.com/channels/133189975641554944/customize-community) to select what contents interest you the most`; 
}

function officerConfirm(userTag) {
  return `📩 You promoted **${userTag}** to Member.`;
}

function wrongIGNFormat() {
  return `❌ Invalid IGN format.\n\nPlease click **Apply** again and enter a valid IGN like \`Most Powerful Name.1337\`\n\nYour account name is visible on the character select screen in-game. Make sure to include the period and 4-digit number at the end.`;
}


module.exports = {
  applicationReceived,
  promotedNotice,
  officerConfirm,
  wrongIGNFormat
};

