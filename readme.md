# 🤖 Guild Recruiter Bot

A lightweight Discord bot for handling guild applications with minimal friction. Applicants submit their in-game name (IGN) via a modal, and the bot posts the application in a private officer channel. Officers can promote users via a single button click — way less manual work.

---

## ✨ Features

- ✅ "Apply to Join" button in a public channel
  - 📝 Modal asks for a single field (with validation): IGN (e.g., `zeo.1026`)
- 🔒 Application is sent to a private officer channel with:
  - Discord username
  - Submitted IGN
  - Timestamp (UTC)
  - ✅ Promote button
- 🤖 Auto-assigns applicant role
- 📬 Sends DM to the applicant (or falls back to ephemeral message)
- 👮‍♂️ Officers can promote applicants with one click
- 🧙‍♂️ Promoting assigns the member role and removes the applicant role
- 💌 Promoted user is notified via DM

---

## 🛠 Setup (Local Development)

### 0. Create a Discord Bot
Follow the official guide to create a bot and get your token:  
👉 [Discord Developer Portal – Creating a Bot](https://discord.com/developers/docs/getting-started). Make sure to invite the bot to your server with the necessary permissions (Manage Roles, Read Messages, Send Messages, etc.).

### 1. Clone the repo

```bash
gh repo clone imZeo/jade-invite-bot
cd jade-invite-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
DISCORD_TOKEN=your-bot-token
GUILD_ID=your-guild-id
APPLICANT_ROLE_ID=role-id-for-applicant
MEMBER_ROLE_ID=role-id-for-member
OFFICER_CHANNEL_ID=channel-id-for-officer-apps
APPLICATION_CHANNEL_ID=channel-id-for-public-applications
```

> 💡 Use [Discord Developer Mode](https://discordjs.guide/popular-topics/intents.html#enabling-privileged-intents) to find channel/role IDs.

### 4. Start the bot

```bash
npm start
```

---

## 📁 File Overview

```
.
├── index.js                  # Main bot logic
├── promoteUser.js            # Handles promote button click
├── /messages
│   └── userMessages.js       # All user-facing text
├── /modals
│   └── applicationModal.js   # The modal logic
└── README.md
```

---

## 🧼 Future Ideas

- ✅ Move accepted applications to a separate thread

---

## 🐛 Issues

If you hit a bug or want a new feature, feel free to open an issue or submit a pull request. 

---

## 📜 License

Unilicense. Do whatever you want with it, no strings attached.
