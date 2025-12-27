import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bot, { startBot as launchTelegramBot } from './telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder (frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Payment bot server is running' });
});

// Webhook endpoint for Telegram (optional, for production)
app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Serve frontend for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the bot
async function startBot() {
  try {
    console.log('🔄 Starting Telegram bot...');
    console.log('📋 Bot token:', process.env.TELEGRAM_BOT_TOKEN ? 'Found ✅' : 'Missing ❌');
    console.log('🔑 OpenAI key:', process.env.OPENAI_API_KEY ? 'Found ✅' : 'Missing ❌');
    console.log('🗄️ Supabase URL:', process.env.VITE_SUPABASE_URL ? 'Found ✅' : 'Missing ❌');
    
    // Start bot in polling mode (for development)
    console.log('⏳ Connecting to Telegram...');
    
    await launchTelegramBot();
    
    console.log('✅ Telegram bot started successfully!');
    console.log('📱 Send messages to your bot to test payment recording');
    console.log('🤖 Bot is now listening for messages...');
  } catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    console.error('💡 Tip: Check your internet connection and bot token');
    console.error('Full error:', error);
    // Don't exit, let the server continue running
    console.log('⚠️ Server will continue running without bot');
  }
}

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startBot();
});

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Stopping bot...');
  bot.stop('SIGTERM');
});
