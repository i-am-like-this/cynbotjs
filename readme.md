Telegram Trusted Invite Bot

A Node.js Telegram bot that automatically grants the can_invite_users permission to new members when they are added by a trusted administrator or join using a trusted administrator's invite link.

The bot verifies the source administrator before granting permissions and does not allow newly promoted members to promote other administrators.
Features

    Trusted administrator verification — the group owner is always trusted. Other administrators must have can_promote_members.
    Direct additions — checks the administrator who added the new member.
    Invite links — checks the creator of the invite link used to join.
    Minimal permissions — grants can_invite_users while disabling other administrator permissions.
    Bot exclusion — ignores new members that are bots.
    Safe failure handling — if the source administrator cannot be verified, no permission is granted.
    Nixpacks deployment — designed to run on Node.js hosting platforms such as Apply.build.

Requirements

    Node.js 20 or later
    npm
    A Telegram bot token from @BotFather
    A Telegram group or supergroup where the bot has sufficient administrator privileges
    A hosting platform that supports persistent Node.js processes

Project Structure
text

.
├── bot.js
├── package.json
├── package-lock.json
├── .gitignore
├── nixpacks.toml       # Optional
└── README.md

Installation

Clone your repository and install the dependencies:
bash

npm install

The required packages are:

    node-telegram-bot-api — Telegram Bot API client
    dotenv — loads environment variables from a local .env file

Configuration

The bot requires the BOT_TOKEN environment variable.
Local development

Create a .env file in the project root:
env

BOT_TOKEN=your_telegram_bot_token

Replace the placeholder with your actual token.

Start the bot:
bash

npm start

Alternatively, run it directly:
bash

node bot.js

Do not commit .env or expose your bot token publicly.
Telegram Setup
1. Create a bot

Create a bot through @BotFather and copy its API token.
2. Add the bot to your group

Add the bot to the target Telegram group or supergroup.
3. Grant administrator permissions

The bot needs sufficient permissions to inspect membership and promote members. In particular, it must be allowed to invite users and promote members.
4. Configure updates

The bot uses Telegram long polling and requests chat_member updates to detect membership changes.

No public webhook URL is required.
How It Works

When a membership update is received, the bot:

    Checks whether the user was previously left or kicked.
    Confirms the new status is member, restricted, or administrator.
    Ignores bots.
    Identifies the source:
        For a direct addition, it checks the user who performed the action.
        For an invite-link join, it checks the invite link's creator.
    Verifies that the source is the group owner or an administrator with can_promote_members.
    Grants can_invite_users to the new member if the source is trusted.

If the source is untrusted or cannot be verified, the bot does not grant the permission.
Permission Policy

The bot attempts to grant only the permission to invite users.
Permission	Setting
Invite users	Enabled
Promote administrators	Disabled
Manage chat	Disabled
Change group information	Disabled
Post or edit messages	Disabled
Delete messages	Disabled
Restrict members	Disabled
Pin messages	Disabled
Manage video chats	Disabled
Manage topics	Disabled
Manage stories	Disabled

Telegram may impose additional permission requirements depending on the group configuration and the bot's own administrator rights.
Deploying to Apply.build with Nixpacks
1. Push the project to your Git repository

Ensure the repository contains:

    bot.js
    package.json
    package-lock.json
    .gitignore

2. Create a deployment

Connect your repository to Apply.build and select the Node.js application.

Nixpacks should automatically detect the Node.js project and install its dependencies.
3. Configure the environment variable

In your Apply.build service settings, add:
Variable	Value
BOT_TOKEN	Your actual Telegram bot token

Do not include the token in your source code or commit it to Git.
4. Configure the start command

Use:
bash

npm start

Ensure package.json includes:
json

{
  "scripts": {
    "start": "node bot.js"
  }
}

5. Deploy and check the logs

On successful startup, the application should log:
text

INFO: Telegram invite bot is running.

The bot must remain running continuously to receive membership updates.
Optional Nixpacks configuration

If you want to specify the start command explicitly, create nixpacks.toml:
toml

[start]
cmd = "npm start"

This file is optional because Nixpacks can generally detect the Node.js project and its start script automatically.
Logging and Troubleshooting
The bot does not start

    Verify that BOT_TOKEN is configured.
    Check that dependencies are installed.
    Review the deployment logs for startup errors.

The bot receives no membership updates

    Confirm that the bot is in the correct group.
    Check that the application is running.
    Verify that chat_member updates are enabled in the polling configuration.
    Ensure another running instance is not polling with the same bot token.

The bot cannot promote a member

    Verify the bot's administrator status and permissions.
    Check Telegram's restrictions on administrator promotion.
    Review the application logs for the API error.

A member is not granted invite permissions

    Confirm the source administrator is trusted.
    For invite-link joins, remember that trust is based on the creator of the invite link.
    Check the logs for source verification failures or promotion errors.

Important Notes

    Invite-link attribution: Telegram identifies the creator of the invite link, which may not be the person who shared it.
    Permission constraints: Telegram may reject a promotion if the bot lacks the necessary rights or the requested permission combination is invalid.
    Single polling instance: Run only one active polling instance per bot token to avoid conflicts.
    Persistent hosting: The deployment must support a continuously running process. A short-lived serverless execution environment is not suitable without additional changes.
    No HTTP server required: The bot uses long polling and does not need an exposed web port.

Security

    Keep your bot token private.
    Store production secrets in your hosting platform's environment-variable settings.
    Never commit .env or other files containing secrets.
    Review administrator permissions before deploying the bot to a production group.

License

Choose a license appropriate for your project before distributing or reusing this code.
