import { Events } from "discord.js";
import * as messages from "../messages/userMessages.js";

// Simple in-memory rate-limit per message ID
const rateMap = new Map();

function emojiMatches(reaction, configured) {
    if (!configured) return false;
    // Trim surrounding colons from shortcode like :mailbox:
    const cfg = configured.trim();
    const short =
        cfg.startsWith(":") && cfg.endsWith(":") ? cfg.slice(1, -1) : cfg;

    // Custom emoji ID (numeric string)
    if (/^\d+$/.test(short)) {
        return reaction.emoji.id === short;
    }

    // Unicode emoji: compare by name (unicode char) or shortcode contained in reaction name (best effort)
    if (reaction.emoji.name === cfg || reaction.emoji.name === short)
        return true;
    return false;
}

export function initReactionNudge(
    client,
    { officerRoleId, reactionDmEmoji, windowMs = 10 * 60 * 1000 }
) {
    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        try {
            // Fetch partials if needed
            if (reaction.partial) await reaction.fetch();
            if (reaction.message.partial) await reaction.message.fetch();

            // Only in guild channels
            const guild = reaction.message.guild;
            if (!guild) return;

            // Ignore bot reactors
            if (user.bot) return;

            // Emoji match
            if (!emojiMatches(reaction, reactionDmEmoji)) return;

            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

            // Permission: must have officer role
            if (!member.roles.cache.has(officerRoleId)) return;

            const targetUser = reaction.message.author;
            if (!targetUser || targetUser.bot) return;

            const messageId = reaction.message.id;
            const now = Date.now();
            const last = rateMap.get(messageId) || 0;
            if (now - last < windowMs) return; // rate limited

            // Public channel reply
            try {
                const replyContent = messages.officerNudgePublic(
                    member.user.tag,
                    targetUser.id
                );
                await reaction.message.reply({ content: replyContent });
                rateMap.set(messageId, now);
                // Acknowledge by re-reacting (idempotent)
                await reaction.message.react(reactionDmEmoji).catch(() => {});
                console.log(
                    `💬 Nudge message posted for ${targetUser.tag} by ${member.user.tag}`
                );
            } catch (postErr) {
                console.warn(
                    `❌ Couldn't post public nudge for ${targetUser.tag}:`,
                    postErr.message
                );
            }
        } catch (err) {
            console.error("❌ Reaction nudge handler error:", err);
        }
    });
}
