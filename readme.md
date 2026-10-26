# Telegram Add Member Bot

A Telegram bot that automatically gives a newly added member the
`can_invite_users` administrator permission when the member was:

1. Directly added by a trusted administrator, or
2. Joined using an invite link created by a trusted administrator.

The permission does not propagate when a `can_invite_users` user
adds another member.

## Environment variables

`BOT_TOKEN`
The token obtained from @BotFather.

`TRUSTED_ADMIN_IDS`
Optional comma-separated Telegram user IDs of administrators who
are trusted regardless of their can_invite_users permission

Example:

TRUSTED_ADMIN_IDS=123456789,987654321

## Telegram setup

The bot must be added to the group as an administrator.

It needs permission to add/promote administrators.

The bot should be running continuously because it needs to receive
the `chat_member` updates when users join.

## Running locally

Install dependencies:

    pip install -r requirements.txt

Set the bot token:

    export BOT_TOKEN="YOUR_BOT_TOKEN"

Run:

    python bot.py
