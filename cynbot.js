require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN environment variable is required");
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    params: {
      allowed_updates: ["chat_member"],
    },
  },
});

// ---------------------------------------------------------
// Logging
// ---------------------------------------------------------

function logInfo(...args) {
  console.log(new Date().toISOString(), "INFO:", ...args);
}

function logWarning(...args) {
  console.warn(new Date().toISOString(), "WARNING:", ...args);
}

function logError(...args) {
  console.error(new Date().toISOString(), "ERROR:", ...args);
}

// ---------------------------------------------------------
// Check whether the source user is a trusted administrator.
//
// The group owner always qualifies.
// Other administrators qualify only if they can promote
// members (can_promote_members).
// ---------------------------------------------------------

async function isTrusted(chatId, userId) {
  try {
    const member = await bot.getChatMember(chatId, userId);

    // Group owner always qualifies.
    if (member.status === "creator") {
      return true;
    }

    // Only administrators allowed to promote members qualify.
    if (member.status === "administrator") {
      return member.can_promote_members === true;
    }

    return false;
  } catch (error) {
    logWarning(
      `Could not check admin ${userId} in chat ${chatId}:`,
      error.message
    );

    return false;
  }
}

// ---------------------------------------------------------
// Handle changes to chat membership.
// ---------------------------------------------------------

async function handleMemberUpdate(change) {
  try {
    if (!change || !change.old_chat_member || !change.new_chat_member) {
      return;
    }

    const oldStatus = change.old_chat_member.status;
    const newMember = change.new_chat_member;
    const newStatus = newMember.status;

    // Only handle users who were previously out of the group.
    if (!["left", "kicked"].includes(oldStatus)) {
      return;
    }

    // Only handle actual joins or additions.
    if (!["member", "restricted", "administrator"].includes(newStatus)) {
      return;
    }

    const chatId = change.chat.id;
    const newUser = newMember.user;

    // Never promote bots.
    if (newUser.is_bot) {
      return;
    }

    let sourceUserId = null;
    let sourceDescription = null;

    // -------------------------------------------------------
    // CASE 1: A user was directly added.
    // -------------------------------------------------------

    if (!change.invite_link) {
      if (!change.from) {
        return;
      }

      sourceUserId = change.from.id;
      sourceDescription = "directly added by an admin";
    }

    // -------------------------------------------------------
    // CASE 2: A user joined using an invite link.
    // -------------------------------------------------------

    else {
      if (!change.invite_link.creator) {
        return;
      }

      sourceUserId = change.invite_link.creator.id;
      sourceDescription = "joined using an admin-created invite link";
    }

    if (sourceUserId == null) {
      return;
    }

    // Verify that the source user is trusted.
    const trusted = await isTrusted(chatId, sourceUserId);

    if (!trusted) {
      logInfo(
        `Not granting can_invite_users to ${newUser.first_name} ` +
          `(${newUser.id}): source ${sourceUserId} is not trusted.`
      );

      return;
    }

    // -------------------------------------------------------
    // Grant only can_invite_users.
    // All other administrator permissions are disabled.
    // -------------------------------------------------------

    await bot.promoteChatMember(chatId, newUser.id, {
      is_anonymous: false,
      can_manage_chat: false,
      can_change_info: false,
      can_post_messages: false,
      can_edit_messages: false,
      can_delete_messages: false,
      can_invite_users: true,
      can_restrict_members: false,
      can_pin_messages: false,
      can_promote_members: false,
      can_manage_video_chats: false,
      can_manage_topics: false,
      can_post_stories: false,
      can_edit_stories: false,
      can_delete_stories: false,
      can_manage_direct_messages: false,
      can_manage_tags: false,
    });

    logInfo(
      `Granted can_invite_users to ${newUser.first_name} ` +
        `(${newUser.id}) - ${sourceDescription}`
    );
  } catch (error) {
    const user = change?.new_chat_member?.user;

    logError(
      `Failed to process member update for ${
        user ? `${user.first_name} (${user.id})` : "unknown user"
      }:`,
      error.message
    );
  }
}

// ---------------------------------------------------------
// Listen for chat member status updates.
// ---------------------------------------------------------

bot.on("chat_member", handleMemberUpdate);

bot.on("polling_error", (error) => {
  logError("Polling error:", error.message);
});

logInfo("Telegram invite bot is running.");