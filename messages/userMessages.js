function applicationReceived(userTag) {
  return `✅ Your application has been submitted! Officers will review it soon, ${userTag}.`;
}

function promotedNotice() {
  return `🎉 You've been promoted to **Member**! Welcome to the guild — we’re glad to have you.`;
}

function officerConfirm(userTag) {
  return `📩 You promoted **${userTag}** to Member.`;
}

module.exports = {
  applicationReceived,
  promotedNotice,
  officerConfirm
};

