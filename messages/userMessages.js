export function applicationReceived() {
    return `✅ Your application has been submitted! The officers will review it and get back to you soon.\n\nIf you have any questions, feel free to reach out in #general in the meantime!`;
}

export function promotedNotice() {
    return `🎉 You've been promoted to **Member**! Welcome to the guild — we’re super happy to have you :heart: Two more things for you to do:\n\n1. In Guild Wars 2, open your Guild windows (default G) and accept the invite\n2. Head over to [Channels & Roles](https://discord.com/channels/133189975641554944/customize-community) to select what contents interest you the most`;
}

export function officerConfirm(userTag) {
    return `📩 You promoted **${userTag}** to Member.`;
}

export function wrongIGNFormat() {
    return `❌ Invalid IGN format.\n\nPlease click **Apply** again and enter a valid IGN like \`Most Powerful Name.1337\`\n\nYour account name is visible on the [character select screen](https://wiki.guildwars2.com/images/6/63/Character_select_screen_JW.jpg) in-game (marked with 6 on the screenshot). Make sure to include the period and 4-digit number at the end.`;
}

export function officerNudgeDM(officerTag) {
    return `👋 Hey there! A quick heads-up from our officers: please post guild applications using the Apply to Join button in the [application channel](https://discord.com/channels/133189975641554944/1399366113271353477) so we can process them speedily. If you need help, reply here tagging @Officers, and we’ll guide you. Thanks!`;
}

export function officerNudgePublic(officerTag, targetUserId) {
    return `👋 Hey <@${targetUserId}>! An ask from the Jade officers: please use the Apply to Join button in the <#1399366113271353477> channel so we can process you harder, better, faster, stronger. If you need help, tag the officers and we'll guide you. Thanks!`;
}
