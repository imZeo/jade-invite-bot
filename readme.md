# 🤖 Guild Recruiter Bot

A lightweight Discord bot for handling guild applications with minimal friction. Applicants submit their in-game name (IGN) via a modal, and the bot posts the application in a private officer channel. Officers can promote users via a single button click — no more manual tagging or role juggling.

---

## ✨ Features

- ✅ "Apply to Join" button in a public channel
- 📝 Modal asks for a single field: IGN (e.g., `zeo.1026`)
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

## 🛠 Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/guild-recruiter-bot.git
cd guild-recruiter-bot
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
NODE_ENV=development
```

> ⚠️ Never commit `.env` to version control — add it to your `.gitignore`.

### 4. Start the bot

```bash
npm start
```

Or for staging/prod (with [dotenv-flow](https://www.npmjs.com/package/dotenv-flow)):

```bash
NODE_ENV=production npm start
```

---

## 📦 Dependencies

- [discord.js](https://discord.js.org/) v14+
- [dotenv](https://www.npmjs.com/package/dotenv)
- Optional: [dotenv-flow](https://www.npmjs.com/package/dotenv-flow) for environment-specific config

---

## 🧼 Future Ideas

- ❌ Reject button with custom message
- ⏳ Waitlist or hold status
- 📜 Application logs or audit trail
- 🌍 Web dashboard for reviewing apps
- 🧵 Auto-create threads per application for officer discussion

---

## 🐛 Issues

If you hit a bug or want a new feature, feel free to open an issue or submit a pull request.

---

## 📜 License

MIT – do whatever, but be cool.
