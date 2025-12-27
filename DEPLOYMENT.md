# 🚀 Railway Deployment Guide

## Quick Deploy (5 minutes)

### 1. Deploy on Railway

1. Go to **[railway.app](https://railway.app)**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `johnjoel2001/Dummy_Invoices_App`
5. Railway will automatically start building

### 2. Add Environment Variables

In Railway dashboard → **Variables** tab, add these:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

**Get your keys from:**
- **Supabase**: Project Settings → API
- **Telegram**: @BotFather in Telegram
- **OpenAI**: platform.openai.com/api-keys

### 3. Deploy!

Railway will:
1. ✅ Install dependencies
2. ✅ Build React frontend (`npm run build`)
3. ✅ Start Express server (`node server/index.js`)
4. ✅ Serve frontend at Railway URL
5. ✅ Start Telegram bot

### 4. Access Your App

**Frontend**: `https://your-app.railway.app`
- Invoice management interface
- Create/view/download invoices
- Record payments

**Telegram Bot**: Already running!
- Send: "Customer paid 1000"
- Bot responds with payment method selection
- Payments recorded in Supabase

## What Gets Deployed

✅ **React Frontend** - Invoice management UI
✅ **Express Backend** - Serves static files
✅ **Telegram Bot** - 24/7 payment recording
✅ **Supabase Integration** - Database operations

## Deployment Flow

```
Railway Build:
1. npm install          → Install all dependencies
2. npm run build        → Build React app to /dist
3. npm run start:prod   → Start Express + Bot

Express Server:
- Serves /dist files    → Frontend accessible
- Runs Telegram bot     → Bot listening
- API endpoints         → /health, /webhook
```

## Verify Deployment

### Check Logs
Railway → Deployments → View Logs

Expected output:
```
✅ Frontend built successfully
🚀 Server running on port 3001
✅ Connected to bot: @Payment_Dummy_Bot
✅ Bot is now active and listening!
```

### Test Frontend
1. Open: `https://your-app.railway.app`
2. Should see: "Dummy Invoice Generator"
3. Create invoice, download PDF

### Test Bot
1. Open Telegram
2. Find your bot
3. Send: "Joel paid 3000"
4. Should get payment method buttons

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify Supabase URL is correct
- Check Railway logs for specific errors

### Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check bot is not running elsewhere
- Ensure `OPENAI_API_KEY` is valid

### Frontend Not Loading
- Check build completed successfully
- Verify `/dist` folder was created
- Check Railway logs for Express errors

## Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Railway auto-deploys on push! 🚀

## Cost

**Railway Free Tier:**
- $5 credit/month
- Suitable for testing
- Upgrade to Pro for production

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Telegram Bot API: [core.telegram.org/bots](https://core.telegram.org/bots)

---

**Stack:**
- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + Express
- Bot: Telegraf
- Database: Supabase
- AI: OpenAI GPT-4o-mini
- Hosting: Railway
