# Telegram Payment Bot Setup Guide

## Overview

This AI-powered Telegram bot automatically records payments when your employees send messages like:
- "Joel paid 3000"
- "Received 5000 from ABC Company"
- "John Doe payment 1500"

The bot will:
1. Parse the message using OpenAI
2. Find the matching customer in your database
3. Find their unpaid invoices
4. Record the payment automatically
5. Update the invoice status (Paid/Partial)

---

## Prerequisites

1. ✅ Supabase database set up (already done)
2. ⬜ Telegram Bot Token
3. ⬜ OpenAI API Key

---

## Step 1: Create Telegram Bot

### 1.1 Open Telegram and find BotFather
- Search for `@BotFather` in Telegram
- Start a chat with BotFather

### 1.2 Create your bot
```
/newbot
```

### 1.3 Follow the prompts
- **Bot name:** Safetex Payment Bot (or any name you like)
- **Bot username:** Must end with 'bot' (e.g., `safetex_payment_bot`)

### 1.4 Save your token
BotFather will give you a token like:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```
**Keep this secret!**

---

## Step 2: Get OpenAI API Key

### 2.1 Go to OpenAI Platform
- Visit: https://platform.openai.com/api-keys
- Sign in or create an account

### 2.2 Create API Key
- Click "Create new secret key"
- Name it: "Safetex Payment Bot"
- Copy the key (starts with `sk-...`)
- **Save it immediately** (you can't see it again!)

### 2.3 Add Credits (if needed)
- Go to: https://platform.openai.com/account/billing
- Add payment method
- Add at least $5 credit

**Cost:** ~$0.001 per payment message (very cheap!)

---

## Step 3: Configure Environment Variables

Update your `.env` file:

```env
# Supabase Configuration (already set)
VITE_SUPABASE_URL=https://vezyaqubvudxplcpifpv.supabase.co
VITE_SUPABASE_ANON_KEY=your_existing_key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...your_openai_key...

# Server Configuration
PORT=3001
```

---

## Step 4: Start the Bot

### 4.1 Open a new terminal

### 4.2 Run the bot
```bash
npm run bot
```

You should see:
```
🚀 Server running on port 3001
✅ Telegram bot started successfully!
📱 Send messages to your bot to test payment recording
```

---

## Step 5: Test the Bot

### 5.1 Find your bot in Telegram
- Search for your bot username (e.g., `@safetex_payment_bot`)
- Click "Start"

### 5.2 Send test message
```
/start
```

You should get a welcome message!

### 5.3 Test payment recording

**First, make sure you have:**
- A customer in your app (e.g., "Joel")
- An unpaid invoice for that customer

**Then send:**
```
Joel paid 3000
```

**Bot will respond with:**
```
✅ Payment Recorded!

👤 Customer: Joel
💰 Amount: Rs. 3000.00
📄 Invoice: INV-001
💵 Invoice Total: Rs. 5000.00
💳 Amount Paid: Rs. 3000.00
📊 Balance: Rs. 2000.00
📈 Status: Partial

⏳ Partial payment recorded
```

---

## How to Use

### Supported Message Formats

The AI understands natural language! Try any of these:

```
✅ "Joel paid 3000"
✅ "Received 5000 from ABC Company"
✅ "John Doe payment 1500"
✅ "Got Rs 2000 from Joel"
✅ "ABC Company paid 10000"
✅ "Payment of 3500 from John"
```

### Bot Commands

- `/start` - Welcome message and instructions
- `/help` - Show help and examples

---

## How It Works

### 1. Message Received
Employee sends: "Joel paid 3000"

### 2. AI Parsing (OpenAI)
```json
{
  "customerName": "Joel",
  "amount": 3000
}
```

### 3. Customer Matching
- Searches Supabase for customer name
- Uses fuzzy matching (case-insensitive)
- Finds: "Joel" or "Joel Smith" or "joel"

### 4. Invoice Finding
- Gets all invoices for that customer
- Filters for unpaid/partial invoices
- Sorts by date (newest first)

### 5. Payment Recording
- Adds payment to invoice
- Recalculates totals
- Updates status: Unpaid → Partial → Paid
- Saves to Supabase

### 6. Confirmation
- Sends detailed confirmation message
- Shows invoice details
- Shows new balance and status

---

## Running in Production

### Keep Bot Running 24/7

#### Option 1: Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start server/index.js --name payment-bot

# Save configuration
pm2 save

# Set to start on system boot
pm2 startup
```

#### Option 2: Using systemd (Linux)
Create `/etc/systemd/system/payment-bot.service`:
```ini
[Unit]
Description=Safetex Payment Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/Dummy_Invoices_App
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable payment-bot
sudo systemctl start payment-bot
```

---

## Troubleshooting

### Bot not responding
1. Check bot is running: `npm run bot`
2. Check token is correct in `.env`
3. Check internet connection

### "Customer not found"
1. Make sure customer exists in app
2. Check spelling matches exactly
3. Try full name if using nickname

### "No unpaid invoices"
1. Check customer has invoices
2. Check invoices aren't already paid
3. Create a new invoice for testing

### OpenAI errors
1. Check API key is valid
2. Check you have credits
3. Check API key has correct permissions

### Supabase errors
1. Check RLS policies allow anon access
2. Check connection URL is correct
3. Check tables exist

---

## Security Best Practices

### 1. Restrict Bot Access
- Only share bot with trusted employees
- Don't post bot username publicly

### 2. Protect API Keys
- Never commit `.env` to git
- Use environment variables in production
- Rotate keys regularly

### 3. Monitor Usage
- Check OpenAI usage dashboard
- Monitor Supabase logs
- Set up billing alerts

### 4. Add Authentication (Optional)
You can add user verification:
```javascript
const ALLOWED_USERS = [123456789, 987654321]; // Telegram user IDs

bot.use((ctx, next) => {
  if (ALLOWED_USERS.includes(ctx.from.id)) {
    return next();
  }
  ctx.reply('❌ Unauthorized. Contact admin.');
});
```

---

## Advanced Features (Future)

### 1. Multiple Invoice Selection
If customer has multiple unpaid invoices, let user choose

### 2. Payment Confirmation
Ask for confirmation before recording

### 3. Receipt Upload
Allow uploading payment screenshots

### 4. Payment Reports
Generate daily/weekly payment summaries

### 5. Notifications
Alert when large payments received

---

## Cost Estimation

### OpenAI (GPT-4o-mini)
- ~$0.001 per message
- 1000 messages = $1
- Very affordable!

### Telegram
- **FREE!** No costs

### Supabase
- Free tier: 500MB database
- Should be enough for small business

**Total monthly cost:** ~$5-10 for moderate usage

---

## Support

### Need Help?
1. Check this guide
2. Check bot logs: `npm run bot`
3. Check Supabase logs
4. Check OpenAI dashboard

### Common Issues
- Bot offline → Restart: `npm run bot`
- Wrong customer → Check spelling
- No response → Check API keys

---

## Quick Start Checklist

- [ ] Create Telegram bot with BotFather
- [ ] Get bot token
- [ ] Get OpenAI API key
- [ ] Add keys to `.env` file
- [ ] Run `npm run bot`
- [ ] Test with `/start` command
- [ ] Test payment recording
- [ ] Share bot with employees
- [ ] Set up PM2 for 24/7 running

---

**You're all set! Your AI payment bot is ready to use! 🎉**

Send "Joel paid 3000" to your bot and watch the magic happen! ✨
